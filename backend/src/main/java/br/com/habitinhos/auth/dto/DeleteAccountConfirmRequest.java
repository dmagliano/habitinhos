package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DeleteAccountConfirmRequest(
    @NotBlank(message = "Código é obrigatório.")
    @Pattern(regexp = "[A-Za-z0-9]{6}", message = "Código deve ter 6 letras ou números.")
    String token,

    @NotBlank(message = "Senha é obrigatória.")
    String password) {
}
