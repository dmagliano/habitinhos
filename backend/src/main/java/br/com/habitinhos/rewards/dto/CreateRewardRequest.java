package br.com.habitinhos.rewards.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRewardRequest(
    @NotBlank(message = "Título é obrigatório.")
    @Size(max = 160, message = "Título deve ter no máximo 160 caracteres.")
    String title,

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres.")
    String description,

    @Min(value = 1, message = "Custo deve ser maior que zero.")
    int cost) {
}
