package br.com.habitinhos.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.family.FamilyUnit;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
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

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @MockBean
  private AccountEmailSender accountEmailSender;

  @MockBean
  private PermanentDeletionFailureInjector permanentDeletionFailureInjector;

  @Test
  void registerCreatesFamilyAndResponsibleWithHashedPasswordAndPin() throws Exception {
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
    assertThat(user.getResponsiblePinHash()).isNotEqualTo("1234");
    assertThat(passwordEncoder.matches("1234", user.getResponsiblePinHash())).isTrue();
    assertThat(familyUnitRepository.findById(user.getFamilyUnitId())).isPresent();
    verify(accountEmailSender).sendWelcome("resp@example.com", "Responsavel Demo", "Familia Demo");
  }

  @Test
  void registerRejectsInvalidResponsiblePin() throws Exception {
    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RegisterRequest(
                "Responsavel Demo",
                "responsavel@example.com",
                RAW_PASSWORD,
                "Familia Demo",
                "12a4"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
        .andExpect(jsonPath("$.details.responsiblePin").value("PIN do responsável deve ter 4 dígitos."));
  }

  @Test
  void verifyResponsiblePinAllowsValidPinAndRejectsInvalidPin() throws Exception {
    String token = register("responsavel@example.com");

    mockMvc.perform(post("/auth/responsible-pin/verify")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("pin", "1234"))))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/auth/responsible-pin/verify")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("pin", "9999"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.code").value("INVALID_RESPONSIBLE_PIN"));
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
  void databaseEnforcesEmailUniquenessOnlyForActiveUsers() {
    UUID inactiveFamilyId = insertFamily("Família Histórica");
    insertUser(
        inactiveFamilyId,
        "responsavel@example.com",
        false);

    UUID activeFamilyId = insertFamily("Família Atual");
    insertUser(
        activeFamilyId,
        "responsavel@example.com",
        true);

    UUID duplicateActiveFamilyId = insertFamily("Família Duplicada");
    assertThatThrownBy(() -> insertUser(
            duplicateActiveFamilyId,
            "responsavel@example.com",
            true))
        .isInstanceOf(DataIntegrityViolationException.class);
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

  @Test
  void passwordResetRequestIssuesEmailAndConfirmChangesPassword() throws Exception {
    register("responsavel@example.com");
    reset(accountEmailSender);

    mockMvc.perform(post("/auth/password-reset/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "RESPONSAVEL@example.com"))))
        .andExpect(status().isAccepted());

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    verify(accountEmailSender).sendPasswordReset(
        eq("responsavel@example.com"),
        tokenCaptor.capture(),
        any(Instant.class));
    assertThat(tokenCaptor.getValue()).matches("[A-Z0-9]{6}");

    mockMvc.perform(post("/auth/password-reset/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "token", tokenCaptor.getValue(),
                "newPassword", "novaSenha123"))))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(
                "responsavel@example.com",
                RAW_PASSWORD))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

    login("responsavel@example.com", "novaSenha123");

    mockMvc.perform(post("/auth/password-reset/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "token", tokenCaptor.getValue(),
                "newPassword", "outraSenha123"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
  }

  @Test
  void passwordResetRequestIsEnumerationSafeForUnknownEmail() throws Exception {
    mockMvc.perform(post("/auth/password-reset/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "ausente@example.com"))))
        .andExpect(status().isAccepted());

    verify(accountEmailSender, never()).sendPasswordReset(any(), any(), any());
  }

  @Test
  void permanentDeletionRequestIsEnumerationSafeAndIncludesInactiveAccounts() throws Exception {
    UUID inactiveFamilyId = insertFamily("Família Histórica");
    insertUser(inactiveFamilyId, "permanente@example.com", false);
    UUID activeFamilyId = insertFamily("Família Atual");
    insertUser(activeFamilyId, "permanente@example.com", true);
    reset(accountEmailSender);

    String unknownResponse = mockMvc.perform(post("/auth/account-deletion/permanent/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "ausente@example.com"))))
        .andExpect(status().isAccepted())
        .andReturn()
        .getResponse()
        .getContentAsString();
    verify(accountEmailSender, never()).sendPermanentAccountDeletionConfirmation(any(), any(), any());

    String knownResponse = mockMvc.perform(post("/auth/account-deletion/permanent/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "  PERMANENTE@example.com "))))
        .andExpect(status().isAccepted())
        .andReturn()
        .getResponse()
        .getContentAsString();

    assertThat(knownResponse).isEqualTo(unknownResponse);
    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    verify(accountEmailSender).sendPermanentAccountDeletionConfirmation(
        eq("permanente@example.com"),
        tokenCaptor.capture(),
        any(Instant.class));
    assertThat(tokenCaptor.getValue()).matches("[A-Z0-9]{6}");
    assertThat(jdbcTemplate.queryForObject(
        "SELECT count(*) FROM auth_reset_tokens WHERE purpose = 'PERMANENT_ACCOUNT_DELETION' AND used_at IS NULL",
        Integer.class)).isEqualTo(1);
  }

  @Test
  void permanentDeletionCorsAllowsOnlyOfficialWebOriginsAndPath() throws Exception {
    mockMvc.perform(options("/auth/account-deletion/permanent/request")
            .header(HttpHeaders.ORIGIN, "https://www.habitinhos.com.br")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.CONTENT_TYPE))
        .andExpect(status().isOk())
        .andExpect(header().string(
            HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
            "https://www.habitinhos.com.br"))
        .andExpect(header().string(
            HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
            containsString(HttpMethod.POST.name())))
        .andExpect(header().string(
            HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
            containsString(HttpHeaders.CONTENT_TYPE)))
        .andExpect(header().string(HttpHeaders.VARY, containsString(HttpHeaders.ORIGIN)));

    mockMvc.perform(options("/auth/account-deletion/permanent/confirm")
            .header(HttpHeaders.ORIGIN, "https://habitinhos.com.br")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.CONTENT_TYPE))
        .andExpect(status().isOk())
        .andExpect(header().string(
            HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
            "https://habitinhos.com.br"));

    mockMvc.perform(options("/auth/account-deletion/permanent/request")
            .header(HttpHeaders.ORIGIN, "https://malicious.example")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, HttpHeaders.CONTENT_TYPE))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));

    mockMvc.perform(options("/me")
            .header(HttpHeaders.ORIGIN, "https://www.habitinhos.com.br")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.GET.name()))
        .andExpect(status().isForbidden())
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
  }

  @Test
  void permanentDeletionResponseIncludesCorsHeaderForOfficialWebOrigin() throws Exception {
    mockMvc.perform(post("/auth/account-deletion/permanent/request")
            .header(HttpHeaders.ORIGIN, "https://habitinhos.com.br")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "ausente@example.com"))))
        .andExpect(status().isAccepted())
        .andExpect(header().string(
            HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
            "https://habitinhos.com.br"));
  }

  @Test
  void permanentDeletionConfirmationRejectsInvalidTokenWithoutAuthenticationOrDml() throws Exception {
    UUID familyId = insertFamily("Família Protegida");
    insertUser(familyId, "protegida@example.com", true);

    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "protegida@example.com",
                "token", "ABC123"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));

    assertThat(jdbcTemplate.queryForObject(
        "SELECT count(*) FROM app_users WHERE family_unit_id = ?",
        Integer.class,
        familyId)).isEqualTo(1);
    assertThat(jdbcTemplate.queryForObject(
        "SELECT count(*) FROM family_units WHERE id = ?",
        Integer.class,
        familyId)).isEqualTo(1);
  }

  @Test
  void permanentDeletionTokenIsDedicatedExpiringAndSingleUse() throws Exception {
    String jwt = register("ciclo@example.com");
    AppUser user = appUserRepository.findByEmailIgnoreCaseAndActiveTrue("ciclo@example.com").orElseThrow();
    String permanentToken = requestPermanentDeletionToken("ciclo@example.com");

    mockMvc.perform(post("/auth/account-deletion/confirm")
            .header("Authorization", "Bearer " + jwt)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "password", RAW_PASSWORD,
                "token", permanentToken))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
    assertThat(appUserRepository.findById(user.getId())).get().extracting(AppUser::isActive).isEqualTo(true);

    jdbcTemplate.update(
        "UPDATE auth_reset_tokens SET expires_at = now() - interval '1 minute' WHERE purpose = 'PERMANENT_ACCOUNT_DELETION' AND used_at IS NULL");
    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "ciclo@example.com",
                "token", permanentToken))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));

    String usedToken = requestPermanentDeletionToken("ciclo@example.com");
    jdbcTemplate.update(
        "UPDATE auth_reset_tokens SET used_at = now() WHERE purpose = 'PERMANENT_ACCOUNT_DELETION' AND used_at IS NULL");
    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "ciclo@example.com",
                "token", usedToken))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
    assertThat(appUserRepository.findById(user.getId())).isPresent();
  }

  @Test
  void permanentDeletionRemovesAllMatchingFamilies() throws Exception {
    String oldJwt = register("permanente@example.com");
    AppUser activeUser = appUserRepository
        .findByEmailIgnoreCaseAndActiveTrue("permanente@example.com")
        .orElseThrow();
    UUID firstFamilyId = activeUser.getFamilyUnitId();
    insertFamilyData(firstFamilyId, activeUser.getId());

    UUID secondFamilyId = insertFamily("Família Histórica");
    UUID inactiveUserId = insertUser(secondFamilyId, "permanente@example.com", false);
    insertFamilyData(secondFamilyId, inactiveUserId);

    UUID neighborFamilyId = insertFamily("Família Vizinha");
    UUID neighborUserId = insertUser(neighborFamilyId, "vizinha@example.com", true);
    FamilyData neighborData = insertFamilyData(neighborFamilyId, neighborUserId);

    String deletionToken = requestPermanentDeletionToken(" PERMANENTE@example.com ");
    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "permanente@example.com",
                "token", deletionToken))))
        .andExpect(status().isNoContent());

    assertFamilyWasDeleted(firstFamilyId);
    assertFamilyWasDeleted(secondFamilyId);
    assertThat(count("app_users", "lower(trim(email)) = ?", "permanente@example.com")).isZero();
    assertFamilyWasPreserved(neighborData);

    mockMvc.perform(get("/me").header("Authorization", "Bearer " + oldJwt))
        .andExpect(status().isUnauthorized());
    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(
                "permanente@example.com",
                RAW_PASSWORD))))
        .andExpect(status().isUnauthorized());
    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "permanente@example.com",
                "token", deletionToken))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));

    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest("permanente@example.com"))))
        .andExpect(status().isCreated());
    assertThat(count("family_units", "id = ?", neighborFamilyId)).isEqualTo(1);
  }

  @Test
  void permanentDeletionRollsBackAllMatchingFamilies() throws Exception {
    UUID firstFamilyId = insertFamily("Família Um");
    UUID firstUserId = insertUser(firstFamilyId, "rollback@example.com", true);
    FamilyData firstData = insertFamilyData(firstFamilyId, firstUserId);
    UUID secondFamilyId = insertFamily("Família Dois");
    UUID secondUserId = insertUser(secondFamilyId, "rollback@example.com", false);
    FamilyData secondData = insertFamilyData(secondFamilyId, secondUserId);
    String deletionToken = requestPermanentDeletionToken("rollback@example.com");
    UUID resetTokenId = jdbcTemplate.queryForObject(
        "SELECT id FROM auth_reset_tokens WHERE purpose = 'PERMANENT_ACCOUNT_DELETION' AND used_at IS NULL",
        UUID.class);

    doThrow(new IllegalStateException("deterministic purge failure"))
        .when(permanentDeletionFailureInjector)
        .afterFirstFamilyDelete();

    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "rollback@example.com",
                "token", deletionToken))))
        .andExpect(status().isInternalServerError());

    verify(permanentDeletionFailureInjector, times(1)).afterFirstFamilyDelete();
    assertFamilyWasPreserved(firstData);
    assertFamilyWasPreserved(secondData);
    assertThat(jdbcTemplate.queryForObject(
        "SELECT used_at IS NULL FROM auth_reset_tokens WHERE id = ?",
        Boolean.class,
        resetTokenId)).isTrue();

    reset(permanentDeletionFailureInjector);
    mockMvc.perform(post("/auth/account-deletion/permanent/confirm")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "email", "rollback@example.com",
                "token", deletionToken))))
        .andExpect(status().isNoContent());
    assertFamilyWasDeleted(firstFamilyId);
    assertFamilyWasDeleted(secondFamilyId);
  }

  @Test
  void responsiblePinResetRequiresPasswordAndUpdatesPin() throws Exception {
    String token = register("responsavel@example.com");
    reset(accountEmailSender);

    mockMvc.perform(post("/auth/responsible-pin/reset/request")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("password", "senha-errada"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    verify(accountEmailSender, never()).sendResponsiblePinReset(any(), any(), any());

    mockMvc.perform(post("/auth/responsible-pin/reset/request")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("password", RAW_PASSWORD))))
        .andExpect(status().isAccepted());

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    verify(accountEmailSender).sendResponsiblePinReset(
        eq("responsavel@example.com"),
        tokenCaptor.capture(),
        any(Instant.class));
    assertThat(tokenCaptor.getValue()).matches("[A-Z0-9]{6}");

    mockMvc.perform(post("/auth/responsible-pin/reset/confirm")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "token", tokenCaptor.getValue(),
                "newPin", "5678"))))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/auth/responsible-pin/verify")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("pin", "1234"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.code").value("INVALID_RESPONSIBLE_PIN"));

    mockMvc.perform(post("/auth/responsible-pin/verify")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("pin", "5678"))))
        .andExpect(status().isNoContent());

    mockMvc.perform(post("/auth/responsible-pin/reset/confirm")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "token", tokenCaptor.getValue(),
                "newPin", "9012"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("INVALID_RESET_TOKEN"));
  }

  @Test
  void deleteAccountDeactivatesUserAndFamilyThenAllowsFreshRegistration() throws Exception {
    String token = register("responsavel@example.com");
    reset(accountEmailSender);

    mockMvc.perform(post("/auth/account-deletion/request")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("password", "senha-errada"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    verify(accountEmailSender, never()).sendAccountDeletionConfirmation(any(), any(), any());

    mockMvc.perform(post("/auth/account-deletion/request")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("password", RAW_PASSWORD))))
        .andExpect(status().isAccepted());

    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    verify(accountEmailSender).sendAccountDeletionConfirmation(
        eq("responsavel@example.com"),
        tokenCaptor.capture(),
        any(Instant.class));
    assertThat(tokenCaptor.getValue()).matches("[A-Z0-9]{6}");

    mockMvc.perform(post("/auth/account-deletion/confirm")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "password", "senha-errada",
                "token", tokenCaptor.getValue()))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

    mockMvc.perform(post("/auth/account-deletion/confirm")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of(
                "password", RAW_PASSWORD,
                "token", tokenCaptor.getValue()))))
        .andExpect(status().isNoContent());

    AppUser oldUser = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    UUID oldUserId = oldUser.getId();
    UUID oldFamilyId = oldUser.getFamilyUnitId();
    assertThat(oldUser.isActive()).isFalse();
    assertThat(familyUnitRepository.findById(oldFamilyId))
        .get()
        .extracting(FamilyUnit::isActive)
        .isEqualTo(false);

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(
                "responsavel@example.com",
                RAW_PASSWORD))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));

    mockMvc.perform(get("/me")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());

    reset(accountEmailSender);
    mockMvc.perform(post("/auth/password-reset/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "responsavel@example.com"))))
        .andExpect(status().isAccepted());
    verify(accountEmailSender, never()).sendPasswordReset(any(), any(), any());

    String freshRegistration = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest(
                "RESPONSAVEL@example.com",
                "novaConta123",
                "Família Nova"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token", not(blankOrNullString())))
        .andExpect(jsonPath("$.user.email").value("responsavel@example.com"))
        .andExpect(jsonPath("$.family.name").value("Família Nova"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    JsonNode freshJson = objectMapper.readTree(freshRegistration);
    UUID freshUserId = UUID.fromString(freshJson.at("/user/id").asText());
    UUID freshFamilyId = UUID.fromString(freshJson.at("/family/id").asText());
    assertThat(freshUserId).isNotEqualTo(oldUserId);
    assertThat(freshFamilyId).isNotEqualTo(oldFamilyId);

    AppUser freshUser = appUserRepository.findByEmailIgnoreCaseAndActiveTrue("responsavel@example.com").orElseThrow();
    assertThat(freshUser.getId()).isEqualTo(freshUserId);
    assertThat(freshUser.getFamilyUnitId()).isEqualTo(freshFamilyId);
    assertThat(familyUnitRepository.findById(freshFamilyId)).get().extracting(FamilyUnit::isActive).isEqualTo(true);

    login("responsavel@example.com", "novaConta123");

    reset(accountEmailSender);
    mockMvc.perform(post("/auth/password-reset/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", "responsavel@example.com"))))
        .andExpect(status().isAccepted());
    verify(accountEmailSender).sendPasswordReset(
        eq("responsavel@example.com"),
        any(String.class),
        any(Instant.class));
  }

  private String register(String email) throws Exception {
    return register(email, RAW_PASSWORD, "Familia Demo");
  }

  private String register(String email, String password, String familyName) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(registerRequest(email, password, familyName))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    JsonNode json = objectMapper.readTree(response);
    return json.get("token").asText();
  }

  private String login(String email, String password) throws Exception {
    String response = mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
    JsonNode json = objectMapper.readTree(response);
    return json.get("token").asText();
  }

  private RegisterRequest registerRequest(String email) {
    return registerRequest(email, RAW_PASSWORD, "Familia Demo");
  }

  private RegisterRequest registerRequest(String email, String password, String familyName) {
    return new RegisterRequest(
        "Responsavel Demo",
        email,
        password,
        familyName,
        "1234");
  }

  private UUID insertFamily(String name) {
    UUID familyId = UUID.randomUUID();
    jdbcTemplate.update(
        """
        INSERT INTO family_units (id, name, active, created_at, updated_at)
        VALUES (?, ?, true, now(), now())
        """,
        familyId,
        name);
    return familyId;
  }

  private UUID insertUser(UUID familyId, String email, boolean active) {
    UUID userId = UUID.randomUUID();
    jdbcTemplate.update(
        """
        INSERT INTO app_users (
          id,
          family_unit_id,
          name,
          email,
          role,
          password_hash,
          responsible_pin_hash,
          active,
          created_at,
          updated_at
        )
        VALUES (?, ?, 'Responsavel Demo', ?, 'RESPONSIBLE', ?, ?, ?, now(), now())
        """,
        userId,
        familyId,
        email,
        passwordEncoder.encode(RAW_PASSWORD),
        passwordEncoder.encode("1234"),
        active);
    return userId;
  }

  private String requestPermanentDeletionToken(String email) throws Exception {
    reset(accountEmailSender);
    mockMvc.perform(post("/auth/account-deletion/permanent/request")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("email", email))))
        .andExpect(status().isAccepted());
    ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
    verify(accountEmailSender).sendPermanentAccountDeletionConfirmation(
        eq(email.trim().toLowerCase()),
        tokenCaptor.capture(),
        any(Instant.class));
    return tokenCaptor.getValue();
  }

  private FamilyData insertFamilyData(UUID familyId, UUID userId) {
    UUID childId = UUID.randomUUID();
    UUID walletId = UUID.randomUUID();
    UUID missionId = UUID.randomUUID();
    UUID assignmentId = UUID.randomUUID();
    UUID rewardId = UUID.randomUUID();
    UUID redemptionId = UUID.randomUUID();
    UUID transactionId = UUID.randomUUID();
    jdbcTemplate.update(
        "INSERT INTO child_profiles (id, family_unit_id, name, active, created_at, updated_at) VALUES (?, ?, 'Criança', true, now(), now())",
        childId,
        familyId);
    jdbcTemplate.update(
        "INSERT INTO wallets (id, family_unit_id, child_id, balance, created_at, updated_at) VALUES (?, ?, ?, 5, now(), now())",
        walletId,
        familyId,
        childId);
    jdbcTemplate.update(
        """
        INSERT INTO missions (
          id, family_unit_id, title, coin_value, requires_approval, recurrence_type,
          active, created_by_user_id, created_at, updated_at)
        VALUES (?, ?, 'Missão', 5, true, 'ONCE', true, ?, now(), now())
        """,
        missionId,
        familyId,
        userId);
    jdbcTemplate.update(
        """
        INSERT INTO assigned_missions (
          id, family_unit_id, mission_id, child_id, status, snapshot_title,
          snapshot_coin_value, snapshot_requires_approval, scheduled_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'COMPLETED', 'Missão', 5, true, current_date, now(), now())
        """,
        assignmentId,
        familyId,
        missionId,
        childId);
    jdbcTemplate.update(
        """
        INSERT INTO rewards (
          id, family_unit_id, title, cost, active, created_by_user_id, created_at, updated_at)
        VALUES (?, ?, 'Recompensa', 5, true, ?, now(), now())
        """,
        rewardId,
        familyId,
        userId);
    jdbcTemplate.update(
        """
        INSERT INTO reward_redemptions (
          id, family_unit_id, reward_id, child_id, wallet_id, status,
          snapshot_title, snapshot_cost, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'REDEEMED', 'Recompensa', 5, now(), now())
        """,
        redemptionId,
        familyId,
        rewardId,
        childId,
        walletId);
    jdbcTemplate.update(
        """
        INSERT INTO coin_transactions (
          id, family_unit_id, wallet_id, child_id, reward_redemption_id, type,
          source_type, amount, balance_after, created_by_user_id, created_at)
        VALUES (?, ?, ?, ?, ?, 'DEBIT', 'REWARD_REDEMPTION', 5, 5, ?, now())
        """,
        transactionId,
        familyId,
        walletId,
        childId,
        redemptionId,
        userId);
    jdbcTemplate.update(
        "UPDATE reward_redemptions SET coin_transaction_id = ? WHERE id = ?",
        transactionId,
        redemptionId);
    return new FamilyData(
        familyId,
        userId,
        childId,
        walletId,
        missionId,
        assignmentId,
        rewardId,
        redemptionId,
        transactionId);
  }

  private void assertFamilyWasDeleted(UUID familyId) {
    for (String table : List.of(
        "coin_transactions",
        "reward_redemptions",
        "assigned_missions",
        "wallets",
        "child_profiles",
        "rewards",
        "missions",
        "app_users")) {
      assertThat(count(table, "family_unit_id = ?", familyId)).as(table).isZero();
    }
    assertThat(count("family_units", "id = ?", familyId)).isZero();
  }

  private void assertFamilyWasPreserved(FamilyData data) {
    assertThat(count("family_units", "id = ?", data.familyId())).isEqualTo(1);
    assertThat(count("app_users", "id = ?", data.userId())).isEqualTo(1);
    assertThat(count("child_profiles", "id = ?", data.childId())).isEqualTo(1);
    assertThat(count("wallets", "id = ?", data.walletId())).isEqualTo(1);
    assertThat(count("missions", "id = ?", data.missionId())).isEqualTo(1);
    assertThat(count("assigned_missions", "id = ?", data.assignmentId())).isEqualTo(1);
    assertThat(count("rewards", "id = ?", data.rewardId())).isEqualTo(1);
    assertThat(count("reward_redemptions", "id = ? AND coin_transaction_id = ?", data.redemptionId(), data.transactionId()))
        .isEqualTo(1);
    assertThat(count("coin_transactions", "id = ? AND reward_redemption_id = ?", data.transactionId(), data.redemptionId()))
        .isEqualTo(1);
  }

  private int count(String table, String predicate, Object... arguments) {
    return jdbcTemplate.queryForObject(
        "SELECT count(*) FROM " + table + " WHERE " + predicate,
        Integer.class,
        arguments);
  }

  private record FamilyData(
      UUID familyId,
      UUID userId,
      UUID childId,
      UUID walletId,
      UUID missionId,
      UUID assignmentId,
      UUID rewardId,
      UUID redemptionId,
      UUID transactionId) {
  }
}
