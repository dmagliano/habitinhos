package br.com.habitinhos.children.dto;

import java.time.Instant;
import java.util.UUID;

public record ChildResponse(
    UUID id,
    String name,
    Integer age,
    String avatarKey,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
