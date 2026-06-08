package br.com.habitinhos.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import br.com.habitinhos.config.EmailConfig;
import br.com.habitinhos.config.EmailProperties;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class ResendAccountEmailSenderTest {

  @Test
  void sendsPasswordResetThroughResendApi() {
    RestClient.Builder restClientBuilder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(restClientBuilder).build();
    ResendAccountEmailSender sender = new ResendAccountEmailSender(resendProperties(), restClientBuilder);

    server.expect(once(), requestTo("https://api.resend.test/emails"))
        .andExpect(method(HttpMethod.POST))
        .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer re_test"))
        .andExpect(header(HttpHeaders.USER_AGENT, "habitinhos-test/1.0"))
        .andExpect(jsonPath("$.from").value("Habitinhos <noreply@example.com>"))
        .andExpect(jsonPath("$.to[0]").value("resp@example.com"))
        .andExpect(jsonPath("$.subject").value("Recuperação de senha do Habitinhos"))
        .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.containsString("ABC123")))
        .andExpect(jsonPath("$.text").value(org.hamcrest.Matchers.containsString("ABC123")))
        .andRespond(withSuccess("{\"id\":\"email-123\"}", MediaType.APPLICATION_JSON));

    sender.sendPasswordReset("resp@example.com", "ABC123", Instant.parse("2026-06-07T19:30:00Z"));

    server.verify();
  }

  @Test
  void sendsWelcomeEmailThroughResendApi() {
    RestClient.Builder restClientBuilder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(restClientBuilder).build();
    ResendAccountEmailSender sender = new ResendAccountEmailSender(resendProperties(), restClientBuilder);

    server.expect(once(), requestTo("https://api.resend.test/emails"))
        .andExpect(method(HttpMethod.POST))
        .andExpect(jsonPath("$.to[0]").value("resp@example.com"))
        .andExpect(jsonPath("$.subject").value("Bem-vindo ao Habitinhos"))
        .andExpect(jsonPath("$.html").value(org.hamcrest.Matchers.containsString("Família &lt;Demo&gt;")))
        .andRespond(withSuccess("{\"id\":\"email-456\"}", MediaType.APPLICATION_JSON));

    sender.sendWelcome("resp@example.com", "Responsável", "Família <Demo>");

    server.verify();
  }

  @Test
  void raisesDeliveryExceptionWhenResendRejectsRequest() {
    RestClient.Builder restClientBuilder = RestClient.builder();
    MockRestServiceServer server = MockRestServiceServer.bindTo(restClientBuilder).build();
    ResendAccountEmailSender sender = new ResendAccountEmailSender(resendProperties(), restClientBuilder);

    server.expect(once(), requestTo("https://api.resend.test/emails"))
        .andRespond(withServerError());

    assertThatThrownBy(() -> sender.sendResponsiblePinReset(
        "resp@example.com",
        "PIN456",
        Instant.parse("2026-06-07T19:30:00Z")))
        .isInstanceOf(ResendAccountEmailSender.EmailDeliveryException.class);

    server.verify();
  }

  @Test
  void emailConfigFallsBackToLoggingSenderWithoutResendApiKey() {
    EmailProperties properties = new EmailProperties();

    AccountEmailSender sender = new EmailConfig().accountEmailSender(properties, RestClient.builder());

    assertThat(sender).isInstanceOf(LoggingAccountEmailSender.class);
  }

  @Test
  void emailConfigUsesResendSenderWhenApiKeyExists() {
    EmailProperties properties = resendProperties();

    AccountEmailSender sender = new EmailConfig().accountEmailSender(properties, RestClient.builder());

    assertThat(sender).isInstanceOf(ResendAccountEmailSender.class);
  }

  private EmailProperties resendProperties() {
    EmailProperties properties = new EmailProperties();
    properties.setFrom("Habitinhos <noreply@example.com>");
    properties.setUserAgent("habitinhos-test/1.0");
    properties.getResend().setApiKey("re_test");
    properties.getResend().setBaseUrl("https://api.resend.test");
    return properties;
  }
}
