package br.com.habitinhos.missions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class MissionAssignmentIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void assignMissionCreatesPendingAssignmentsWithSnapshotForMultipleChildren() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childA = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID childB = createChild(token, new ChildRequest("Noah", 7, "rocket", null));
    UUID missionId = createMission(
        token,
        new MissionRequest("Arrumar cama", "Deixar quarto organizado", 9, true, RecurrenceType.WEEKLY));

    mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new AssignMissionRequest(List.of(childA, childB), LocalDate.of(2026, 6, 1)))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$[0].missionId").value(missionId.toString()))
        .andExpect(jsonPath("$[0].status").value("PENDING"))
        .andExpect(jsonPath("$[0].snapshotTitle").value("Arrumar cama"))
        .andExpect(jsonPath("$[0].snapshotCoinValue").value(9))
        .andExpect(jsonPath("$[0].snapshotRequiresApproval").value(true))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist())
        .andExpect(jsonPath("$[1].missionId").value(missionId.toString()));
  }

  @Test
  void assignMissionRejectsDuplicateOpenAssignment() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID missionId = createMission(
        token,
        new MissionRequest("Guardar brinquedos", "Organizar caixas", 6, true, RecurrenceType.ONCE));

    AssignMissionRequest request = new AssignMissionRequest(List.of(childId), null);

    mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("MISSION_DUPLICATE_ASSIGNMENT"));
  }

  @Test
  void assignMissionRejectsChildFromAnotherFamilyWithSafeNotFound() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID missionId = createMission(
        familyAToken,
        new MissionRequest("Levar lixo", "Retirar lixo reciclável", 4, true, RecurrenceType.DAILY));
    UUID foreignChildId = createChild(familyBToken, new ChildRequest("Theo", 6, "moon", null));

    mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + familyAToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new AssignMissionRequest(List.of(foreignChildId), null))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));
  }

  private String registerToken(String email, String familyName) throws Exception {
    String response = mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new RegisterRequest("Responsavel Demo", email, "senha123", familyName, "1234"))))
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
