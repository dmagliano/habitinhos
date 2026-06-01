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

  private final RewardService rewardService;
  private final CurrentUserProvider currentUserProvider;

  public RewardController(RewardService rewardService, CurrentUserProvider currentUserProvider) {
    this.rewardService = rewardService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public RewardResponse create(@Valid @RequestBody CreateRewardRequest request) {
    return rewardService.create(currentUserProvider.getCurrentUser(), request);
  }

  @GetMapping
  public List<RewardResponse> listActive() {
    return rewardService.listActive(currentUserProvider.getCurrentUser());
  }

  @GetMapping("/{id}")
  public RewardResponse findById(@PathVariable UUID id) {
    return rewardService.findById(currentUserProvider.getCurrentUser(), id);
  }

  @PutMapping("/{id}")
  public RewardResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateRewardRequest request) {
    return rewardService.update(currentUserProvider.getCurrentUser(), id, request);
  }

  @PatchMapping("/{id}/deactivate")
  public RewardResponse deactivate(@PathVariable UUID id) {
    return rewardService.deactivate(currentUserProvider.getCurrentUser(), id);
  }

  @PostMapping("/{id}/redeem")
  @ResponseStatus(HttpStatus.CREATED)
  public RewardRedemptionResponse redeem(
      @PathVariable UUID id,
      @Valid @RequestBody RedeemRewardRequest request) {
    return rewardService.redeem(currentUserProvider.getCurrentUser(), id, request);
  }
}
