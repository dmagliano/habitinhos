package br.com.habitinhos.rewards;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.RedeemRewardRequest;
import br.com.habitinhos.rewards.dto.RewardRedemptionResponse;
import br.com.habitinhos.rewards.dto.RewardResponse;
import br.com.habitinhos.rewards.dto.UpdateRewardRequest;
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
@RequestMapping("/rewards")
public class RewardController {

  private static final Logger log = LoggerFactory.getLogger(RewardController.class);

  private final RewardService rewardService;
  private final CurrentUserProvider currentUserProvider;

  public RewardController(RewardService rewardService, CurrentUserProvider currentUserProvider) {
    this.rewardService = rewardService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public RewardResponse create(@Valid @RequestBody CreateRewardRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Create reward request: familyUnitId={}", currentUser.familyUnitId());
    return rewardService.create(currentUser, request);
  }

  @GetMapping
  public List<RewardResponse> listActive() {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("List rewards request: familyUnitId={}", currentUser.familyUnitId());
    return rewardService.listActive(currentUser);
  }

  @GetMapping("/{id}")
  public RewardResponse findById(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Get reward request: familyUnitId={} rewardId={}", currentUser.familyUnitId(), id);
    return rewardService.findById(currentUser, id);
  }

  @PutMapping("/{id}")
  public RewardResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateRewardRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Update reward request: familyUnitId={} rewardId={}", currentUser.familyUnitId(), id);
    return rewardService.update(currentUser, id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public RewardResponse deactivate(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Deactivate reward request: familyUnitId={} rewardId={}", currentUser.familyUnitId(), id);
    return rewardService.deactivate(currentUser, id);
  }

  @PostMapping("/{id}/redeem")
  @ResponseStatus(HttpStatus.CREATED)
  public RewardRedemptionResponse redeem(
      @PathVariable UUID id,
      @Valid @RequestBody RedeemRewardRequest request) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info(
        "Redeem reward request: familyUnitId={} rewardId={} childId={}",
        currentUser.familyUnitId(),
        id,
        request.childId());
    return rewardService.redeem(currentUser, id, request);
  }
}
