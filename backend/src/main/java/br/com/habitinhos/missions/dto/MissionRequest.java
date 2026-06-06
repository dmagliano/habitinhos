package br.com.habitinhos.missions.dto;

import br.com.habitinhos.missions.RecurrenceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Max;

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
    RecurrenceType recurrenceType,

    @Min(value = 0, message = "Prazo para concluir não pode ser negativo.")
    @Max(value = 30, message = "Prazo para concluir deve ter no máximo 30 dias.")
    int completionWindowDays) {

  public MissionRequest(
      String title,
      String description,
      int coinValue,
      Boolean requiresApproval,
      RecurrenceType recurrenceType) {
    this(title, description, coinValue, requiresApproval, recurrenceType, 0);
  }
}
