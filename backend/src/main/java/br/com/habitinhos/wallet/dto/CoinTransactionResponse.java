package br.com.habitinhos.wallet.dto;

import br.com.habitinhos.wallet.CoinTransactionSourceType;
import br.com.habitinhos.wallet.CoinTransactionType;
import java.time.Instant;
import java.util.UUID;

public record CoinTransactionResponse(
    UUID id,
    UUID childId,
    UUID assignedMissionId,
    UUID rewardRedemptionId,
    CoinTransactionType type,
    CoinTransactionSourceType sourceType,
    int amount,
    int balanceAfter,
    String description,
    Instant createdAt) {
}
