package br.com.habitinhos.rewards.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RedeemRewardRequest(
    @NotNull(message = "Criança é obrigatória.")
    UUID childId) {
}
