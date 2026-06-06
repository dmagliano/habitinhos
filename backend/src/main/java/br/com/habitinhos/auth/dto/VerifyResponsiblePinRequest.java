package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyResponsiblePinRequest(
    @NotBlank(message = "PIN do responsável é obrigatório.")
    @Pattern(regexp = "\\d{4}", message = "PIN do responsável deve ter 4 dígitos.")
    String pin) {
}
