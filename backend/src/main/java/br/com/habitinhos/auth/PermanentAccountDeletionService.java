package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.PermanentDeletionConfirmRequest;
import br.com.habitinhos.shared.error.BadRequestException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PermanentAccountDeletionService {

  private static final Logger log = LoggerFactory.getLogger(PermanentAccountDeletionService.class);

  private final JdbcTemplate jdbcTemplate;
  private final PermanentDeletionFailureInjector failureInjector;

  public PermanentAccountDeletionService(
      JdbcTemplate jdbcTemplate,
      PermanentDeletionFailureInjector failureInjector) {
    this.jdbcTemplate = jdbcTemplate;
    this.failureInjector = failureInjector;
  }

  @Transactional
  public void confirm(PermanentDeletionConfirmRequest request) {
    String email = request.email().trim().toLowerCase(Locale.ROOT);
    UUID tokenId = lockUsableToken(email, request.token());
    List<UUID> userIds = jdbcTemplate.queryForList(
        "SELECT id FROM app_users WHERE lower(trim(email)) = ? ORDER BY id FOR UPDATE",
        UUID.class,
        email);
    if (userIds.isEmpty()) {
      throw invalidToken();
    }

    LinkedHashSet<UUID> familyIds = new LinkedHashSet<>(jdbcTemplate.queryForList(
        "SELECT DISTINCT family_unit_id FROM app_users WHERE lower(trim(email)) = ? ORDER BY family_unit_id",
        UUID.class,
        email));

    int consumed = jdbcTemplate.update(
        "UPDATE auth_reset_tokens SET used_at = now() WHERE id = ? AND used_at IS NULL AND expires_at > now()",
        tokenId);
    if (consumed != 1) {
      throw invalidToken();
    }

    jdbcTemplate.update(
        "DELETE FROM auth_reset_tokens WHERE user_id IN (SELECT id FROM app_users WHERE lower(trim(email)) = ?)",
        email);

    boolean firstFamily = true;
    for (UUID familyId : familyIds) {
      jdbcTemplate.update(
          "UPDATE reward_redemptions SET coin_transaction_id = NULL WHERE family_unit_id = ?",
          familyId);
      jdbcTemplate.update("DELETE FROM coin_transactions WHERE family_unit_id = ?", familyId);
      if (firstFamily) {
        failureInjector.afterFirstFamilyDelete();
        firstFamily = false;
      }
      jdbcTemplate.update("DELETE FROM reward_redemptions WHERE family_unit_id = ?", familyId);
      jdbcTemplate.update("DELETE FROM assigned_missions WHERE family_unit_id = ?", familyId);
      jdbcTemplate.update("DELETE FROM wallets WHERE family_unit_id = ?", familyId);
      jdbcTemplate.update("DELETE FROM child_profiles WHERE family_unit_id = ?", familyId);
      jdbcTemplate.update("DELETE FROM rewards WHERE family_unit_id = ?", familyId);
      jdbcTemplate.update("DELETE FROM missions WHERE family_unit_id = ?", familyId);
    }

    jdbcTemplate.update(
        "DELETE FROM app_users WHERE lower(trim(email)) = ?",
        email);
    for (UUID familyId : familyIds) {
      jdbcTemplate.update("DELETE FROM family_units WHERE id = ?", familyId);
    }
    log.info(
        "Permanent account deletion completed: accountCount={} familyCount={}",
        userIds.size(),
        familyIds.size());
  }

  private UUID lockUsableToken(String email, String rawToken) {
    List<UUID> tokenIds = jdbcTemplate.queryForList(
        """
        SELECT token.id
        FROM auth_reset_tokens token
        JOIN app_users app_user ON app_user.id = token.user_id
        WHERE token.token_hash = ?
          AND token.purpose = 'PERMANENT_ACCOUNT_DELETION'
          AND token.used_at IS NULL
          AND token.expires_at > now()
          AND lower(trim(app_user.email)) = ?
        FOR UPDATE OF token
        """,
        UUID.class,
        hashToken(rawToken.trim().toUpperCase(Locale.ROOT)),
        email);
    if (tokenIds.size() != 1) {
      throw invalidToken();
    }
    return tokenIds.get(0);
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

  private BadRequestException invalidToken() {
    return new BadRequestException("INVALID_RESET_TOKEN", "Código inválido ou expirado.");
  }
}
