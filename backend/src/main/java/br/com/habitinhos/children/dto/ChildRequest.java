package br.com.habitinhos.children.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChildRequest(
    @NotBlank(message = "Nome é obrigatório.")
    @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres.")
    String name,

    @Min(value = 0, message = "Idade não pode ser negativa.")
    Integer age,

    @Size(max = 80, message = "Avatar deve ter no máximo 80 caracteres.")
    String avatarKey,

    @Size(min = 4, max = 20, message = "PIN deve ter entre 4 e 20 caracteres.")
    String accessPin) {
}
