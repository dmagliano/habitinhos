package br.com.habitinhos.wallet;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.dto.CoinTransactionResponse;
import br.com.habitinhos.wallet.dto.WalletResponse;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

  private static final Logger log = LoggerFactory.getLogger(WalletService.class);

  private final WalletRepository walletRepository;
  private final CoinTransactionRepository coinTransactionRepository;
  private final ChildProfileRepository childProfileRepository;

  public WalletService(
      WalletRepository walletRepository,
      CoinTransactionRepository coinTransactionRepository,
      ChildProfileRepository childProfileRepository) {
    this.walletRepository = walletRepository;
    this.coinTransactionRepository = coinTransactionRepository;
    this.childProfileRepository = childProfileRepository;
  }

  @Transactional
  public Wallet createForChild(UUID familyUnitId, UUID childId) {
    if (walletRepository.existsByChildId(childId)) {
      log.warn("Wallet creation blocked: wallet already exists for childId={}", childId);
      throw new ConflictException("WALLET_ALREADY_EXISTS", "Carteira já existe para esta criança.");
    }

    Wallet wallet = walletRepository.save(new Wallet(familyUnitId, childId, 0));
    log.info("Wallet created: familyUnitId={} childId={} walletId={}", familyUnitId, childId, wallet.getId());
    return wallet;
  }

  @Transactional
  public CoinTransaction creditForMission(
      UUID familyUnitId,
      UUID childId,
      UUID assignedMissionId,
      int amount,
      UUID createdByUserId) {
    if (amount <= 0) {
      log.warn("Mission credit blocked: invalid amount={} assignedMissionId={}", amount, assignedMissionId);
      throw new ConflictException("INVALID_COIN_AMOUNT", "Quantidade de moedas deve ser maior que zero.");
    }
    if (coinTransactionRepository.existsByAssignedMissionIdAndTypeAndSourceType(
        assignedMissionId,
        CoinTransactionType.CREDIT,
        CoinTransactionSourceType.MISSION_COMPLETION)) {
      log.warn("Mission credit blocked: duplicate transaction for assignedMissionId={}", assignedMissionId);
      throw new ConflictException(
          "COIN_TRANSACTION_ALREADY_EXISTS",
          "Crédito de moedas já registrado para esta missão.");
    }

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitIdForUpdate(childId, familyUnitId)
        .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
    wallet.credit(amount);

    CoinTransaction transaction = CoinTransaction.missionCredit(
        familyUnitId,
        wallet.getId(),
        childId,
        assignedMissionId,
        amount,
        wallet.getBalance(),
        "Crédito por missão concluída",
        createdByUserId);
    CoinTransaction saved = coinTransactionRepository.save(transaction);
    log.info(
        "Mission credit recorded: familyUnitId={} childId={} assignedMissionId={} amount={} transactionId={}",
        familyUnitId,
        childId,
        assignedMissionId,
        amount,
        saved.getId());
    return saved;
  }

  @Transactional
  public CoinTransaction debitForRewardRedemption(
      UUID familyUnitId,
      UUID childId,
      UUID rewardRedemptionId,
      int amount,
      UUID createdByUserId) {
    if (amount <= 0) {
      log.warn("Reward debit blocked: invalid amount={} rewardRedemptionId={}", amount, rewardRedemptionId);
      throw new ConflictException("INVALID_COIN_AMOUNT", "Quantidade de moedas deve ser maior que zero.");
    }
    if (coinTransactionRepository.existsByRewardRedemptionIdAndTypeAndSourceType(
        rewardRedemptionId,
        CoinTransactionType.DEBIT,
        CoinTransactionSourceType.REWARD_REDEMPTION)) {
      log.warn("Reward debit blocked: duplicate transaction for rewardRedemptionId={}", rewardRedemptionId);
      throw new ConflictException(
          "COIN_TRANSACTION_ALREADY_EXISTS",
          "Débito de moedas já registrado para este resgate.");
    }

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitIdForUpdate(childId, familyUnitId)
        .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
    if (wallet.getBalance() < amount) {
      log.warn(
          "Reward debit blocked: insufficient balance for childId={} balance={} amount={}",
          childId,
          wallet.getBalance(),
          amount);
      throw new ConflictException("INSUFFICIENT_BALANCE", "Saldo insuficiente para resgatar esta recompensa.");
    }
    wallet.debit(amount);

    CoinTransaction transaction = CoinTransaction.rewardRedemptionDebit(
        familyUnitId,
        wallet.getId(),
        childId,
        rewardRedemptionId,
        amount,
        wallet.getBalance(),
        "Débito por resgate de recompensa",
        createdByUserId);
    CoinTransaction saved = coinTransactionRepository.save(transaction);
    log.info(
        "Reward debit recorded: familyUnitId={} childId={} rewardRedemptionId={} amount={} transactionId={}",
        familyUnitId,
        childId,
        rewardRedemptionId,
        amount,
        saved.getId());
    return saved;
  }

  @Transactional(readOnly = true)
  public WalletResponse getWallet(CurrentUser currentUser, UUID childId) {
    childProfileRepository.findByIdAndFamilyUnitId(childId, currentUser.familyUnitId())
        .orElseThrow(() -> new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada."));

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, currentUser.familyUnitId())
        .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
    log.debug("Wallet resolved: familyUnitId={} childId={} walletId={}", currentUser.familyUnitId(), childId, wallet.getId());
    return new WalletResponse(
        wallet.getChildId(),
        wallet.getBalance(),
        wallet.getCreatedAt(),
        wallet.getUpdatedAt());
  }

  @Transactional(readOnly = true)
  public List<CoinTransactionResponse> getStatement(CurrentUser currentUser, UUID childId) {
    childProfileRepository.findByIdAndFamilyUnitId(childId, currentUser.familyUnitId())
        .orElseThrow(() -> new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada."));

    List<CoinTransactionResponse> statement = coinTransactionRepository
        .findAllByFamilyUnitIdAndChildIdOrderByCreatedAtDesc(currentUser.familyUnitId(), childId)
        .stream()
        .map(this::toResponse)
        .toList();
    log.debug("Wallet statement listed: familyUnitId={} childId={} count={}", currentUser.familyUnitId(), childId, statement.size());
    return statement;
  }

  private CoinTransactionResponse toResponse(CoinTransaction transaction) {
    return new CoinTransactionResponse(
        transaction.getId(),
        transaction.getChildId(),
        transaction.getAssignedMissionId(),
        transaction.getRewardRedemptionId(),
        transaction.getType(),
        transaction.getSourceType(),
        transaction.getAmount(),
        transaction.getBalanceAfter(),
        transaction.getDescription(),
        transaction.getCreatedAt());
  }
}
