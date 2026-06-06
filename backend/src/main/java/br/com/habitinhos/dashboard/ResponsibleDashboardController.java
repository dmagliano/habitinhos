package br.com.habitinhos.dashboard;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.dashboard.dto.ResponsibleDashboardResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard/responsible")
public class ResponsibleDashboardController {

  private static final Logger log = LoggerFactory.getLogger(ResponsibleDashboardController.class);

  private final ResponsibleDashboardService responsibleDashboardService;
  private final CurrentUserProvider currentUserProvider;

  public ResponsibleDashboardController(
      ResponsibleDashboardService responsibleDashboardService,
      CurrentUserProvider currentUserProvider) {
    this.responsibleDashboardService = responsibleDashboardService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping
  public ResponsibleDashboardResponse getDashboard() {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Responsible dashboard request: familyUnitId={}", currentUser.familyUnitId());
    return responsibleDashboardService.getDashboard(currentUser);
  }
}
