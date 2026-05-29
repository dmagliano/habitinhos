package br.com.habitinhos.missions.dto;

import br.com.habitinhos.missions.RecurrenceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MissionRequest(
    @NotBlank(message = "Título é obrigatório.")
    @Size(max = 160, message = "Título deve ter no máximo 160 caracteres.")
    String title,

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres.")
    String description,

    @Min(value = 1, message = "Moedas deve ser maior que zero.")
    int coinValue,

    @NotNull(message = "requiresApproval é obrigatório.")
    Boolean requiresApproval,

    @NotNull(message = "recurrenceType é obrigatório.")
    RecurrenceType recurrenceType) {
}
