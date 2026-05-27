package br.com.habitinhos.children;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.children.dto.ChildResponse;
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
@RequestMapping("/children")
public class ChildController {

  private final ChildService childService;
  private final CurrentUserProvider currentUserProvider;

  public ChildController(ChildService childService, CurrentUserProvider currentUserProvider) {
    this.childService = childService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ChildResponse create(@Valid @RequestBody ChildRequest request) {
    return childService.create(currentUserProvider.getCurrentUser(), request);
  }

  @GetMapping
  public List<ChildResponse> list() {
    return childService.list(currentUserProvider.getCurrentUser());
  }

  @GetMapping("/{id}")
  public ChildResponse get(@PathVariable UUID id) {
    return childService.get(currentUserProvider.getCurrentUser(), id);
  }

  @PutMapping("/{id}")
  public ChildResponse update(@PathVariable UUID id, @Valid @RequestBody ChildRequest request) {
    return childService.update(currentUserProvider.getCurrentUser(), id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public ChildResponse deactivate(@PathVariable UUID id) {
    return childService.deactivate(currentUserProvider.getCurrentUser(), id);
  }
}
