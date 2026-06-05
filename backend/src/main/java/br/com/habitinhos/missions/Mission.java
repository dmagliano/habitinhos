package br.com.habitinhos.missions;

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
@Table(name = "missions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mission extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(length = 1000)
  private String description;

  @Column(name = "coin_value", nullable = false)
  private int coinValue;

  @Column(name = "requires_approval", nullable = false)
  private boolean requiresApproval = true;

  @Enumerated(EnumType.STRING)
  @Column(name = "recurrence_type", nullable = false, length = 24)
  private RecurrenceType recurrenceType = RecurrenceType.ONCE;

  @Column(name = "completion_window_days", nullable = false)
  private int completionWindowDays;

  @Column(nullable = false)
  private boolean active = true;

  @Column(name = "created_by_user_id", nullable = false)
  private UUID createdByUserId;

  public Mission(UUID familyUnitId, String title, String description, int coinValue,
      boolean requiresApproval, RecurrenceType recurrenceType, int completionWindowDays, UUID createdByUserId) {
    this.familyUnitId = familyUnitId;
    this.title = title;
    this.description = description;
    this.coinValue = coinValue;
    this.requiresApproval = requiresApproval;
    this.recurrenceType = recurrenceType;
    this.completionWindowDays = completionWindowDays;
    this.createdByUserId = createdByUserId;
  }

  // --- Domain methods ---

  public void update(String title, String description, int coinValue,
      boolean requiresApproval, RecurrenceType recurrenceType, int completionWindowDays) {
    this.title = title;
    this.description = description;
    this.coinValue = coinValue;
    this.requiresApproval = requiresApproval;
    this.recurrenceType = recurrenceType;
    this.completionWindowDays = completionWindowDays;
  }

  public void deactivate() {
    this.active = false;
  }
}
