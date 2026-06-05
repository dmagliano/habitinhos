package br.com.habitinhos.missions.dto;

import br.com.habitinhos.missions.AssignedMissionStatus;
import br.com.habitinhos.missions.RecurrenceType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssignedMissionResponse(
    UUID id,
    UUID missionId,
    UUID childId,
    AssignedMissionStatus status,
    LocalDate scheduledDate,
    LocalDate dueDate,
    Instant completedAt,
    Instant approvedAt,
    Instant rejectedAt,
    String rejectionReason,
    String snapshotTitle,
    String snapshotDescription,
    int snapshotCoinValue,
    boolean snapshotRequiresApproval,
    RecurrenceType snapshotRecurrenceType,
    int snapshotCompletionWindowDays,
    Instant createdAt,
    Instant updatedAt) {
}
