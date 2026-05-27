package br.com.habitinhos.auth;

import java.util.UUID;

public record CurrentUser(
    UUID userId,
    UUID familyUnitId,
    UserRole role,
    String email) {
}
