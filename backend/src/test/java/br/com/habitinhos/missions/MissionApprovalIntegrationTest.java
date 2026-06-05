package br.com.habitinhos.missions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.wallet.CoinTransactionRepository;
import br.com.habitinhos.wallet.WalletRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class MissionApprovalIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AssignedMissionRepository assignedMissionRepository;

  @Autowired
  private CoinTransactionRepository coinTransactionRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Test
  void responsibleCanListPendingApprovalAndApproveOnce() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Estudar", "Ler capítulo", 6, true, RecurrenceType.ONCE));
    complete(token, assignedMissionId);

    mockMvc.perform(get("/assigned-missions/pending-approval")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(assignedMissionId.toString()))
        .andExpect(jsonPath("$[0].status").value("AWAITING_APPROVAL"))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist());

    mockMvc.perform(post("/assigned-missions/{id}/approve", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETED"))
        .andExpect(jsonPath("$.approvedAt").exists());

    AssignedMission assignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assertThat(walletRepository.findByChildIdAndFamilyUnitId(childId, assignment.getFamilyUnitId())
        .orElseThrow()
        .getBalance()).isEqualTo(6);
    assertThat(coinTransactionRepository.findAll()).hasSize(1);

    mockMvc.perform(post("/assigned-missions/{id}/approve", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("INVALID_MISSION_STATUS"));
    assertThat(coinTransactionRepository.findAll()).hasSize(1);
  }

  @Test
  void responsibleCanRejectAwaitingApprovalWithoutCredit() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Arrumar mesa", "Preparar jantar", 5, true, RecurrenceType.ONCE));
    complete(token, assignedMissionId);

    mockMvc.perform(post("/assigned-missions/{id}/reject", assignedMissionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("reason", "Precisa refazer"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("REJECTED"))
        .andExpect(jsonPath("$.rejectedAt").exists())
        .andExpect(jsonPath("$.rejectionReason").value("Precisa refazer"));

    AssignedMission assignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assertThat(walletRepository.findByChildIdAndFamilyUnitId(childId, assignment.getFamilyUnitId())
        .orElseThrow()
        .getBalance()).isZero();
    assertThat(coinTransactionRepository.findAll()).isEmpty();
  }

  @Test
  void crossFamilyApprovalAndRejectionReturnSafeNotFound() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID foreignChildId = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));
    UUID foreignAssignmentId = assignMission(
        familyBToken,
        foreignChildId,
        new MissionRequest("Tarefa B", "Outra família", 4, true, RecurrenceType.ONCE));
    complete(familyBToken, foreignAssignmentId);

    mockMvc.perform(post("/assigned-missions/{id}/approve", foreignAssignmentId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("ASSIGNED_MISSION_NOT_FOUND"));

    mockMvc.perform(post("/assigned-missions/{id}/reject", foreignAssignmentId)
            .header("Authorization", "Bearer " + familyAToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("reason", "Indevido"))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("ASSIGNED_MISSION_NOT_FOUND"));
  }

  private void complete(String token, UUID assignedMissionId) throws Exception {
    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
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

  private UUID assignMission(String token, UUID childId, MissionRequest missionRequest) throws Exception {
    UUID missionId = createMission(token, missionRequest);
    String response = mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new AssignMissionRequest(List.of(childId), LocalDate.of(2026, 6, 1)))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return UUID.fromString(objectMapper.readTree(response).get(0).get("id").asText());
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
