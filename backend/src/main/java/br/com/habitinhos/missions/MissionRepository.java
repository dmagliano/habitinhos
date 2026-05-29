package br.com.habitinhos.missions;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, UUID> {

  List<Mission> findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(UUID familyUnitId);

  Optional<Mission> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  Optional<Mission> findByIdAndFamilyUnitIdAndActiveTrue(UUID id, UUID familyUnitId);
}
