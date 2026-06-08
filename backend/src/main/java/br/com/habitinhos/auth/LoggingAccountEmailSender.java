package br.com.habitinhos.auth;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggingAccountEmailSender implements AccountEmailSender {

  private static final Logger log = LoggerFactory.getLogger(LoggingAccountEmailSender.class);

  @Override
  public void sendWelcome(String email, String responsibleName, String familyName) {
    log.info("Welcome email requested for email={} responsibleName={} familyName={}", email, responsibleName, familyName);
  }

  @Override
  public void sendPasswordReset(String email, String token, Instant expiresAt) {
    log.info("Password reset email requested for email={} expiresAt={}", email, expiresAt);
    log.debug("Password reset local code for email={} code={}", email, token);
  }

  @Override
  public void sendResponsiblePinReset(String email, String token, Instant expiresAt) {
    log.info("Responsible PIN reset email requested for email={} expiresAt={}", email, expiresAt);
    log.debug("Responsible PIN reset local code for email={} code={}", email, token);
  }
}
