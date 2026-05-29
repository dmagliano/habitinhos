package br.com.habitinhos.missions;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignedMissionRepository extends JpaRepository<AssignedMission, UUID> {

  Optional<AssignedMission> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  List<AssignedMission> findAllByFamilyUnitIdAndChildIdAndStatusOrderByDueDateAscCreatedAtAsc(
      UUID familyUnitId, UUID childId, AssignedMissionStatus status);

  List<AssignedMission> findAllByFamilyUnitIdAndStatusOrderByCompletedAtAsc(
      UUID familyUnitId, AssignedMissionStatus status);

  boolean existsByMissionIdAndChildIdAndStatusIn(
      UUID missionId, UUID childId, List<AssignedMissionStatus> statuses);
}
