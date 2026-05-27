package br.com.habitinhos.children;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "child_profiles")
public class ChildProfile extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String name;

  @Column
  private Integer age;

  @Column(name = "avatar_key", length = 80)
  private String avatarKey;

  @Column(name = "access_pin_hash")
  private String accessPinHash;

  @Column(nullable = false)
  private boolean active = true;

  protected ChildProfile() {
  }

  public ChildProfile(UUID familyUnitId, String name, Integer age, String avatarKey,
      String accessPinHash) {
    this.familyUnitId = familyUnitId;
    this.name = name;
    this.age = age;
    this.avatarKey = avatarKey;
    this.accessPinHash = accessPinHash;
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

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public String getAvatarKey() {
    return avatarKey;
  }

  public void setAvatarKey(String avatarKey) {
    this.avatarKey = avatarKey;
  }

  public String getAccessPinHash() {
    return accessPinHash;
  }

  public void setAccessPinHash(String accessPinHash) {
    this.accessPinHash = accessPinHash;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
