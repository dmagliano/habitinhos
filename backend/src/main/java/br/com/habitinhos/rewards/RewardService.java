package br.com.habitinhos.rewards;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.RedeemRewardRequest;
import br.com.habitinhos.rewards.dto.RewardRedemptionResponse;
import br.com.habitinhos.rewards.dto.RewardResponse;
import br.com.habitinhos.rewards.dto.UpdateRewardRequest;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.CoinTransaction;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import br.com.habitinhos.wallet.WalletService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

  private final RewardRepository rewardRepository;
  private final RewardRedemptionRepository rewardRedemptionRepository;
  private final ChildProfileRepository childProfileRepository;
  private final WalletRepository walletRepository;
  private final WalletService walletService;

  public RewardService(
      RewardRepository rewardRepository,
      RewardRedemptionRepository rewardRedemptionRepository,
      ChildProfileRepository childProfileRepository,
      WalletRepository walletRepository,
      WalletService walletService) {
    this.rewardRepository = rewardRepository;
    this.rewardRedemptionRepository = rewardRedemptionRepository;
    this.childProfileRepository = childProfileRepository;
    this.walletRepository = walletRepository;
    this.walletService = walletService;
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

  @Transactional
  public RewardRedemptionResponse redeem(CurrentUser currentUser, UUID rewardId, RedeemRewardRequest request) {
    UUID familyUnitId = currentUser.familyUnitId();
    Reward reward = rewardRepository.findByIdAndFamilyUnitIdAndActiveTrue(rewardId, familyUnitId)
        .orElseThrow(this::rewardNotFound);
    ChildProfile child = childProfileRepository
        .findByIdAndFamilyUnitIdAndActiveTrue(request.childId(), familyUnitId)
        .orElseThrow(this::childNotFound);
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(child.getId(), familyUnitId)
        .orElseThrow(this::walletNotFound);

    RewardRedemption redemption = rewardRedemptionRepository.saveAndFlush(new RewardRedemption(
        familyUnitId,
        child.getId(),
        wallet.getId(),
        reward));
    CoinTransaction transaction = walletService.debitForRewardRedemption(
        familyUnitId,
        child.getId(),
        redemption.getId(),
        reward.getCost(),
        currentUser.userId());
    redemption.linkCoinTransaction(transaction.getId());
    return toResponse(redemption);
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

  private NotFoundException childNotFound() {
    return new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada.");
  }

  private NotFoundException walletNotFound() {
    return new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada.");
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

  private RewardRedemptionResponse toResponse(RewardRedemption redemption) {
    return new RewardRedemptionResponse(
        redemption.getId(),
        redemption.getRewardId(),
        redemption.getChildId(),
        redemption.getWalletId(),
        redemption.getStatus(),
        redemption.getSnapshotTitle(),
        redemption.getSnapshotCost(),
        redemption.getCoinTransactionId(),
        redemption.getCreatedAt(),
        redemption.getUpdatedAt());
  }
}
