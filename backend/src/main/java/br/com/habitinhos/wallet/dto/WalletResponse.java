package br.com.habitinhos.wallet.dto;

import java.time.Instant;
import java.util.UUID;

public record WalletResponse(
    UUID childId,
    int balance,
    Instant createdAt,
    Instant updatedAt) {
}
