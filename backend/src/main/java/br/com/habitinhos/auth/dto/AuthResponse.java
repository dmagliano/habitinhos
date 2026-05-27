package br.com.habitinhos.auth.dto;

import br.com.habitinhos.auth.UserRole;
import java.util.UUID;

public record AuthResponse(
    String token,
    UserSummary user,
    FamilySummary family) {

  public record UserSummary(
      UUID id,
      String name,
      String email,
      UserRole role) {
  }

  public record FamilySummary(
      UUID id,
      String name) {
  }
}
