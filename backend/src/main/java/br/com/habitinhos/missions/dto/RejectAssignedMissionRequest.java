package br.com.habitinhos.missions.dto;

import jakarta.validation.constraints.Size;

public record RejectAssignedMissionRequest(
    @Size(max = 500, message = "Motivo deve ter no máximo 500 caracteres.")
    String reason,

    Boolean returnToPending) {
}
