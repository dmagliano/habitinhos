package br.com.habitinhos.rewards;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rewards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reward extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(length = 1000)
  private String description;

  @Column(nullable = false)
  private int cost;

  @Column(nullable = false)
  private boolean active = true;

  @Column(name = "created_by_user_id", nullable = false)
  private UUID createdByUserId;

  public Reward(UUID familyUnitId, String title, String description, int cost, UUID createdByUserId) {
    this.familyUnitId = familyUnitId;
    this.title = title;
    this.description = description;
    this.cost = cost;
    this.createdByUserId = createdByUserId;
  }

  public void update(String title, String description, int cost) {
    this.title = title;
    this.description = description;
    this.cost = cost;
  }

  public void deactivate() {
    this.active = false;
  }
}
