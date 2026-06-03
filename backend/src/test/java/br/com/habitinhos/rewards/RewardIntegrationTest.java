package br.com.habitinhos.rewards;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.UpdateRewardRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class RewardIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void responsibleCanCreateListGetUpdateAndDeactivateReward() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");

    UUID rewardId = createReward(
        token,
        new CreateRewardRequest("Cinema", "Sessão de sábado", 20));

    mockMvc.perform(get("/rewards")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(rewardId.toString()))
        .andExpect(jsonPath("$[0].title").value("Cinema"))
        .andExpect(jsonPath("$[0].cost").value(20))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist());

    mockMvc.perform(get("/rewards/{id}", rewardId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Cinema"))
        .andExpect(jsonPath("$.cost").value(20))
        .andExpect(jsonPath("$.familyUnitId").doesNotExist());

    mockMvc.perform(put("/rewards/{id}", rewardId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new UpdateRewardRequest("Parque", "Passeio especial", 30))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Parque"))
        .andExpect(jsonPath("$.cost").value(30));

    mockMvc.perform(patch("/rewards/{id}/deactivate", rewardId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.active").value(false));

    mockMvc.perform(get("/rewards")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  void listRewardsCanIncludeInactiveWithoutLeakingOtherFamilies() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");

    UUID activeRewardId = createReward(
        familyAToken,
        new CreateRewardRequest("Cinema", "Sessão de sábado", 20));
    UUID inactiveRewardId = createReward(
        familyAToken,
        new CreateRewardRequest("Sorvete", "Casquinha", 8));
    createReward(
        familyBToken,
        new CreateRewardRequest("Recompensa de outra família", "Não deve aparecer", 15));

    mockMvc.perform(patch("/rewards/{id}/deactivate", inactiveRewardId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.active").value(false));

    mockMvc.perform(get("/rewards")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(activeRewardId.toString()))
        .andExpect(jsonPath("$[0].active").value(true));

    mockMvc.perform(get("/rewards")
            .queryParam("includeInactive", "true")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].id").value(activeRewardId.toString()))
        .andExpect(jsonPath("$[0].active").value(true))
        .andExpect(jsonPath("$[1].id").value(inactiveRewardId.toString()))
        .andExpect(jsonPath("$[1].active").value(false));
  }

  @Test
  void createRewardRejectsNonPositiveCost() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");

    mockMvc.perform(post("/rewards")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new CreateRewardRequest("Inválida", "Sem custo válido", 0))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
  }

  @Test
  void secondFamilyCannotReadUpdateOrDeactivateRewardFromAnotherFamily() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");

    UUID rewardId = createReward(
        familyAToken,
        new CreateRewardRequest("Sorvete", "Casquinha", 8));

    mockMvc.perform(get("/rewards/{id}", rewardId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("REWARD_NOT_FOUND"));

    mockMvc.perform(put("/rewards/{id}", rewardId)
            .header("Authorization", "Bearer " + familyBToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new UpdateRewardRequest("Nome indevido", "Update indevido", 10))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("REWARD_NOT_FOUND"));

    mockMvc.perform(patch("/rewards/{id}/deactivate", rewardId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("REWARD_NOT_FOUND"));
  }

  private String registerToken(String email, String familyName) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new RegisterRequest("Responsavel Demo", email, "senha123", familyName))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return objectMapper.readTree(response).get("token").asText();
  }

  private UUID createReward(String token, CreateRewardRequest request) throws Exception {
    String response = mockMvc.perform(post("/rewards")
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
