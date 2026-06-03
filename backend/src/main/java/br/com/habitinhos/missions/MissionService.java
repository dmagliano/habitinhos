package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.missions.dto.MissionResponse;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissionService {

  private static final Logger log = LoggerFactory.getLogger(MissionService.class);

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
    log.info("Mission created: familyUnitId={} missionId={}", currentUser.familyUnitId(), mission.getId());
    return toResponse(mission);
  }

  @Transactional(readOnly = true)
  public List<MissionResponse> list(CurrentUser currentUser, boolean includeInactive) {
    requireResponsible(currentUser);
    var missionEntities = includeInactive
        ? missionRepository.findAllByFamilyUnitIdOrderByActiveDescCreatedAtAsc(currentUser.familyUnitId())
        : missionRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId());
    List<MissionResponse> missions = missionEntities
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug(
        "Missions listed: familyUnitId={} includeInactive={} count={}",
        currentUser.familyUnitId(),
        includeInactive,
        missions.size());
    return missions;
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
    log.info("Mission updated: familyUnitId={} missionId={}", currentUser.familyUnitId(), id);
    return toResponse(mission);
  }

  @Transactional
  public MissionResponse deactivate(CurrentUser currentUser, java.util.UUID id) {
    requireResponsible(currentUser);
    Mission mission = missionRepository.findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
        .orElseThrow(this::missionNotFound);
    mission.deactivate();
    log.info("Mission deactivated: familyUnitId={} missionId={}", currentUser.familyUnitId(), id);
    return toResponse(mission);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      log.warn("Access denied: non-responsible role={} familyUnitId={}", currentUser.role(), currentUser.familyUnitId());
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
