package br.com.habitinhos.rewards;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, UUID> {

  Optional<RewardRedemption> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  List<RewardRedemption> findAllByFamilyUnitIdAndChildIdOrderByCreatedAtDesc(
      UUID familyUnitId,
      UUID childId);

  List<RewardRedemption> findAllByFamilyUnitIdOrderByCreatedAtDesc(
      UUID familyUnitId,
      Pageable pageable);
}
