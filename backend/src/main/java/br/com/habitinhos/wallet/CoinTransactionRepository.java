package br.com.habitinhos.wallet;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, UUID> {

  boolean existsByAssignedMissionIdAndTypeAndSourceType(
      UUID assignedMissionId,
      CoinTransactionType type,
      CoinTransactionSourceType sourceType);

  boolean existsByRewardRedemptionIdAndTypeAndSourceType(
      UUID rewardRedemptionId,
      CoinTransactionType type,
      CoinTransactionSourceType sourceType);

  List<CoinTransaction> findAllByFamilyUnitIdAndChildIdOrderByCreatedAtDesc(
      UUID familyUnitId,
      UUID childId);
}
