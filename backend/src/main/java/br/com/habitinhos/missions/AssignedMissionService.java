package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssignedMissionService {

  private final MissionRepository missionRepository;
  private final AssignedMissionRepository assignedMissionRepository;
  private final ChildProfileRepository childProfileRepository;

  public AssignedMissionService(
      MissionRepository missionRepository,
      AssignedMissionRepository assignedMissionRepository,
      ChildProfileRepository childProfileRepository) {
    this.missionRepository = missionRepository;
    this.assignedMissionRepository = assignedMissionRepository;
    this.childProfileRepository = childProfileRepository;
  }

  @Transactional
  public List<AssignedMissionResponse> assign(
      CurrentUser currentUser,
      UUID missionId,
      List<UUID> childIds,
      LocalDate dueDate) {
    requireResponsible(currentUser);
    UUID familyUnitId = currentUser.familyUnitId();
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
        throw new ConflictException(
            "MISSION_DUPLICATE_ASSIGNMENT",
            "Missão já atribuída para esta criança.");
      }

      assignments.add(new AssignedMission(familyUnitId, missionId, child.getId(), dueDate, mission));
    }

    assignedMissionRepository.saveAll(assignments);
    assignedMissionRepository.flush();
    return assignments.stream().map(this::toResponse).toList();
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private NotFoundException missionNotFound() {
    return new NotFoundException("MISSION_NOT_FOUND", "Missão não encontrada.");
  }

  private NotFoundException childNotFound() {
    return new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada.");
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
