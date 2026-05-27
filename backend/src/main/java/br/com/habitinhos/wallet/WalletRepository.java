package br.com.habitinhos.wallet;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {

  Optional<Wallet> findByChildIdAndFamilyUnitId(UUID childId, UUID familyUnitId);

  boolean existsByChildId(UUID childId);
}
