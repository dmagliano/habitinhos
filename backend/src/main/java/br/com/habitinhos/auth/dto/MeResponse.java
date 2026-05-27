package br.com.habitinhos.auth.dto;

import br.com.habitinhos.auth.UserRole;
import java.util.UUID;

public record MeResponse(
    UUID id,
    String name,
    String email,
    UserRole role,
    UUID familyId,
    String familyName) {
}
