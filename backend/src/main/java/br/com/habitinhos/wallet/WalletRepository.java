package br.com.habitinhos.wallet;

import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {

  Optional<Wallet> findByChildIdAndFamilyUnitId(UUID childId, UUID familyUnitId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select w
      from Wallet w
      where w.childId = :childId
        and w.familyUnitId = :familyUnitId
      """)
  Optional<Wallet> findByChildIdAndFamilyUnitIdForUpdate(
      @Param("childId") UUID childId,
      @Param("familyUnitId") UUID familyUnitId);

  boolean existsByChildId(UUID childId);
}
