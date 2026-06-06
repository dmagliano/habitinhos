package br.com.habitinhos.missions;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.missions.dto.AssignedMissionResponse;
import br.com.habitinhos.missions.dto.RejectAssignedMissionRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class AssignedMissionController {

  private static final Logger log = LoggerFactory.getLogger(AssignedMissionController.class);

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
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("List pending assigned missions request: familyUnitId={} childId={}", currentUser.familyUnitId(), childId);
    return assignedMissionService.listPendingForChild(currentUser, childId);
  }

  @PostMapping("/assigned-missions/{id}/complete")
  public AssignedMissionResponse complete(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Complete assigned mission request: familyUnitId={} assignedMissionId={}", currentUser.familyUnitId(), id);
    return assignedMissionService.complete(currentUser, id);
  }

  @GetMapping("/assigned-missions/pending-approval")
  public List<AssignedMissionResponse> listPendingApproval() {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("List pending approval assigned missions request: familyUnitId={}", currentUser.familyUnitId());
    return assignedMissionService.listPendingApproval(currentUser);
  }

  @PostMapping("/assigned-missions/{id}/approve")
  public AssignedMissionResponse approve(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Approve assigned mission request: familyUnitId={} assignedMissionId={}", currentUser.familyUnitId(), id);
    return assignedMissionService.approve(currentUser, id);
  }

  @PostMapping("/assigned-missions/{id}/reject")
  public AssignedMissionResponse reject(
      @PathVariable UUID id,
      @Valid @RequestBody RejectAssignedMissionRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Reject assigned mission request: familyUnitId={} assignedMissionId={}", currentUser.familyUnitId(), id);
    return assignedMissionService.reject(
        currentUser,
        id,
        request.reason(),
        Boolean.TRUE.equals(request.returnToPending()));
  }
}
