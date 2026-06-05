package br.com.habitinhos.missions;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssignedMissionRepository extends JpaRepository<AssignedMission, UUID> {

  Optional<AssignedMission> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  @Query("""
      select assignedMission
      from AssignedMission assignedMission
      where assignedMission.familyUnitId = :familyUnitId
        and assignedMission.childId = :childId
        and assignedMission.status = :status
        and (assignedMission.dueDate is null or assignedMission.dueDate >= :today)
      order by assignedMission.dueDate asc, assignedMission.createdAt asc
      """)
  List<AssignedMission> findVisiblePendingForChild(
      @Param("familyUnitId") UUID familyUnitId,
      @Param("childId") UUID childId,
      @Param("status") AssignedMissionStatus status,
      @Param("today") LocalDate today);

  List<AssignedMission> findAllByFamilyUnitIdAndChildIdAndSnapshotRecurrenceTypeIn(
      UUID familyUnitId, UUID childId, List<RecurrenceType> recurrenceTypes);

  List<AssignedMission> findAllByFamilyUnitIdAndChildIdIn(
      UUID familyUnitId, List<UUID> childIds);

  List<AssignedMission> findAllByFamilyUnitIdAndStatusOrderByCompletedAtAsc(
      UUID familyUnitId, AssignedMissionStatus status);

  boolean existsByMissionIdAndChildIdAndStatusIn(
      UUID missionId, UUID childId, List<AssignedMissionStatus> statuses);

  boolean existsByFamilyUnitIdAndMissionIdAndChildIdAndStatusIn(
      UUID familyUnitId, UUID missionId, UUID childId, List<AssignedMissionStatus> statuses);

  boolean existsByFamilyUnitIdAndMissionIdAndChildIdAndScheduledDate(
      UUID familyUnitId, UUID missionId, UUID childId, LocalDate scheduledDate);
}
