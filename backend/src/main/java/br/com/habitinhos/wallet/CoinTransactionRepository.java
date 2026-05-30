package br.com.habitinhos.wallet;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, UUID> {

  boolean existsByAssignedMissionIdAndTypeAndSourceType(
      UUID assignedMissionId,
      CoinTransactionType type,
      CoinTransactionSourceType sourceType);
}
