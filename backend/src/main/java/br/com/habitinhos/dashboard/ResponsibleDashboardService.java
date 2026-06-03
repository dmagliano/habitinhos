package br.com.habitinhos.dashboard;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse.ResponsibleDashboardApproval;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse.ResponsibleDashboardChildSummary;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse.ResponsibleDashboardMissionCounts;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse.ResponsibleDashboardRedemption;
import br.com.habitinhos.missions.AssignedMission;
import br.com.habitinhos.missions.AssignedMissionRepository;
import br.com.habitinhos.missions.AssignedMissionStatus;
import br.com.habitinhos.rewards.RewardRedemption;
import br.com.habitinhos.rewards.RewardRedemptionRepository;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResponsibleDashboardService {

  private static final int APPROVAL_PREVIEW_LIMIT = 2;
  private static final int RECENT_REDEMPTIONS_LIMIT = 3;

  private final ChildProfileRepository childProfileRepository;
  private final WalletRepository walletRepository;
  private final AssignedMissionRepository assignedMissionRepository;
  private final RewardRedemptionRepository rewardRedemptionRepository;

  public ResponsibleDashboardService(
      ChildProfileRepository childProfileRepository,
      WalletRepository walletRepository,
      AssignedMissionRepository assignedMissionRepository,
      RewardRedemptionRepository rewardRedemptionRepository) {
    this.childProfileRepository = childProfileRepository;
    this.walletRepository = walletRepository;
    this.assignedMissionRepository = assignedMissionRepository;
    this.rewardRedemptionRepository = rewardRedemptionRepository;
  }

  @Transactional(readOnly = true)
  public ResponsibleDashboardResponse getDashboard(CurrentUser currentUser) {
    requireResponsible(currentUser);
    UUID familyUnitId = currentUser.familyUnitId();

    List<ChildProfile> activeChildren = childProfileRepository
        .findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(familyUnitId);
    List<ChildProfile> familyChildren = childProfileRepository
        .findAllByFamilyUnitIdOrderByCreatedAtAsc(familyUnitId);
    Map<UUID, ChildProfile> childById = familyChildren.stream()
        .collect(Collectors.toMap(ChildProfile::getId, Function.identity()));
    List<UUID> activeChildIds = activeChildren.stream()
        .map(ChildProfile::getId)
        .toList();

    Map<UUID, Integer> balanceByChildId = walletRepository
        .findAllByFamilyUnitIdAndChildIdIn(familyUnitId, activeChildIds)
        .stream()
        .collect(Collectors.toMap(Wallet::getChildId, Wallet::getBalance));
    Map<UUID, Map<AssignedMissionStatus, Long>> missionCountsByChildId =
        countMissionsByChild(familyUnitId, activeChildIds);

    List<AssignedMission> pendingApproval = assignedMissionRepository
        .findAllByFamilyUnitIdAndStatusOrderByCompletedAtAsc(
            familyUnitId,
            AssignedMissionStatus.AWAITING_APPROVAL);
    List<ResponsibleDashboardApproval> approvalPreview = pendingApproval.stream()
        .limit(APPROVAL_PREVIEW_LIMIT)
        .map(assignment -> toApproval(assignment, childById))
        .toList();

    List<ResponsibleDashboardRedemption> recentRedemptions = rewardRedemptionRepository
        .findAllByFamilyUnitIdOrderByCreatedAtDesc(
            familyUnitId,
            PageRequest.of(0, RECENT_REDEMPTIONS_LIMIT))
        .stream()
        .map(redemption -> toRedemption(redemption, childById))
        .toList();

    List<ResponsibleDashboardChildSummary> children = activeChildren.stream()
        .map(child -> new ResponsibleDashboardChildSummary(
            child.getId(),
            child.getName(),
            child.getAge(),
            child.getAvatarKey(),
            balanceByChildId.getOrDefault(child.getId(), 0),
            toMissionCounts(missionCountsByChildId.get(child.getId()))))
        .toList();

    return new ResponsibleDashboardResponse(
        children,
        pendingApproval.size(),
        approvalPreview,
        recentRedemptions);
  }

  private Map<UUID, Map<AssignedMissionStatus, Long>> countMissionsByChild(
      UUID familyUnitId,
      List<UUID> childIds) {
    if (childIds.isEmpty()) {
      return Map.of();
    }

    return assignedMissionRepository.findAllByFamilyUnitIdAndChildIdIn(familyUnitId, childIds)
        .stream()
        .collect(Collectors.groupingBy(
            AssignedMission::getChildId,
            Collectors.groupingBy(
                AssignedMission::getStatus,
                () -> new EnumMap<>(AssignedMissionStatus.class),
                Collectors.counting())));
  }

  private ResponsibleDashboardMissionCounts toMissionCounts(
      Map<AssignedMissionStatus, Long> counts) {
    return new ResponsibleDashboardMissionCounts(
        count(counts, AssignedMissionStatus.PENDING),
        count(counts, AssignedMissionStatus.AWAITING_APPROVAL),
        count(counts, AssignedMissionStatus.COMPLETED),
        count(counts, AssignedMissionStatus.REJECTED),
        count(counts, AssignedMissionStatus.CANCELLED));
  }

  private int count(Map<AssignedMissionStatus, Long> counts, AssignedMissionStatus status) {
    if (counts == null) {
      return 0;
    }
    return counts.getOrDefault(status, 0L).intValue();
  }

  private ResponsibleDashboardApproval toApproval(
      AssignedMission assignment,
      Map<UUID, ChildProfile> childById) {
    ChildProfile child = childById.get(assignment.getChildId());
    return new ResponsibleDashboardApproval(
        assignment.getId(),
        assignment.getChildId(),
        child == null ? "Criança inativa" : child.getName(),
        assignment.getSnapshotTitle(),
        assignment.getSnapshotCoinValue(),
        assignment.getCompletedAt());
  }

  private ResponsibleDashboardRedemption toRedemption(
      RewardRedemption redemption,
      Map<UUID, ChildProfile> childById) {
    ChildProfile child = childById.get(redemption.getChildId());
    return new ResponsibleDashboardRedemption(
        redemption.getId(),
        redemption.getRewardId(),
        redemption.getChildId(),
        child == null ? "Criança inativa" : child.getName(),
        redemption.getSnapshotTitle(),
        redemption.getSnapshotCost(),
        redemption.getCreatedAt());
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }
}
