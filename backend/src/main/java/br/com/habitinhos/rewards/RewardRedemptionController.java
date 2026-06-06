package br.com.habitinhos.rewards;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.rewards.dto.RewardRedemptionResponse;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reward-redemptions")
public class RewardRedemptionController {

  private static final Logger log = LoggerFactory.getLogger(RewardRedemptionController.class);

  private final RewardService rewardService;
  private final CurrentUserProvider currentUserProvider;

  public RewardRedemptionController(RewardService rewardService, CurrentUserProvider currentUserProvider) {
    this.rewardService = rewardService;
    this.currentUserProvider = currentUserProvider;
  }

  @PatchMapping("/{id}/delivered")
  public RewardRedemptionResponse markDelivered(@PathVariable UUID id) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.info("Mark reward redemption delivered request: familyUnitId={} redemptionId={}", currentUser.familyUnitId(), id);
    return rewardService.markDelivered(currentUser, id);
  }
}
