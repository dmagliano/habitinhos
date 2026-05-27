package br.com.habitinhos.children;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildProfileRepository extends JpaRepository<ChildProfile, UUID> {

  List<ChildProfile> findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(UUID familyUnitId);

  Optional<ChildProfile> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  Optional<ChildProfile> findByIdAndFamilyUnitIdAndActiveTrue(UUID id, UUID familyUnitId);
}
