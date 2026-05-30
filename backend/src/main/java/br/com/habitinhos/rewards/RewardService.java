package br.com.habitinhos.rewards;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.RewardResponse;
import br.com.habitinhos.rewards.dto.UpdateRewardRequest;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

  private final RewardRepository rewardRepository;

  public RewardService(RewardRepository rewardRepository) {
    this.rewardRepository = rewardRepository;
  }

  @Transactional
  public RewardResponse create(CurrentUser currentUser, CreateRewardRequest request) {
    requireResponsible(currentUser);
    Reward reward = new Reward(
        currentUser.familyUnitId(),
        request.title().trim(),
        normalizeOptional(request.description()),
        request.cost(),
        currentUser.userId());
    rewardRepository.saveAndFlush(reward);
    return toResponse(reward);
  }

  @Transactional(readOnly = true)
  public List<RewardResponse> listActive(CurrentUser currentUser) {
    return rewardRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId())
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public RewardResponse findById(CurrentUser currentUser, UUID rewardId) {
    requireResponsible(currentUser);
    Reward reward = rewardRepository.findByIdAndFamilyUnitId(rewardId, currentUser.familyUnitId())
        .orElseThrow(this::rewardNotFound);
    return toResponse(reward);
  }

  @Transactional
  public RewardResponse update(CurrentUser currentUser, UUID rewardId, UpdateRewardRequest request) {
    requireResponsible(currentUser);
    Reward reward = rewardRepository.findByIdAndFamilyUnitIdAndActiveTrue(rewardId, currentUser.familyUnitId())
        .orElseThrow(this::rewardNotFound);
    reward.update(
        request.title().trim(),
        normalizeOptional(request.description()),
        request.cost());
    return toResponse(reward);
  }

  @Transactional
  public RewardResponse deactivate(CurrentUser currentUser, UUID rewardId) {
    requireResponsible(currentUser);
    Reward reward = rewardRepository.findByIdAndFamilyUnitIdAndActiveTrue(rewardId, currentUser.familyUnitId())
        .orElseThrow(this::rewardNotFound);
    reward.deactivate();
    return toResponse(reward);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private String normalizeOptional(String value) {
    return value == null || value.trim().isEmpty() ? null : value.trim();
  }

  private NotFoundException rewardNotFound() {
    return new NotFoundException("REWARD_NOT_FOUND", "Recompensa não encontrada.");
  }

  private RewardResponse toResponse(Reward reward) {
    return new RewardResponse(
        reward.getId(),
        reward.getTitle(),
        reward.getDescription(),
        reward.getCost(),
        reward.isActive(),
        reward.getCreatedAt(),
        reward.getUpdatedAt());
  }
}
