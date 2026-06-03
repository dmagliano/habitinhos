package br.com.habitinhos.dashboard.dto;

import br.com.habitinhos.rewards.RewardRedemptionStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResponsibleDashboardResponse(
    List<ResponsibleDashboardChildSummary> children,
    int pendingApprovalCount,
    List<ResponsibleDashboardApproval> approvalPreview,
    List<ResponsibleDashboardRedemption> recentRedemptions) {

  public record ResponsibleDashboardChildSummary(
      UUID id,
      String name,
      Integer age,
      String avatarKey,
      int balance,
      ResponsibleDashboardMissionCounts missionCounts) {
  }

  public record ResponsibleDashboardMissionCounts(
      int PENDING,
      int AWAITING_APPROVAL,
      int COMPLETED,
      int REJECTED,
      int CANCELLED) {
  }

  public record ResponsibleDashboardApproval(
      UUID id,
      UUID childId,
      String childName,
      String missionTitle,
      int coinValue,
      Instant completedAt) {
  }

  public record ResponsibleDashboardRedemption(
      UUID id,
      UUID rewardId,
      UUID childId,
      String childName,
      String rewardTitle,
      int rewardCost,
      RewardRedemptionStatus status,
      Instant deliveredAt,
      Instant redeemedAt) {
  }
}
