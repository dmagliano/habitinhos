package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.missions.dto.MissionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/missions")
public class MissionController {

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
    return missionService.create(currentUserProvider.getCurrentUser(), request);
  }

  @GetMapping
  public List<MissionResponse> list() {
    return missionService.list(currentUserProvider.getCurrentUser());
  }

  @GetMapping("/{id}")
  public MissionResponse get(@PathVariable UUID id) {
    return missionService.get(currentUserProvider.getCurrentUser(), id);
  }

  @PutMapping("/{id}")
  public MissionResponse update(@PathVariable UUID id, @Valid @RequestBody MissionRequest request) {
    return missionService.update(currentUserProvider.getCurrentUser(), id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public MissionResponse deactivate(@PathVariable UUID id) {
    return missionService.deactivate(currentUserProvider.getCurrentUser(), id);
  }

  @PostMapping("/{id}/assign")
  @ResponseStatus(HttpStatus.CREATED)
  public List<AssignedMissionResponse> assign(
      @PathVariable UUID id,
      @Valid @RequestBody AssignMissionRequest request) {
    return assignedMissionService.assign(
        currentUserProvider.getCurrentUser(),
        id,
        request.childIds(),
        request.dueDate());
  }
}
