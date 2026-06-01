package br.com.habitinhos.rewards.dto;

import br.com.habitinhos.rewards.RewardRedemptionStatus;
import java.time.Instant;
import java.util.UUID;

public record RewardRedemptionResponse(
    UUID id,
    UUID rewardId,
    UUID childId,
    UUID walletId,
    RewardRedemptionStatus status,
    String snapshotTitle,
    int snapshotCost,
    UUID coinTransactionId,
    Instant createdAt,
    Instant updatedAt) {
}
