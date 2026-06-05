package br.com.habitinhos.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Nome é obrigatório.")
    @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres.")
    String name,

    @NotBlank(message = "E-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    @Size(max = 320, message = "E-mail deve ter no máximo 320 caracteres.")
    String email,

    @NotBlank(message = "Senha é obrigatória.")
    @Size(min = 8, max = 120, message = "Senha deve ter entre 8 e 120 caracteres.")
    String password,

    @NotBlank(message = "Nome da família é obrigatório.")
    @Size(max = 160, message = "Nome da família deve ter no máximo 160 caracteres.")
    String familyName,

    @NotBlank(message = "PIN do responsável é obrigatório.")
    @Pattern(regexp = "\\d{4}", message = "PIN do responsável deve ter 4 dígitos.")
    String responsiblePin) {
}
