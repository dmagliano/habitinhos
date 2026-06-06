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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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

      LocalDate scheduledDate = scheduledDateForInitialAssignment(mission, dueDate);
      LocalDate assignmentDueDate = dueDateForInitialAssignment(mission, scheduledDate, dueDate);
      boolean hasOpenAssignment = isRecurring(mission.getRecurrenceType())
          ? assignedMissionRepository.existsByFamilyUnitIdAndMissionIdAndChildIdAndScheduledDate(
              familyUnitId,
              missionId,
              child.getId(),
              scheduledDate)
          : assignedMissionRepository.existsByMissionIdAndChildIdAndStatusIn(
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

      assignments.add(new AssignedMission(familyUnitId, missionId, child.getId(), scheduledDate, assignmentDueDate, mission));
    }

    assignedMissionRepository.saveAll(assignments);
    assignedMissionRepository.flush();
    log.info("Mission assigned: familyUnitId={} missionId={} assignments={}", familyUnitId, missionId, assignments.size());
    return assignments.stream().map(this::toResponse).toList();
  }

  @Transactional
  public List<AssignedMissionResponse> listPendingForChild(CurrentUser currentUser, UUID childId) {
    UUID familyUnitId = currentUser.familyUnitId();
    childProfileRepository.findByIdAndFamilyUnitId(childId, familyUnitId)
        .orElseThrow(this::childNotFound);

    LocalDate today = LocalDate.now();
    ensureRecurringAssignmentsForChild(familyUnitId, childId, today);

    List<AssignedMissionResponse> pendingMissions = assignedMissionRepository
        .findVisiblePendingForChild(
            familyUnitId,
            childId,
            AssignedMissionStatus.PENDING,
            today)
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
      assignedMissionRepository.flush();
      createNextRecurringAssignmentIfNeeded(assignedMission);
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
    assignedMissionRepository.flush();
    createNextRecurringAssignmentIfNeeded(assignedMission);
    log.info(
        "Assigned mission approved: familyUnitId={} assignedMissionId={} childId={}",
        familyUnitId,
        assignedMissionId,
        assignedMission.getChildId());
    return toResponse(assignedMission);
  }

  @Transactional
  public AssignedMissionResponse reject(
      CurrentUser currentUser,
      UUID assignedMissionId,
      String reason,
      boolean returnToPending) {
    requireResponsible(currentUser);
    AssignedMission assignedMission = assignedMissionRepository
        .findByIdAndFamilyUnitId(assignedMissionId, currentUser.familyUnitId())
        .orElseThrow(this::assignedMissionNotFound);
    requireStatus(assignedMission, AssignedMissionStatus.AWAITING_APPROVAL);

    if (returnToPending) {
      assignedMission.rejectAndReturnToPending(normalizeOptional(reason));
    } else {
      assignedMission.reject(normalizeOptional(reason));
    }
    log.info(
        "Assigned mission rejected: familyUnitId={} assignedMissionId={} childId={} returnToPending={}",
        currentUser.familyUnitId(),
        assignedMissionId,
        assignedMission.getChildId(),
        returnToPending);
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

  private void createNextRecurringAssignmentIfNeeded(AssignedMission completedAssignment) {
    RecurrenceType recurrenceType = completedAssignment.getSnapshotRecurrenceType();
    if (recurrenceType == RecurrenceType.ONCE || recurrenceType == RecurrenceType.CUSTOM) {
      return;
    }

    Mission mission = missionRepository
        .findByIdAndFamilyUnitId(completedAssignment.getMissionId(), completedAssignment.getFamilyUnitId())
        .orElseThrow(this::missionNotFound);
    if (!mission.isActive() || !isRecurring(mission.getRecurrenceType())) {
      return;
    }

    LocalDate nextScheduledDate = nextScheduledDate(completedAssignment.getScheduledDate(), recurrenceType);
    if (assignedMissionRepository.existsByFamilyUnitIdAndMissionIdAndChildIdAndScheduledDate(
        completedAssignment.getFamilyUnitId(),
        completedAssignment.getMissionId(),
        completedAssignment.getChildId(),
        nextScheduledDate)) {
      log.debug(
          "Skipping recurring assignment because scheduled occurrence exists: familyUnitId={} missionId={} childId={} scheduledDate={}",
          completedAssignment.getFamilyUnitId(),
          completedAssignment.getMissionId(),
          completedAssignment.getChildId(),
          nextScheduledDate);
      return;
    }
    LocalDate nextDueDate = dueDateForScheduledDate(nextScheduledDate, mission.getCompletionWindowDays());
    AssignedMission nextAssignment = new AssignedMission(
        completedAssignment.getFamilyUnitId(),
        completedAssignment.getMissionId(),
        completedAssignment.getChildId(),
        nextScheduledDate,
        nextDueDate,
        mission);
    assignedMissionRepository.save(nextAssignment);
    log.info(
        "Recurring assigned mission created: familyUnitId={} missionId={} childId={} recurrenceType={} scheduledDate={} dueDate={}",
        completedAssignment.getFamilyUnitId(),
        completedAssignment.getMissionId(),
        completedAssignment.getChildId(),
        recurrenceType,
        nextScheduledDate,
        nextDueDate);
  }

  private void ensureRecurringAssignmentsForChild(UUID familyUnitId, UUID childId, LocalDate today) {
    List<AssignedMission> recurringAssignments = assignedMissionRepository
        .findAllByFamilyUnitIdAndChildIdAndSnapshotRecurrenceTypeIn(
            familyUnitId,
            childId,
            List.of(RecurrenceType.DAILY, RecurrenceType.WEEKLY));
    Map<UUID, AssignedMission> latestByMissionId = recurringAssignments.stream()
        .collect(Collectors.toMap(
            AssignedMission::getMissionId,
            assignment -> assignment,
            (left, right) -> latestScheduledDate(left).isAfter(latestScheduledDate(right)) ? left : right));

    for (AssignedMission latestAssignment : latestByMissionId.values()) {
      RecurrenceType recurrenceType = latestAssignment.getSnapshotRecurrenceType();
      LocalDate nextScheduledDate = nextScheduledDate(latestAssignment.getScheduledDate(), recurrenceType);
      Mission mission = missionRepository
          .findByIdAndFamilyUnitId(latestAssignment.getMissionId(), familyUnitId)
          .orElse(null);
      if (mission == null || !mission.isActive() || !isRecurring(mission.getRecurrenceType())) {
        continue;
      }

      LocalDate latestDueDate =
          dueDateForScheduledDate(latestAssignment.getScheduledDate(), latestAssignment.getSnapshotCompletionWindowDays());
      if (latestAssignment.getStatus() == AssignedMissionStatus.AWAITING_APPROVAL
          || (latestAssignment.getStatus() == AssignedMissionStatus.PENDING && !latestDueDate.isBefore(today))) {
        continue;
      }

      while (dueDateForScheduledDate(nextScheduledDate, mission.getCompletionWindowDays()).isBefore(today)) {
        nextScheduledDate = nextScheduledDate(nextScheduledDate, recurrenceType);
      }

      if (assignedMissionRepository.existsByFamilyUnitIdAndMissionIdAndChildIdAndScheduledDate(
          familyUnitId,
          latestAssignment.getMissionId(),
          childId,
          nextScheduledDate)) {
        continue;
      }

      LocalDate dueDate = dueDateForScheduledDate(nextScheduledDate, mission.getCompletionWindowDays());
      assignedMissionRepository.save(new AssignedMission(
          familyUnitId,
          latestAssignment.getMissionId(),
          childId,
          nextScheduledDate,
          dueDate,
          mission));
      log.info(
          "Recurring assigned mission ensured: familyUnitId={} missionId={} childId={} recurrenceType={} scheduledDate={} dueDate={}",
          familyUnitId,
          latestAssignment.getMissionId(),
          childId,
          recurrenceType,
          nextScheduledDate,
          dueDate);
    }
  }

  private LocalDate latestScheduledDate(AssignedMission assignedMission) {
    return assignedMission.getScheduledDate() == null ? assignedMission.getDueDate() : assignedMission.getScheduledDate();
  }

  private LocalDate scheduledDateForInitialAssignment(Mission mission, LocalDate requestedDueDate) {
    if (!isRecurring(mission.getRecurrenceType())) {
      return requestedDueDate == null ? LocalDate.now() : requestedDueDate;
    }
    return requestedDueDate == null
        ? LocalDate.now()
        : requestedDueDate.minusDays(mission.getCompletionWindowDays());
  }

  private LocalDate dueDateForInitialAssignment(Mission mission, LocalDate scheduledDate, LocalDate requestedDueDate) {
    if (!isRecurring(mission.getRecurrenceType())) {
      return requestedDueDate;
    }
    return dueDateForScheduledDate(scheduledDate, mission.getCompletionWindowDays());
  }

  private LocalDate dueDateForScheduledDate(LocalDate scheduledDate, int completionWindowDays) {
    return scheduledDate.plusDays(completionWindowDays);
  }

  private LocalDate nextScheduledDate(LocalDate currentScheduledDate, RecurrenceType recurrenceType) {
    LocalDate baseDate = currentScheduledDate == null ? LocalDate.now() : currentScheduledDate;
    return switch (recurrenceType) {
      case DAILY -> baseDate.plusDays(1);
      case WEEKLY -> baseDate.plusWeeks(1);
      case ONCE, CUSTOM -> baseDate;
    };
  }

  private boolean isRecurring(RecurrenceType recurrenceType) {
    return recurrenceType == RecurrenceType.DAILY || recurrenceType == RecurrenceType.WEEKLY;
  }

  private AssignedMissionResponse toResponse(AssignedMission assignedMission) {
    return new AssignedMissionResponse(
        assignedMission.getId(),
        assignedMission.getMissionId(),
        assignedMission.getChildId(),
        assignedMission.getStatus(),
        assignedMission.getScheduledDate(),
        assignedMission.getDueDate(),
        assignedMission.getCompletedAt(),
        assignedMission.getApprovedAt(),
        assignedMission.getRejectedAt(),
        assignedMission.getRejectionReason(),
        assignedMission.getSnapshotTitle(),
        assignedMission.getSnapshotDescription(),
        assignedMission.getSnapshotCoinValue(),
        assignedMission.isSnapshotRequiresApproval(),
        assignedMission.getSnapshotRecurrenceType(),
        assignedMission.getSnapshotCompletionWindowDays(),
        assignedMission.getCreatedAt(),
        assignedMission.getUpdatedAt());
  }
}
