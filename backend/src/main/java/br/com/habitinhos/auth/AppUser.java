package br.com.habitinhos.auth;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AppUser extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String name;

  @Column(nullable = false, length = 320)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private UserRole role;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "responsible_pin_hash")
  private String responsiblePinHash;

  @Column(nullable = false)
  private boolean active = true;

  public AppUser(UUID familyUnitId, String name, String email, UserRole role, String passwordHash, String responsiblePinHash) {
    this.familyUnitId = familyUnitId;
    this.name = name;
    this.email = email;
    this.role = role;
    this.passwordHash = passwordHash;
    this.responsiblePinHash = responsiblePinHash;
  }

  public void changePassword(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public void changeResponsiblePin(String responsiblePinHash) {
    this.responsiblePinHash = responsiblePinHash;
  }

  public void deactivate() {
    this.active = false;
  }
}
