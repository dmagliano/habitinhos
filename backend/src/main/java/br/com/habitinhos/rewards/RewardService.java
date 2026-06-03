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
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

  private static final Logger log = LoggerFactory.getLogger(RewardService.class);

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
    log.info("Reward created: familyUnitId={} rewardId={}", currentUser.familyUnitId(), reward.getId());
    return toResponse(reward);
  }

  @Transactional(readOnly = true)
  public List<RewardResponse> list(CurrentUser currentUser, boolean includeInactive) {
    var rewardEntities = includeInactive
        ? rewardRepository.findAllByFamilyUnitIdOrderByActiveDescCreatedAtAsc(currentUser.familyUnitId())
        : rewardRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId());
    List<RewardResponse> rewards = rewardEntities
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug(
        "Rewards listed: familyUnitId={} includeInactive={} count={}",
        currentUser.familyUnitId(),
        includeInactive,
        rewards.size());
    return rewards;
  }

  @Transactional(readOnly = true)
  public RewardResponse findById(CurrentUser currentUser, UUID rewardId) {
    requireResponsible(currentUser);
    Reward reward = rewardRepository.findByIdAndFamilyUnitId(rewardId, currentUser.familyUnitId())
        .orElseThrow(this::rewardNotFound);
    log.debug("Reward resolved: familyUnitId={} rewardId={}", currentUser.familyUnitId(), rewardId);
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
    log.info("Reward updated: familyUnitId={} rewardId={}", currentUser.familyUnitId(), rewardId);
    return toResponse(reward);
  }

  @Transactional
  public RewardResponse deactivate(CurrentUser currentUser, UUID rewardId) {
    requireResponsible(currentUser);
    Reward reward = rewardRepository.findByIdAndFamilyUnitIdAndActiveTrue(rewardId, currentUser.familyUnitId())
        .orElseThrow(this::rewardNotFound);
    reward.deactivate();
    log.info("Reward deactivated: familyUnitId={} rewardId={}", currentUser.familyUnitId(), rewardId);
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
    log.info(
        "Reward redeemed: familyUnitId={} rewardId={} childId={} redemptionId={} transactionId={}",
        familyUnitId,
        rewardId,
        child.getId(),
        redemption.getId(),
        transaction.getId());
    return toResponse(redemption);
  }

  @Transactional
  public RewardRedemptionResponse markDelivered(CurrentUser currentUser, UUID redemptionId) {
    requireResponsible(currentUser);
    RewardRedemption redemption = rewardRedemptionRepository
        .findByIdAndFamilyUnitId(redemptionId, currentUser.familyUnitId())
        .orElseThrow(this::rewardRedemptionNotFound);
    redemption.markDelivered(Instant.now());
    log.info(
        "Reward redemption delivered: familyUnitId={} redemptionId={}",
        currentUser.familyUnitId(),
        redemptionId);
    return toResponse(redemption);
  }

  private void requireResponsible(CurrentUser currentUser) {
    if (currentUser.role() != UserRole.RESPONSIBLE) {
      log.warn("Access denied: non-responsible role={} familyUnitId={}", currentUser.role(), currentUser.familyUnitId());
      throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
    }
  }

  private String normalizeOptional(String value) {
    return value == null || value.trim().isEmpty() ? null : value.trim();
  }

  private NotFoundException rewardNotFound() {
    return new NotFoundException("REWARD_NOT_FOUND", "Recompensa não encontrada.");
  }

  private NotFoundException rewardRedemptionNotFound() {
    return new NotFoundException("REWARD_REDEMPTION_NOT_FOUND", "Resgate de recompensa não encontrado.");
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
        redemption.getDeliveredAt(),
        redemption.getCreatedAt(),
        redemption.getUpdatedAt());
  }
}
