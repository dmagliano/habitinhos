package br.com.habitinhos.auth;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String name;

  @Column(nullable = false, unique = true, length = 320)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private UserRole role;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private boolean active = true;

  protected AppUser() {
  }

  public AppUser(UUID familyUnitId, String name, String email, UserRole role, String passwordHash) {
    this.familyUnitId = familyUnitId;
    this.name = name;
    this.email = email;
    this.role = role;
    this.passwordHash = passwordHash;
  }

  public UUID getFamilyUnitId() {
    return familyUnitId;
  }

  public void setFamilyUnitId(UUID familyUnitId) {
    this.familyUnitId = familyUnitId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public UserRole getRole() {
    return role;
  }

  public void setRole(UserRole role) {
    this.role = role;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
