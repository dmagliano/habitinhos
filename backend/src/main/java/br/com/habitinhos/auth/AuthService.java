package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.AuthResponse;
import br.com.habitinhos.auth.dto.DeleteAccountConfirmRequest;
import br.com.habitinhos.auth.dto.DeleteAccountRequest;
import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.MeResponse;
import br.com.habitinhos.auth.dto.PasswordResetConfirmRequest;
import br.com.habitinhos.auth.dto.PasswordResetRequest;
import br.com.habitinhos.auth.dto.PermanentDeletionRequest;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetConfirmRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetRequest;
import br.com.habitinhos.auth.dto.VerifyResponsiblePinRequest;
import br.com.habitinhos.family.FamilyUnit;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.shared.error.BadRequestException;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.shared.error.UnauthorizedException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);
  private static final long RESET_TOKEN_EXPIRATION_MINUTES = 30;
  private static final int RESET_CODE_LENGTH = 6;
  private static final int RESET_CODE_GENERATION_ATTEMPTS = 10;
  private static final char[] RESET_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

  private final AppUserRepository appUserRepository;
  private final AuthResetTokenRepository authResetTokenRepository;
  private final FamilyUnitRepository familyUnitRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AccountEmailSender accountEmailSender;
  private final Clock clock;
  private final SecureRandom secureRandom;

  public AuthService(
      AppUserRepository appUserRepository,
      AuthResetTokenRepository authResetTokenRepository,
      FamilyUnitRepository familyUnitRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      AccountEmailSender accountEmailSender) {
    this.appUserRepository = appUserRepository;
    this.authResetTokenRepository = authResetTokenRepository;
    this.familyUnitRepository = familyUnitRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.accountEmailSender = accountEmailSender;
    this.clock = Clock.systemUTC();
    this.secureRandom = new SecureRandom();
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = normalizeEmail(request.email());
    if (appUserRepository.existsByEmailIgnoreCaseAndActiveTrue(email)) {
      log.warn("Register blocked: email already registered");
      throw new ConflictException("EMAIL_ALREADY_REGISTERED", "E-mail já cadastrado.");
    }

    FamilyUnit family = familyUnitRepository.saveAndFlush(new FamilyUnit(request.familyName().trim()));
    AppUser user = new AppUser(
        family.getId(),
        request.name().trim(),
        email,
        UserRole.RESPONSIBLE,
        passwordEncoder.encode(request.password()),
        passwordEncoder.encode(request.responsiblePin()));
    appUserRepository.saveAndFlush(user);
    log.info("Register succeeded: userId={} familyUnitId={}", user.getId(), family.getId());

    try {
      accountEmailSender.sendWelcome(user.getEmail(), user.getName(), family.getName());
    } catch (RuntimeException exception) {
      log.warn("Welcome email failed after registration: userId={}", user.getId(), exception);
    }

    return toAuthResponse(user, family);
  }

  @Transactional(readOnly = true)
  public void verifyResponsiblePin(CurrentUser currentUser, VerifyResponsiblePinRequest request) {
    log.debug("Verifying responsible PIN for userId={} familyUnitId={}", currentUser.userId(), currentUser.familyUnitId());
    AppUser user = appUserRepository.findById(currentUser.userId())
        .filter(AppUser::isActive)
        .filter(found -> found.getRole() == UserRole.RESPONSIBLE)
        .orElseThrow(() -> new ForbiddenException(
            "RESPONSIBLE_ACCESS_DENIED",
            "Acesso do responsável não permitido."));

    if (user.getResponsiblePinHash() == null || !passwordEncoder.matches(request.pin(), user.getResponsiblePinHash())) {
      log.warn("Responsible PIN rejected for userId={} familyUnitId={}", currentUser.userId(), currentUser.familyUnitId());
      throw new ForbiddenException("INVALID_RESPONSIBLE_PIN", "PIN inválido. Tente novamente.");
    }
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    String email = normalizeEmail(request.email());
    log.debug("Login request processing");
    AppUser user = appUserRepository.findByEmailIgnoreCaseAndActiveTrue(email)
        .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
        .orElseThrow(() -> new UnauthorizedException(
            "INVALID_CREDENTIALS",
            "E-mail ou senha inválidos."));

    FamilyUnit family = familyUnitRepository.findById(user.getFamilyUnitId())
        .filter(FamilyUnit::isActive)
        .orElseThrow(() -> new UnauthorizedException(
            "INVALID_CREDENTIALS",
            "E-mail ou senha inválidos."));
    log.info("Login succeeded: userId={} familyUnitId={}", user.getId(), family.getId());

    return toAuthResponse(user, family);
  }

  @Transactional
  public void requestPasswordReset(PasswordResetRequest request) {
    String email = normalizeEmail(request.email());
    appUserRepository.findByEmailIgnoreCaseAndActiveTrue(email)
        .ifPresentOrElse(
            user -> {
              IssuedResetToken issuedToken = issueResetToken(user, AuthResetPurpose.PASSWORD);
              accountEmailSender.sendPasswordReset(user.getEmail(), issuedToken.rawToken(), issuedToken.expiresAt());
              log.info("Password reset token issued for userId={}", user.getId());
            },
            () -> log.info("Password reset requested for unknown email"));
  }

  @Transactional
  public void confirmPasswordReset(PasswordResetConfirmRequest request) {
    AuthResetToken resetToken = findUsableResetToken(request.token(), AuthResetPurpose.PASSWORD);
    AppUser user = appUserRepository.findById(resetToken.getUserId())
        .filter(AppUser::isActive)
        .orElseThrow(this::invalidResetToken);

    user.changePassword(passwordEncoder.encode(request.newPassword()));
    resetToken.markUsed(Instant.now(clock));
    log.info("Password reset completed for userId={}", user.getId());
  }

  @Transactional
  public void requestResponsiblePinReset(CurrentUser currentUser, ResponsiblePinResetRequest request) {
    AppUser user = findActiveResponsible(currentUser);
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Responsible PIN reset blocked by invalid password for userId={}", currentUser.userId());
      throw new UnauthorizedException("INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    }

    IssuedResetToken issuedToken = issueResetToken(user, AuthResetPurpose.RESPONSIBLE_PIN);
    accountEmailSender.sendResponsiblePinReset(user.getEmail(), issuedToken.rawToken(), issuedToken.expiresAt());
    log.info("Responsible PIN reset token issued for userId={}", user.getId());
  }

  @Transactional
  public void confirmResponsiblePinReset(
      CurrentUser currentUser,
      ResponsiblePinResetConfirmRequest request) {
    AppUser user = findActiveResponsible(currentUser);
    AuthResetToken resetToken = findUsableResetToken(request.token(), AuthResetPurpose.RESPONSIBLE_PIN);
    if (!resetToken.getUserId().equals(user.getId())) {
      throw invalidResetToken();
    }

    user.changeResponsiblePin(passwordEncoder.encode(request.newPin()));
    resetToken.markUsed(Instant.now(clock));
    log.info("Responsible PIN reset completed for userId={}", user.getId());
  }

  @Transactional
  public void requestAccountDeletion(CurrentUser currentUser, DeleteAccountRequest request) {
    AppUser user = findActiveResponsible(currentUser);
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Account deletion blocked by invalid password for userId={}", currentUser.userId());
      throw new UnauthorizedException("INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    }

    IssuedResetToken issuedToken = issueResetToken(user, AuthResetPurpose.ACCOUNT_DELETION);
    accountEmailSender.sendAccountDeletionConfirmation(user.getEmail(), issuedToken.rawToken(), issuedToken.expiresAt());
    log.info("Account deletion confirmation token issued for userId={}", user.getId());
  }

  @Transactional
  public void confirmAccountDeletion(CurrentUser currentUser, DeleteAccountConfirmRequest request) {
    AppUser user = findActiveResponsible(currentUser);
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Account deletion confirmation blocked by invalid password for userId={}", currentUser.userId());
      throw new UnauthorizedException("INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    }

    AuthResetToken resetToken = findUsableResetToken(request.token(), AuthResetPurpose.ACCOUNT_DELETION);
    if (!resetToken.getUserId().equals(user.getId())) {
      throw invalidResetToken();
    }

    user.deactivate();
    FamilyUnit family = familyUnitRepository.findById(user.getFamilyUnitId())
        .orElseThrow(() -> new NotFoundException("FAMILY_NOT_FOUND", "Família não encontrada."));
    family.deactivate();
    Instant now = Instant.now(clock);
    resetToken.markUsed(now);
    invalidateActiveTokens(user.getId(), AuthResetPurpose.PASSWORD, now);
    invalidateActiveTokens(user.getId(), AuthResetPurpose.RESPONSIBLE_PIN, now);
    invalidateActiveTokens(user.getId(), AuthResetPurpose.ACCOUNT_DELETION, now);
    log.info("Account deactivated: userId={} familyUnitId={}", user.getId(), family.getId());
  }

  @Transactional
  public void requestPermanentAccountDeletion(PermanentDeletionRequest request) {
    String email = normalizeEmail(request.email());
    List<AppUser> matchingUsers = appUserRepository.findAllByNormalizedEmail(email);
    if (matchingUsers.isEmpty()) {
      log.info("Permanent account deletion requested with no matching accounts");
      return;
    }

    Instant now = Instant.now(clock);
    matchingUsers.forEach(user ->
        invalidateActiveTokens(user.getId(), AuthResetPurpose.PERMANENT_ACCOUNT_DELETION, now));

    AppUser representative = matchingUsers.get(0);
    IssuedResetToken issuedToken = createResetToken(
        representative,
        AuthResetPurpose.PERMANENT_ACCOUNT_DELETION,
        now);
    accountEmailSender.sendPermanentAccountDeletionConfirmation(
        email,
        issuedToken.rawToken(),
        issuedToken.expiresAt());
    log.info("Permanent account deletion token issued for matchingAccountCount={}", matchingUsers.size());
  }

  @Transactional(readOnly = true)
  public MeResponse me(CurrentUser currentUser) {
    log.debug("Resolving /me for userId={} familyUnitId={}", currentUser.userId(), currentUser.familyUnitId());
    AppUser user = appUserRepository.findById(currentUser.userId())
        .filter(AppUser::isActive)
        .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "Usuário não encontrado."));
    FamilyUnit family = familyUnitRepository.findById(currentUser.familyUnitId())
        .filter(FamilyUnit::isActive)
        .orElseThrow(() -> new NotFoundException("FAMILY_NOT_FOUND", "Família não encontrada."));
    log.debug("Resolved /me for userId={} familyUnitId={}", user.getId(), family.getId());

    return new MeResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        family.getId(),
        family.getName());
  }

  private AuthResponse toAuthResponse(AppUser user, FamilyUnit family) {
    return new AuthResponse(
        jwtService.issueToken(user),
        new AuthResponse.UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole()),
        new AuthResponse.FamilySummary(family.getId(), family.getName()));
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private AppUser findActiveResponsible(CurrentUser currentUser) {
    return appUserRepository.findById(currentUser.userId())
        .filter(AppUser::isActive)
        .filter(found -> found.getRole() == UserRole.RESPONSIBLE)
        .orElseThrow(() -> new ForbiddenException(
            "RESPONSIBLE_ACCESS_DENIED",
            "Acesso do responsável não permitido."));
  }

  private IssuedResetToken issueResetToken(AppUser user, AuthResetPurpose purpose) {
    Instant now = Instant.now(clock);
    invalidateActiveTokens(user.getId(), purpose, now);

    return createResetToken(user, purpose, now);
  }

  private IssuedResetToken createResetToken(AppUser user, AuthResetPurpose purpose, Instant now) {
    Instant expiresAt = now.plusSeconds(RESET_TOKEN_EXPIRATION_MINUTES * 60);

    String rawToken = generateUniqueResetCode();
    authResetTokenRepository.save(new AuthResetToken(
        user.getId(),
        purpose,
        hashToken(rawToken),
        expiresAt));

    return new IssuedResetToken(rawToken, expiresAt);
  }

  private void invalidateActiveTokens(UUID userId, AuthResetPurpose purpose, Instant usedAt) {
    authResetTokenRepository.findByUserIdAndPurposeAndUsedAtIsNull(userId, purpose)
        .forEach(token -> token.markUsed(usedAt));
  }

  private AuthResetToken findUsableResetToken(String rawToken, AuthResetPurpose purpose) {
    Instant now = Instant.now(clock);
    AuthResetToken resetToken = authResetTokenRepository.findByTokenHashAndPurpose(hashToken(normalizeResetCode(rawToken)), purpose)
        .orElseThrow(this::invalidResetToken);

    if (resetToken.isUsed() || resetToken.isExpired(now)) {
      throw invalidResetToken();
    }

    return resetToken;
  }

  private BadRequestException invalidResetToken() {
    return new BadRequestException("INVALID_RESET_TOKEN", "Código inválido ou expirado.");
  }

  private String generateUniqueResetCode() {
    for (int attempt = 0; attempt < RESET_CODE_GENERATION_ATTEMPTS; attempt++) {
      String resetCode = generateResetCode();
      if (!authResetTokenRepository.existsByTokenHash(hashToken(resetCode))) {
        return resetCode;
      }
    }

    throw new IllegalStateException("Unable to generate a unique reset code");
  }

  private String generateResetCode() {
    StringBuilder resetCode = new StringBuilder(RESET_CODE_LENGTH);
    for (int index = 0; index < RESET_CODE_LENGTH; index++) {
      resetCode.append(RESET_CODE_ALPHABET[secureRandom.nextInt(RESET_CODE_ALPHABET.length)]);
    }

    return resetCode.toString();
  }

  private String normalizeResetCode(String rawToken) {
    return rawToken.trim().toUpperCase(Locale.ROOT);
  }

  private String hashToken(String rawToken) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    } catch (NoSuchAlgorithmException exception) {
      throw new IllegalStateException("SHA-256 is not available", exception);
    }
  }

  private record IssuedResetToken(String rawToken, Instant expiresAt) {
  }
}
