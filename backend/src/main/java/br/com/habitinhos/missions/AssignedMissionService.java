package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.WalletService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignedMissionService {

  private static final Logger log = LoggerFactory.getLogger(AssignedMissionService.class);

  private final MissionRepository missionRepository;
  private final AssignedMissionRepository assignedMissionRepository;
  private final ChildProfileRepository childProfileRepository;
  private final WalletService walletService;

  public AssignedMissionService(
      MissionRepository missionRepository,
      AssignedMissionRepository assignedMissionRepository,
      ChildProfileRepository childProfileRepository,
      WalletService walletService) {
    this.missionRepository = missionRepository;
    this.assignedMissionRepository = assignedMissionRepository;
    this.childProfileRepository = childProfileRepository;
    this.walletService = walletService;
  }

  @Transactional
  public List<AssignedMissionResponse> assign(
      CurrentUser currentUser,
      UUID missionId,
      List<UUID> childIds,
      LocalDate dueDate) {
    requireResponsible(currentUser);
    UUID familyUnitId = currentUser.familyUnitId();
    log.debug("Assigning mission: familyUnitId={} missionId={} childCount={}", familyUnitId, missionId, childIds.size());
    Mission mission = missionRepository.findByIdAndFamilyUnitIdAndActiveTrue(missionId, familyUnitId)
        .orElseThrow(this::missionNotFound);

    List<AssignedMissionStatus> openStatuses =
        List.of(AssignedMissionStatus.PENDING, AssignedMissionStatus.AWAITING_APPROVAL);
    List<AssignedMission> assignments = new ArrayList<>();

    for (UUID childId : childIds) {
      ChildProfile child = childProfileRepository.findByIdAndFamilyUnitIdAndActiveTrue(childId, familyUnitId)
          .orElseThrow(this::childNotFound);

      boolean hasOpenAssignment = assignedMissionRepository.existsByMissionIdAndChildIdAndStatusIn(
          missionId, child.getId(), openStatuses);
      if (hasOpenAssignment) {
        log.warn(
            "Duplicate assignment blocked: familyUnitId={} missionId={} childId={}",
            familyUnitId,
            missionId,
            child.getId());
        throw new ConflictException(
            "MISSION_DUPLICATE_ASSIGNMENT",
            "Missão já atribuída para esta criança.");
      }

      assignments.add(new AssignedMission(familyUnitId, missionId, child.getId(), dueDate, mission));
    }

    assignedMissionRepository.saveAll(assignments);
    assignedMissionRepository.flush();
    log.info("Mission assigned: familyUnitId={} missionId={} assignments={}", familyUnitId, missionId, assignments.size());
    return assignments.stream().map(this::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public List<AssignedMissionResponse> listPendingForChild(CurrentUser currentUser, UUID childId) {
    UUID familyUnitId = currentUser.familyUnitId();
    childProfileRepository.findByIdAndFamilyUnitId(childId, familyUnitId)
        .orElseThrow(this::childNotFound);

    List<AssignedMissionResponse> pendingMissions = assignedMissionRepository
        .findAllByFamilyUnitIdAndChildIdAndStatusOrderByDueDateAscCreatedAtAsc(
            familyUnitId,
            childId,
            AssignedMissionStatus.PENDING)
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug(
        "Pending assigned missions listed: familyUnitId={} childId={} count={}",
        familyUnitId,
        childId,
        pendingMissions.size());
    return pendingMissions;
  }

  @Transactional
  public AssignedMissionResponse complete(CurrentUser currentUser, UUID assignedMissionId) {
    UUID familyUnitId = currentUser.familyUnitId();
    AssignedMission assignedMission = assignedMissionRepository
        .findByIdAndFamilyUnitId(assignedMissionId, familyUnitId)
        .orElseThrow(this::assignedMissionNotFound);

    childProfileRepository.findByIdAndFamilyUnitId(assignedMission.getChildId(), familyUnitId)
        .orElseThrow(this::childNotFound);
    requireStatus(assignedMission, AssignedMissionStatus.PENDING);

    assignedMission.markCompleted();
    if (!assignedMission.isSnapshotRequiresApproval()) {
      walletService.creditForMission(
          familyUnitId,
          assignedMission.getChildId(),
          assignedMission.getId(),
          assignedMission.getSnapshotCoinValue(),
          currentUser.userId());
      log.info(
          "Assigned mission completed with automatic credit: familyUnitId={} assignedMissionId={} childId={}",
          familyUnitId,
          assignedMissionId,
          assignedMission.getChildId());
    } else {
      log.info(
          "Assigned mission completed awaiting approval: familyUnitId={} assignedMissionId={} childId={}",
          familyUnitId,
          assignedMissionId,
          assignedMission.getChildId());
    }
    return toResponse(assignedMission);
  }

  @Transactional(readOnly = true)
  public List<AssignedMissionResponse> listPendingApproval(CurrentUser currentUser) {
    requireResponsible(currentUser);
    List<AssignedMissionResponse> pendingApproval = assignedMissionRepository
        .findAllByFamilyUnitIdAndStatusOrderByCompletedAtAsc(
            currentUser.familyUnitId(),
            AssignedMissionStatus.AWAITING_APPROVAL)
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug(
        "Pending approval assigned missions listed: familyUnitId={} count={}",
        currentUser.familyUnitId(),
        pendingApproval.size());
    return pendingApproval;
  }

  @Transactional
  public AssignedMissionResponse approve(CurrentUser currentUser, UUID assignedMissionId) {
    requireResponsible(currentUser);
    UUID familyUnitId = currentUser.familyUnitId();
    AssignedMission assignedMission = assignedMissionRepository
        .findByIdAndFamilyUnitId(assignedMissionId, familyUnitId)
        .orElseThrow(this::assignedMissionNotFound);
    requireStatus(assignedMission, AssignedMissionStatus.AWAITING_APPROVAL);

    assignedMission.approve();
    walletService.creditForMission(
        familyUnitId,
        assignedMission.getChildId(),
        assignedMission.getId(),
        assignedMission.getSnapshotCoinValue(),
        currentUser.userId());
    log.info(
        "Assigned mission approved: familyUnitId={} assignedMissionId={} childId={}",
        familyUnitId,
        assignedMissionId,
        assignedMission.getChildId());
    return toResponse(assignedMission);
  }

  @Transactional
  public AssignedMissionResponse reject(CurrentUser currentUser, UUID assignedMissionId, String reason) {
    requireResponsible(currentUser);
    AssignedMission assignedMission = assignedMissionRepository
        .findByIdAndFamilyUnitId(assignedMissionId, currentUser.familyUnitId())
        .orElseThrow(this::assignedMissionNotFound);
    requireStatus(assignedMission, AssignedMissionStatus.AWAITING_APPROVAL);

    assignedMission.reject(normalizeOptional(reason));
    log.info(
        "Assigned mission rejected: familyUnitId={} assignedMissionId={} childId={}",
        currentUser.familyUnitId(),
        assignedMissionId,
        assignedMission.getChildId());
    return toResponse(assignedMission);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      log.warn("Access denied: non-responsible role={} familyUnitId={}", currentUser.role(), currentUser.familyUnitId());
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private NotFoundException missionNotFound() {
    return new NotFoundException("MISSION_NOT_FOUND", "Missão não encontrada.");
  }

  private NotFoundException childNotFound() {
    return new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada.");
  }

  private NotFoundException assignedMissionNotFound() {
    return new NotFoundException("ASSIGNED_MISSION_NOT_FOUND", "Missão atribuída não encontrada.");
  }

  private void requireStatus(AssignedMission assignedMission, AssignedMissionStatus expectedStatus) {
    if (assignedMission.getStatus() != expectedStatus) {
      log.warn(
          "Invalid assigned mission status: assignedMissionId={} expected={} actual={}",
          assignedMission.getId(),
          expectedStatus,
          assignedMission.getStatus());
      throw new ConflictException("INVALID_MISSION_STATUS", "Status da missão atribuída não permite esta ação.");
    }
  }

  private String normalizeOptional(String value) {
    return value == null || value.trim().isEmpty() ? null : value.trim();
  }

  private AssignedMissionResponse toResponse(AssignedMission assignedMission) {
    return new AssignedMissionResponse(
        assignedMission.getId(),
        assignedMission.getMissionId(),
        assignedMission.getChildId(),
        assignedMission.getStatus(),
        assignedMission.getDueDate(),
        assignedMission.getCompletedAt(),
        assignedMission.getApprovedAt(),
        assignedMission.getRejectedAt(),
        assignedMission.getRejectionReason(),
        assignedMission.getSnapshotTitle(),
        assignedMission.getSnapshotDescription(),
        assignedMission.getSnapshotCoinValue(),
        assignedMission.isSnapshotRequiresApproval(),
        assignedMission.getCreatedAt(),
        assignedMission.getUpdatedAt());
  }
}
