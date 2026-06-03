package br.com.habitinhos.missions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class MissionIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void responsibleCanCreateListGetUpdateAndDeactivateMission() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");

    UUID missionId = createMission(
        token,
        new MissionRequest("Arrumar cama", "Organizar travesseiros", 5, true, RecurrenceType.ONCE));

    mockMvc.perform(get("/missions")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(missionId.toString()))
        .andExpect(jsonPath("$[0].title").value("Arrumar cama"))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist());

    mockMvc.perform(get("/missions/{id}", missionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Arrumar cama"))
        .andExpect(jsonPath("$.coinValue").value(5))
        .andExpect(jsonPath("$.familyUnitId").doesNotExist());

    mockMvc.perform(put("/missions/{id}", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new MissionRequest("Arrumar quarto", "Guardar brinquedos", 8, false, RecurrenceType.WEEKLY))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Arrumar quarto"))
        .andExpect(jsonPath("$.coinValue").value(8))
        .andExpect(jsonPath("$.requiresApproval").value(false))
        .andExpect(jsonPath("$.recurrenceType").value("WEEKLY"));

    mockMvc.perform(patch("/missions/{id}/deactivate", missionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.active").value(false));

    mockMvc.perform(get("/missions")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isEmpty());
  }

  @Test
  void listMissionsCanIncludeInactiveWithoutLeakingOtherFamilies() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");

    UUID activeMissionId = createMission(
        familyAToken,
        new MissionRequest("Guardar brinquedos", "Organizar a sala", 4, true, RecurrenceType.DAILY));
    UUID inactiveMissionId = createMission(
        familyAToken,
        new MissionRequest("Regar plantas", "Cuidar das plantas", 2, false, RecurrenceType.WEEKLY));
    createMission(
        familyBToken,
        new MissionRequest("Missão de outra família", "Não deve aparecer", 9, true, RecurrenceType.ONCE));

    mockMvc.perform(patch("/missions/{id}/deactivate", inactiveMissionId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.active").value(false));

    mockMvc.perform(get("/missions")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value(activeMissionId.toString()))
        .andExpect(jsonPath("$[0].active").value(true));

    mockMvc.perform(get("/missions")
            .queryParam("includeInactive", "true")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].id").value(activeMissionId.toString()))
        .andExpect(jsonPath("$[0].active").value(true))
        .andExpect(jsonPath("$[1].id").value(inactiveMissionId.toString()))
        .andExpect(jsonPath("$[1].active").value(false));
  }

  @Test
  void createMissionRejectsNonPositiveCoinValue() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");

    mockMvc.perform(post("/missions")
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new MissionRequest("Missão inválida", "Sem moedas válidas", 0, true, RecurrenceType.ONCE))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
  }

  @Test
  void secondFamilyCannotReadUpdateOrDeactivateMissionFromAnotherFamily() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");

    UUID missionId = createMission(
        familyAToken,
        new MissionRequest("Lavar louça", "Lavar copos", 3, true, RecurrenceType.DAILY));

    mockMvc.perform(get("/missions/{id}", missionId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("MISSION_NOT_FOUND"));

    mockMvc.perform(put("/missions/{id}", missionId)
            .header("Authorization", "Bearer " + familyBToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new MissionRequest("Nome indevido", "Update indevido", 10, false, RecurrenceType.CUSTOM))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("MISSION_NOT_FOUND"));

    mockMvc.perform(patch("/missions/{id}/deactivate", missionId)
            .header("Authorization", "Bearer " + familyBToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("MISSION_NOT_FOUND"));
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

  private UUID createMission(String token, MissionRequest request) throws Exception {
    String response = mockMvc.perform(post("/missions")
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
