package br.com.habitinhos.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Solicitação pública de exclusão permanente por e-mail")
public record PermanentDeletionRequest(
    @Schema(description = "E-mail de todas as contas que serão excluídas", format = "email", example = "responsavel@example.com")
    @NotBlank(message = "E-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    @Size(max = 320, message = "E-mail deve ter no máximo 320 caracteres.")
    String email) {

  public PermanentDeletionRequest {
    email = email == null ? null : email.trim();
  }
}
