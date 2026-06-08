package br.com.habitinhos.auth;

import br.com.habitinhos.config.EmailProperties;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

public class ResendAccountEmailSender implements AccountEmailSender {

  private static final Logger log = LoggerFactory.getLogger(ResendAccountEmailSender.class);
  private static final DateTimeFormatter EXPIRATION_FORMATTER =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm 'UTC'").withZone(ZoneId.of("UTC"));

  private final EmailProperties properties;
  private final RestClient restClient;

  public ResendAccountEmailSender(EmailProperties properties, RestClient.Builder restClientBuilder) {
    this.properties = properties;
    this.restClient = restClientBuilder.clone()
        .baseUrl(properties.getResend().getBaseUrl())
        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getResend().getApiKey())
        .defaultHeader(HttpHeaders.USER_AGENT, properties.getUserAgent())
        .build();
  }

  @Override
  public void sendWelcome(String email, String responsibleName, String familyName) {
    String safeName = escapeHtml(responsibleName);
    String safeFamilyName = escapeHtml(familyName);
    sendEmail(
        email,
        "Bem-vindo ao Habitinhos",
        """
        <p>Olá, %s!</p>
        <p>A conta da família <strong>%s</strong> foi criada no Habitinhos.</p>
        <p>Agora vocês já podem organizar missões, moedas e recompensas em família.</p>
        """.formatted(safeName, safeFamilyName),
        """
        Olá, %s!

        A conta da família %s foi criada no Habitinhos.
        Agora vocês já podem organizar missões, moedas e recompensas em família.
        """.formatted(responsibleName, familyName));
  }

  @Override
  public void sendPasswordReset(String email, String token, Instant expiresAt) {
    sendEmail(
        email,
        "Recuperação de senha do Habitinhos",
        """
        <p>Recebemos uma solicitação para redefinir sua senha no Habitinhos.</p>
        <p>Informe este código no app:</p>
        <p><strong style="font-size: 18px;">%s</strong></p>
        <p>Ele expira em %s.</p>
        <p>Se você não pediu essa alteração, ignore este e-mail.</p>
        """.formatted(escapeHtml(token), EXPIRATION_FORMATTER.format(expiresAt)),
        """
        Recebemos uma solicitação para redefinir sua senha no Habitinhos.

        Código: %s
        Expira em: %s

        Se você não pediu essa alteração, ignore este e-mail.
        """.formatted(token, EXPIRATION_FORMATTER.format(expiresAt)));
  }

  @Override
  public void sendResponsiblePinReset(String email, String token, Instant expiresAt) {
    sendEmail(
        email,
        "Recuperação do PIN do responsável",
        """
        <p>Recebemos uma solicitação para redefinir o PIN do responsável no Habitinhos.</p>
        <p>Informe este código no app:</p>
        <p><strong style="font-size: 18px;">%s</strong></p>
        <p>Ele expira em %s.</p>
        <p>Se você não pediu essa alteração, ignore este e-mail.</p>
        """.formatted(escapeHtml(token), EXPIRATION_FORMATTER.format(expiresAt)),
        """
        Recebemos uma solicitação para redefinir o PIN do responsável no Habitinhos.

        Código: %s
        Expira em: %s

        Se você não pediu essa alteração, ignore este e-mail.
        """.formatted(token, EXPIRATION_FORMATTER.format(expiresAt)));
  }

  private void sendEmail(String to, String subject, String html, String text) {
    try {
      ResendEmailResponse response = restClient.post()
          .uri("/emails")
          .contentType(MediaType.APPLICATION_JSON)
          .body(new ResendEmailRequest(properties.getFrom(), List.of(to), subject, html, text))
          .retrieve()
          .body(ResendEmailResponse.class);

      log.info(
          "Resend email sent: to={} subject={} emailId={}",
          to,
          subject,
          response == null ? null : response.id());
    } catch (RestClientResponseException exception) {
      log.warn(
          "Resend email failed: to={} subject={} status={} body={}",
          to,
          subject,
          exception.getStatusCode().value(),
          exception.getResponseBodyAsString());
      throw new EmailDeliveryException("Resend email delivery failed", exception);
    }
  }

  private String escapeHtml(String value) {
    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }

  private record ResendEmailRequest(
      String from, List<String> to, String subject, String html, String text) {
  }

  private record ResendEmailResponse(String id) {
  }

  public static class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
