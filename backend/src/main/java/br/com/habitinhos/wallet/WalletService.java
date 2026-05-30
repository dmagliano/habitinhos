package br.com.habitinhos.wallet;

import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.dto.WalletResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

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
      throw new ConflictException("WALLET_ALREADY_EXISTS", "Carteira já existe para esta criança.");
    }

    return walletRepository.save(new Wallet(familyUnitId, childId, 0));
  }

  @Transactional
  public CoinTransaction creditForMission(
      UUID familyUnitId,
      UUID childId,
      UUID assignedMissionId,
      int amount,
      UUID createdByUserId) {
    if (amount <= 0) {
      throw new ConflictException("INVALID_COIN_AMOUNT", "Quantidade de moedas deve ser maior que zero.");
    }
    if (coinTransactionRepository.existsByAssignedMissionIdAndTypeAndSourceType(
        assignedMissionId,
        CoinTransactionType.CREDIT,
        CoinTransactionSourceType.MISSION_COMPLETION)) {
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
    return coinTransactionRepository.save(transaction);
  }

  @Transactional(readOnly = true)
  public WalletResponse getWallet(CurrentUser currentUser, UUID childId) {
    childProfileRepository.findByIdAndFamilyUnitId(childId, currentUser.familyUnitId())
        .orElseThrow(() -> new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada."));

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, currentUser.familyUnitId())
        .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
    return new WalletResponse(
        wallet.getChildId(),
        wallet.getBalance(),
        wallet.getCreatedAt(),
        wallet.getUpdatedAt());
  }
}
