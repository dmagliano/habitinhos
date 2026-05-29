package br.com.habitinhos.missions;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "assigned_missions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AssignedMission extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(name = "mission_id", nullable = false)
  private UUID missionId;

  @Column(name = "child_id", nullable = false)
  private UUID childId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private AssignedMissionStatus status = AssignedMissionStatus.PENDING;

  @Column(name = "due_date")
  private LocalDate dueDate;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "approved_at")
  private Instant approvedAt;

  @Column(name = "rejected_at")
  private Instant rejectedAt;

  @Column(name = "rejection_reason", length = 500)
  private String rejectionReason;

  @Column(name = "snapshot_title", nullable = false, length = 160)
  private String snapshotTitle;

  @Column(name = "snapshot_description", length = 1000)
  private String snapshotDescription;

  @Column(name = "snapshot_coin_value", nullable = false)
  private int snapshotCoinValue;

  @Column(name = "snapshot_requires_approval", nullable = false)
  private boolean snapshotRequiresApproval;

  public AssignedMission(UUID familyUnitId, UUID missionId, UUID childId, LocalDate dueDate,
      Mission mission) {
    this.familyUnitId = familyUnitId;
    this.missionId = missionId;
    this.childId = childId;
    this.dueDate = dueDate;
    // Snapshot from the mission template at assignment time
    this.snapshotTitle = mission.getTitle();
    this.snapshotDescription = mission.getDescription();
    this.snapshotCoinValue = mission.getCoinValue();
    this.snapshotRequiresApproval = mission.isRequiresApproval();
  }

  // --- Domain methods ---

  public void markCompleted() {
    this.completedAt = Instant.now();
    if (this.snapshotRequiresApproval) {
      this.status = AssignedMissionStatus.AWAITING_APPROVAL;
    } else {
      this.status = AssignedMissionStatus.COMPLETED;
    }
  }

  public void approve() {
    this.approvedAt = Instant.now();
    this.status = AssignedMissionStatus.COMPLETED;
  }

  public void reject(String reason) {
    this.rejectedAt = Instant.now();
    this.rejectionReason = reason;
    this.status = AssignedMissionStatus.REJECTED;
  }

  public void cancel() {
    this.status = AssignedMissionStatus.CANCELLED;
  }
}
