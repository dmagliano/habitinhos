package br.com.habitinhos.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

class AuthIntegrationTest extends AbstractIntegrationTest {

  private static final String RAW_PASSWORD = "senha123";

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private FamilyUnitRepository familyUnitRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  void registerCreatesFamilyAndResponsibleWithHashedPassword() throws Exception {
    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest("Resp@example.com"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token", not(blankOrNullString())))
        .andExpect(jsonPath("$.user.email").value("resp@example.com"))
        .andExpect(jsonPath("$.user.role").value("RESPONSIBLE"))
        .andExpect(jsonPath("$.family.name").value("Familia Demo"));

    AppUser user = appUserRepository.findByEmailIgnoreCase("resp@example.com").orElseThrow();
    assertThat(user.isActive()).isTrue();
    assertThat(user.getRole()).isEqualTo(UserRole.RESPONSIBLE);
    assertThat(user.getPasswordHash()).isNotEqualTo(RAW_PASSWORD);
    assertThat(passwordEncoder.matches(RAW_PASSWORD, user.getPasswordHash())).isTrue();
    assertThat(familyUnitRepository.findById(user.getFamilyUnitId())).isPresent();
  }

  @Test
  void registerRejectsDuplicateEmail() throws Exception {
    register("responsavel@example.com");

    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest("Responsavel@Example.com"))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
  }

  @Test
  void loginReturnsTokenForValidCredentials() throws Exception {
    register("responsavel@example.com");

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(
                "RESPONSAVEL@example.com",
                RAW_PASSWORD))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", not(blankOrNullString())))
        .andExpect(jsonPath("$.user.email").value("responsavel@example.com"))
        .andExpect(jsonPath("$.family.name").value("Familia Demo"));
  }

  @Test
  void loginRejectsInvalidCredentials() throws Exception {
    register("responsavel@example.com");

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(
                "responsavel@example.com",
                "senha-errada"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
  }

  @Test
  void meReturnsAuthenticatedUserAndFamilyContext() throws Exception {
    String token = register("responsavel@example.com");

    mockMvc.perform(get("/me")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("responsavel@example.com"))
        .andExpect(jsonPath("$.role").value("RESPONSIBLE"))
        .andExpect(jsonPath("$.familyName").value("Familia Demo"));
  }

  @Test
  void meWithoutTokenIsRejected() throws Exception {
    mockMvc.perform(get("/me"))
        .andExpect(status().isUnauthorized());
  }

  private String register(String email) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest(email))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    JsonNode json = objectMapper.readTree(response);
    return json.get("token").asText();
  }

  private RegisterRequest registerRequest(String email) {
    return new RegisterRequest(
        "Responsavel Demo",
        email,
        RAW_PASSWORD,
        "Familia Demo");
  }
}
