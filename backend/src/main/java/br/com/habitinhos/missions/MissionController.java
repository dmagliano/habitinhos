package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.missions.dto.MissionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/missions")
public class MissionController {

  private static final Logger log = LoggerFactory.getLogger(MissionController.class);

  private final MissionService missionService;
  private final AssignedMissionService assignedMissionService;
  private final CurrentUserProvider currentUserProvider;

  public MissionController(
      MissionService missionService,
      AssignedMissionService assignedMissionService,
      CurrentUserProvider currentUserProvider) {
    this.missionService = missionService;
    this.assignedMissionService = assignedMissionService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public MissionResponse create(@Valid @RequestBody MissionRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Create mission request: familyUnitId={}", currentUser.familyUnitId());
    return missionService.create(currentUser, request);
  }

  @GetMapping
  public List<MissionResponse> list(@RequestParam(defaultValue = "false") boolean includeInactive) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug(
        "List missions request: familyUnitId={} includeInactive={}",
        currentUser.familyUnitId(),
        includeInactive);
    return missionService.list(currentUser, includeInactive);
  }

  @GetMapping("/{id}")
  public MissionResponse get(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Get mission request: familyUnitId={} missionId={}", currentUser.familyUnitId(), id);
    return missionService.get(currentUser, id);
  }

  @PutMapping("/{id}")
  public MissionResponse update(@PathVariable UUID id, @Valid @RequestBody MissionRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Update mission request: familyUnitId={} missionId={}", currentUser.familyUnitId(), id);
    return missionService.update(currentUser, id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public MissionResponse deactivate(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Deactivate mission request: familyUnitId={} missionId={}", currentUser.familyUnitId(), id);
    return missionService.deactivate(currentUser, id);
  }

  @PostMapping("/{id}/assign")
  @ResponseStatus(HttpStatus.CREATED)
  public List<AssignedMissionResponse> assign(
      @PathVariable UUID id,
      @Valid @RequestBody AssignMissionRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info(
        "Assign mission request: familyUnitId={} missionId={} childCount={}",
        currentUser.familyUnitId(),
        id,
        request.childIds().size());
    return assignedMissionService.assign(
        currentUser,
        id,
        request.childIds(),
        request.dueDate());
  }
}
