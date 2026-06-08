package br.com.habitinhos.config;

import br.com.habitinhos.auth.AccountEmailSender;
import br.com.habitinhos.auth.LoggingAccountEmailSender;
import br.com.habitinhos.auth.ResendAccountEmailSender;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(EmailProperties.class)
public class EmailConfig {

  @Bean
  public AccountEmailSender accountEmailSender(
      EmailProperties properties, RestClient.Builder restClientBuilder) {
    if (StringUtils.hasText(properties.getResend().getApiKey())) {
      return new ResendAccountEmailSender(properties, restClientBuilder);
    }

    return new LoggingAccountEmailSender();
  }
}
