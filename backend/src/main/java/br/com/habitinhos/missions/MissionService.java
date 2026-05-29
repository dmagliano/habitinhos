package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.missions.dto.MissionResponse;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionService {

  private final MissionRepository missionRepository;

  public MissionService(MissionRepository missionRepository) {
    this.missionRepository = missionRepository;
  }

  @Transactional
  public MissionResponse create(CurrentUser currentUser, MissionRequest request) {
    requireResponsible(currentUser);
    Mission mission = new Mission(
        currentUser.familyUnitId(),
        request.title().trim(),
        normalizeOptional(request.description()),
        request.coinValue(),
        request.requiresApproval(),
        request.recurrenceType(),
        currentUser.userId());
    missionRepository.saveAndFlush(mission);
    return toResponse(mission);
  }

  @Transactional(readOnly = true)
  public List<MissionResponse> list(CurrentUser currentUser) {
    requireResponsible(currentUser);
    return missionRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public MissionResponse get(CurrentUser currentUser, java.util.UUID id) {
    requireResponsible(currentUser);
    Mission mission = missionRepository.findByIdAndFamilyUnitId(id, currentUser.familyUnitId())
        .orElseThrow(this::missionNotFound);
    return toResponse(mission);
  }

  @Transactional
  public MissionResponse update(CurrentUser currentUser, java.util.UUID id, MissionRequest request) {
    requireResponsible(currentUser);
    Mission mission = missionRepository.findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
        .orElseThrow(this::missionNotFound);
    mission.update(
        request.title().trim(),
        normalizeOptional(request.description()),
        request.coinValue(),
        request.requiresApproval(),
        request.recurrenceType());
    return toResponse(mission);
  }

  @Transactional
  public MissionResponse deactivate(CurrentUser currentUser, java.util.UUID id) {
    requireResponsible(currentUser);
    Mission mission = missionRepository.findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
        .orElseThrow(this::missionNotFound);
    mission.deactivate();
    return toResponse(mission);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private String normalizeOptional(String value) {
    return value == null || value.trim().isEmpty() ? null : value.trim();
  }

  private NotFoundException missionNotFound() {
    return new NotFoundException("MISSION_NOT_FOUND", "Missão não encontrada.");
  }

  private MissionResponse toResponse(Mission mission) {
    return new MissionResponse(
        mission.getId(),
        mission.getTitle(),
        mission.getDescription(),
        mission.getCoinValue(),
        mission.isRequiresApproval(),
        mission.getRecurrenceType(),
        mission.isActive(),
        mission.getCreatedAt(),
        mission.getUpdatedAt());
  }
}
