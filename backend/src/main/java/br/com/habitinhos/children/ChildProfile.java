package br.com.habitinhos.children;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "child_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

  public ChildProfile(UUID familyUnitId, String name, Integer age, String avatarKey,
      String accessPinHash) {
    this.familyUnitId = familyUnitId;
    this.name = name;
    this.age = age;
    this.avatarKey = avatarKey;
    this.accessPinHash = accessPinHash;
  }

  public void updateProfile(String name, Integer age, String avatarKey) {
    this.name = name;
    this.age = age;
    this.avatarKey = avatarKey;
  }

  public void updateAccessPinHash(String accessPinHash) {
    this.accessPinHash = accessPinHash;
  }

  public void deactivate() {
    this.active = false;
  }
}
