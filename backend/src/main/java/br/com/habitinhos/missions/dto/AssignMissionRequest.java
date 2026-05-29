package br.com.habitinhos.missions.dto;

import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AssignMissionRequest(
    @NotEmpty(message = "Informe ao menos uma criança para atribuição.")
    List<UUID> childIds,
    LocalDate dueDate) {
}
