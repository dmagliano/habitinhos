package br.com.habitinhos.shared;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
public abstract class AbstractIntegrationTest {

  @ServiceConnection
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine");

  static {
    POSTGRES.start();
  }

  @DynamicPropertySource
  static void registerTestProperties(DynamicPropertyRegistry registry) {
    registry.add("habitinhos.security.jwt.secret", () -> "0".repeat(64));
    registry.add("habitinhos.email.resend.api-key", () -> "");
  }

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void cleanDatabase() {
    jdbcTemplate.execute(
        """
        DO $$
        BEGIN
          IF to_regclass('public.family_units') IS NOT NULL THEN
            TRUNCATE TABLE
              auth_reset_tokens,
              coin_transactions,
              reward_redemptions,
              assigned_missions,
              rewards,
              missions,
              wallets,
              child_profiles,
              app_users,
              family_units
            RESTART IDENTITY CASCADE;
          END IF;
        END $$;
        """);
  }
}
