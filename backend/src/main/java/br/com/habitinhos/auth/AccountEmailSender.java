package br.com.habitinhos.auth;

import java.time.Instant;

public interface AccountEmailSender {

  void sendWelcome(String email, String responsibleName, String familyName);

  void sendPasswordReset(String email, String token, Instant expiresAt);

  void sendResponsiblePinReset(String email, String token, Instant expiresAt);
}
