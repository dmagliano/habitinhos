package br.com.habitinhos.config;

import static org.springframework.security.config.Customizer.withDefaults;

import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class SecurityConfig {

  private static final List<String> PERMANENT_ACCOUNT_DELETION_CORS_PATHS = List.of(
      "/auth/account-deletion/permanent/request",
      "/auth/account-deletion/permanent/confirm");
  private static final List<String> PERMANENT_ACCOUNT_DELETION_ALLOWED_ORIGINS = List.of(
      "https://www.habitinhos.com.br",
      "https://habitinhos.com.br");

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers(
                "/auth/register",
                "/auth/login",
                "/auth/password-reset/request",
                "/auth/password-reset/confirm",
                "/auth/account-deletion/permanent/request",
                "/auth/account-deletion/permanent/confirm",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/actuator/health")
            .permitAll()
            .anyRequest()
            .authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))
        .build();
  }

  /**
   * The public web page may call only the permanent account-deletion flow.
   *
   * <p>Registering CORS only for these two endpoints is intentional: the remaining API
   * stays unavailable to browser JavaScript hosted by the public app page.
   * Mobile clients are not subject to browser CORS restrictions.</p>
   */
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(PERMANENT_ACCOUNT_DELETION_ALLOWED_ORIGINS);
    configuration.setAllowedMethods(List.of(HttpMethod.POST.name(), HttpMethod.OPTIONS.name()));
    configuration.setAllowedHeaders(List.of(HttpHeaders.CONTENT_TYPE));
    configuration.setAllowCredentials(false);
    configuration.setMaxAge(600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    PERMANENT_ACCOUNT_DELETION_CORS_PATHS.forEach(
        path -> source.registerCorsConfiguration(path, configuration));
    return source;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  JwtEncoder jwtEncoder(@Value("${habitinhos.security.jwt.secret}") String secret) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(secret)));
  }

  @Bean
  JwtDecoder jwtDecoder(@Value("${habitinhos.security.jwt.secret}") String secret) {
    return NimbusJwtDecoder
        .withSecretKey(jwtSecretKey(secret))
        .macAlgorithm(MacAlgorithm.HS256)
        .build();
  }

  private SecretKey jwtSecretKey(String secret) {
    return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
  }
}
