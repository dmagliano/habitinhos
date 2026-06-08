package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record DeleteAccountRequest(
    @NotBlank(message = "Senha é obrigatória.")
    String password) {
}
