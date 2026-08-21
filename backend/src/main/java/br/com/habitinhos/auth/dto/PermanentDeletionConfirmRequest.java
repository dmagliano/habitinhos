package br.com.habitinhos.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Confirmação irreversível de exclusão permanente por e-mail e código")
public record PermanentDeletionConfirmRequest(
    @Schema(description = "E-mail informado na solicitação", format = "email", example = "responsavel@example.com")
    @NotBlank(message = "E-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    @Size(max = 320, message = "E-mail deve ter no máximo 320 caracteres.")
    String email,

    @Schema(description = "Código de uso único enviado por e-mail", example = "A1B2C3")
    @NotBlank(message = "Código é obrigatório.")
    @Pattern(regexp = "[A-Za-z0-9]{6}", message = "Código deve ter 6 letras ou números.")
    String token) {

  public PermanentDeletionConfirmRequest {
    email = email == null ? null : email.trim();
  }
}
