package br.com.habitinhos.rewards;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardRepository extends JpaRepository<Reward, UUID> {

  List<Reward> findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(UUID familyUnitId);

  List<Reward> findAllByFamilyUnitIdOrderByActiveDescCreatedAtAsc(UUID familyUnitId);

  Optional<Reward> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  Optional<Reward> findByIdAndFamilyUnitIdAndActiveTrue(UUID id, UUID familyUnitId);
}
