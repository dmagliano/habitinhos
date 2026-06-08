package br.com.habitinhos.auth;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "auth_reset_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthResetToken extends BaseEntity {

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private AuthResetPurpose purpose;

  @Column(name = "token_hash", nullable = false, unique = true, length = 128)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "used_at")
  private Instant usedAt;

  public AuthResetToken(
      UUID userId,
      AuthResetPurpose purpose,
      String tokenHash,
      Instant expiresAt) {
    this.userId = userId;
    this.purpose = purpose;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
  }

  public boolean isUsed() {
    return usedAt != null;
  }

  public boolean isExpired(Instant now) {
    return !expiresAt.isAfter(now);
  }

  public void markUsed(Instant usedAt) {
    this.usedAt = usedAt;
  }
}
