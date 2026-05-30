package br.com.habitinhos.rewards.dto;

import java.time.Instant;
import java.util.UUID;

public record RewardResponse(
    UUID id,
    String title,
    String description,
    int cost,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
