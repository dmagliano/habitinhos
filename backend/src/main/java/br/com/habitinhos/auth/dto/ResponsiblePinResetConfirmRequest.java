package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResponsiblePinResetConfirmRequest(
    @NotBlank(message = "Código é obrigatório.")
    @Pattern(regexp = "[A-Za-z0-9]{6}", message = "Código deve ter 6 letras ou números.")
    String token,

    @NotBlank(message = "Novo PIN é obrigatório.")
    @Pattern(regexp = "\\d{4}", message = "PIN do responsável deve ter 4 dígitos.")
    String newPin) {
}
