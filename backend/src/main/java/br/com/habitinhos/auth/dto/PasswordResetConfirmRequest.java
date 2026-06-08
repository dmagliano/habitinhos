package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordResetConfirmRequest(
    @NotBlank(message = "Código é obrigatório.")
    @Pattern(regexp = "[A-Za-z0-9]{6}", message = "Código deve ter 6 letras ou números.")
    String token,

    @NotBlank(message = "Nova senha é obrigatória.")
    @Size(min = 8, max = 120, message = "Senha deve ter entre 8 e 120 caracteres.")
    String newPassword) {
}
