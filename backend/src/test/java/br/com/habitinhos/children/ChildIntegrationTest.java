package br.com.habitinhos.children;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

class ChildIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private ChildProfileRepository childProfileRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  void createChildWithoutEmailCreatesZeroBalanceWalletForAuthenticatedFamily() throws Exception {
    String token = registerToken("responsavel@example.com");

    String response = mockMvc.perform(post("/children")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new ChildRequest(
                "Lia",
                8,
                "star",
                null))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Lia"))
        .andExpect(jsonPath("$.avatarKey").value("star"))
        .andExpect(jsonPath("$.active").value(true))
        .andExpect(jsonPath("$.email").doesNotExist())
        .andExpect(jsonPath("$.familyUnitId").doesNotExist())
        .andExpect(jsonPath("$.accessPinHash").doesNotExist())
        .andReturn()
        .getResponse()
        .getContentAsString();

    UUID childId = UUID.fromString(objectMapper.readTree(response).get("id").asText());
    ChildProfile child = childProfileRepository.findById(childId).orElseThrow();
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();

    assertThat(child.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
    assertThat(wallet.getBalance()).isZero();
    assertThat(wallet.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
    assertThat(walletRepository.findAll()).hasSize(1);
  }

  @Test
  void listGetUpdateAndDeactivateOwnChildren() throws Exception {
    String token = registerToken("responsavel@example.com");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));

    mockMvc.perform(get("/children")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(childId.toString()))
        .andExpect(jsonPath("$[0].name").value("Lia"));

    mockMvc.perform(get("/children/{id}", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Lia"));

    mockMvc.perform(put("/children/{id}", childId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new ChildRequest(
                "Lia Atualizada",
                9,
                "moon",
                null))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Lia Atualizada"))
        .andExpect(jsonPath("$.age").value(9))
        .andExpect(jsonPath("$.avatarKey").value("moon"))
        .andExpect(jsonPath("$.active").value(true));

    mockMvc.perform(patch("/children/{id}/deactivate", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.active").value(false));

    mockMvc.perform(get("/children")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  void optionalAvatarAndAccessPinArePersistedButPinHashIsNeverReturned() throws Exception {
    String token = registerToken("responsavel@example.com");

    UUID childId = createChild(token, new ChildRequest("Noah", 7, "rocket", "1234"));

    ChildProfile child = childProfileRepository.findById(childId).orElseThrow();
    assertThat(child.getAvatarKey()).isEqualTo("rocket");
    assertThat(child.getAccessPinHash()).isNotEqualTo("1234");
    assertThat(passwordEncoder.matches("1234", child.getAccessPinHash())).isTrue();

    mockMvc.perform(get("/children/{id}", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.avatarKey").value("rocket"))
        .andExpect(jsonPath("$.accessPin").doesNotExist())
        .andExpect(jsonPath("$.accessPinHash").doesNotExist());
  }

  private String registerToken(String email) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RegisterRequest(
                "Responsavel Demo",
                email,
                "senha123",
                "Familia Demo"))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return objectMapper.readTree(response).get("token").asText();
  }

  private UUID createChild(String token, ChildRequest request) throws Exception {
    String response = mockMvc.perform(post("/children")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    JsonNode json = objectMapper.readTree(response);
    return UUID.fromString(json.get("id").asText());
  }
}
