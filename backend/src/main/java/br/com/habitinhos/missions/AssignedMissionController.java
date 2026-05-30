package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class AssignedMissionController {

  private final AssignedMissionService assignedMissionService;
  private final CurrentUserProvider currentUserProvider;

  public AssignedMissionController(
      AssignedMissionService assignedMissionService,
      CurrentUserProvider currentUserProvider) {
    this.assignedMissionService = assignedMissionService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping("/children/{childId}/missions")
  public List<AssignedMissionResponse> listPendingForChild(@PathVariable UUID childId) {
    return assignedMissionService.listPendingForChild(currentUserProvider.getCurrentUser(), childId);
  }

  @PostMapping("/assigned-missions/{id}/complete")
  public AssignedMissionResponse complete(@PathVariable UUID id) {
    return assignedMissionService.complete(currentUserProvider.getCurrentUser(), id);
  }
}
