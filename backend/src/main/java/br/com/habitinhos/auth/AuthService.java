package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.AuthResponse;
import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.MeResponse;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.auth.dto.VerifyResponsiblePinRequest;
import br.com.habitinhos.family.FamilyUnit;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.shared.error.UnauthorizedException;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);

  private final AppUserRepository appUserRepository;
  private final FamilyUnitRepository familyUnitRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      AppUserRepository appUserRepository,
      FamilyUnitRepository familyUnitRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.appUserRepository = appUserRepository;
    this.familyUnitRepository = familyUnitRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String email = normalizeEmail(request.email());
    if (appUserRepository.existsByEmailIgnoreCase(email)) {
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
    AppUser user = appUserRepository.findByEmailIgnoreCase(email)
        .filter(AppUser::isActive)
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
}
