package br.com.habitinhos.missions.dto;

import br.com.habitinhos.missions.RecurrenceType;
import java.time.Instant;
import java.util.UUID;

public record MissionResponse(
    UUID id,
    String title,
    String description,
    int coinValue,
    boolean requiresApproval,
    RecurrenceType recurrenceType,
    int completionWindowDays,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
