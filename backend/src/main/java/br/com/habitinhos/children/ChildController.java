package br.com.habitinhos.children;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.children.dto.ChildResponse;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/children")
public class ChildController {

  private static final Logger log = LoggerFactory.getLogger(ChildController.class);

  private final ChildService childService;
  private final CurrentUserProvider currentUserProvider;

  public ChildController(ChildService childService, CurrentUserProvider currentUserProvider) {
    this.childService = childService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ChildResponse create(@Valid @RequestBody ChildRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Create child request: familyUnitId={}", currentUser.familyUnitId());
    return childService.create(currentUser, request);
  }

  @GetMapping
  public List<ChildResponse> list() {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("List children request: familyUnitId={}", currentUser.familyUnitId());
    return childService.list(currentUser);
  }

  @GetMapping("/{id}")
  public ChildResponse get(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Get child request: familyUnitId={} childId={}", currentUser.familyUnitId(), id);
    return childService.get(currentUser, id);
  }

  @PutMapping("/{id}")
  public ChildResponse update(@PathVariable UUID id, @Valid @RequestBody ChildRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Update child request: familyUnitId={} childId={}", currentUser.familyUnitId(), id);
    return childService.update(currentUser, id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public ChildResponse deactivate(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Deactivate child request: familyUnitId={} childId={}", currentUser.familyUnitId(), id);
    return childService.deactivate(currentUser, id);
  }
}
