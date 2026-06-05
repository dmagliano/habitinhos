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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class AssignedMissionIntegrationTest extends AbstractIntegrationTest {

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
  void childMissionListReturnsOnlyPendingAssignmentsForRequestedChild() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childA = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID childB = createChild(token, new ChildRequest("Noah", 7, "rocket", null));
    UUID childAAssignment = assignMission(
        token,
        childA,
        new MissionRequest("Arrumar cama", "Organizar quarto", 5, true, RecurrenceType.ONCE));
    assignMission(
        token,
        childB,
        new MissionRequest("Guardar brinquedos", "Organizar caixas", 6, true, RecurrenceType.ONCE));

    mockMvc.perform(get("/children/{childId}/missions", childA)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(childAAssignment.toString()))
        .andExpect(jsonPath("$[0].childId").value(childA.toString()))
        .andExpect(jsonPath("$[0].status").value("PENDING"))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist())
        .andExpect(jsonPath("$[1]").doesNotExist());
  }

  @Test
  void childMissionListHidesExpiredPendingAssignmentsWithoutChangingStatus() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    LocalDate today = LocalDate.now();
    UUID expiredAssignment = assignMission(
        token,
        childId,
        new MissionRequest("Missao vencida", "Ja passou", 2, true, RecurrenceType.ONCE),
        today.minusDays(1));
    UUID todayAssignment = assignMission(
        token,
        childId,
        new MissionRequest("Missao de hoje", "Ainda vale", 3, true, RecurrenceType.ONCE),
        today);
    UUID futureAssignment = assignMission(
        token,
        childId,
        new MissionRequest("Missao futura", "Vale depois", 4, true, RecurrenceType.ONCE),
        today.plusDays(1));
    UUID undatedAssignment = assignMission(
        token,
        childId,
        new MissionRequest("Missao sem prazo", "Sempre visivel", 5, true, RecurrenceType.ONCE),
        null);

    String response = mockMvc.perform(get("/children/{childId}/missions", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();

    JsonNode json = objectMapper.readTree(response);
    List<String> visibleIds = new ArrayList<>();
    json.forEach(node -> visibleIds.add(node.get("id").asText()));
    assertThat(visibleIds)
        .contains(todayAssignment.toString(), futureAssignment.toString(), undatedAssignment.toString())
        .doesNotContain(expiredAssignment.toString());
    assertThat(assignedMissionRepository.findById(expiredAssignment).orElseThrow().getStatus())
        .isEqualTo(AssignedMissionStatus.PENDING);
  }

  @Test
  void completeNoApprovalMissionCreditsWalletExactlyOnce() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Lavar louça", "Lavar copos", 9, false, RecurrenceType.ONCE));

    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETED"))
        .andExpect(jsonPath("$.completedAt").exists());

    AssignedMission assignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assertThat(assignment.getCompletedAt()).isNotNull();
    assertThat(assignment.getStatus()).isEqualTo(AssignedMissionStatus.COMPLETED);
    assertThat(walletRepository.findByChildIdAndFamilyUnitId(childId, assignment.getFamilyUnitId())
        .orElseThrow()
        .getBalance()).isEqualTo(9);
    assertThat(coinTransactionRepository.findAll()).hasSize(1);

    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("INVALID_MISSION_STATUS"));
    assertThat(coinTransactionRepository.findAll()).hasSize(1);
  }

  @Test
  void completeNoApprovalRecurringMissionCreditsAndCreatesNextPendingOccurrence() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    LocalDate assignedDueDate = LocalDate.now().plusDays(1);
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Arrumar cama", "Deixar quarto organizado", 3, false, RecurrenceType.DAILY),
        assignedDueDate);

    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("COMPLETED"))
        .andExpect(jsonPath("$.snapshotRecurrenceType").value("DAILY"));

    AssignedMission completedAssignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assertThat(walletRepository.findByChildIdAndFamilyUnitId(childId, completedAssignment.getFamilyUnitId())
        .orElseThrow()
        .getBalance()).isEqualTo(3);
    assertThat(coinTransactionRepository.findAll()).hasSize(1);

    mockMvc.perform(get("/children/{childId}/missions", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].status").value("PENDING"))
        .andExpect(jsonPath("$[0].dueDate").value(assignedDueDate.plusDays(1).toString()))
        .andExpect(jsonPath("$[0].snapshotRecurrenceType").value("DAILY"))
        .andExpect(jsonPath("$[1]").doesNotExist());
  }

  @Test
  void completeApprovalRequiredMissionWaitsForApprovalWithoutCredit() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Estudar tabuada", "Praticar 15 minutos", 4, true, RecurrenceType.ONCE));

    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("AWAITING_APPROVAL"))
        .andExpect(jsonPath("$.completedAt").exists());

    AssignedMission assignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assertThat(walletRepository.findByChildIdAndFamilyUnitId(childId, assignment.getFamilyUnitId())
        .orElseThrow()
        .getBalance()).isZero();
    assertThat(coinTransactionRepository.findAll()).isEmpty();
  }

  @Test
  void crossFamilyListAndCompleteReturnSafeNotFound() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID childA = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));
    UUID foreignChild = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));
    UUID assignedMissionId = assignMission(
        familyBToken,
        foreignChild,
        new MissionRequest("Tarefa B", "Outra família", 3, false, RecurrenceType.ONCE));

    mockMvc.perform(get("/children/{childId}/missions", foreignChild)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));

    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("ASSIGNED_MISSION_NOT_FOUND"));

    mockMvc.perform(get("/children/{childId}/missions", childA)
            .header("Authorization", "Bearer " + familyAToken))
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
    return assignMission(token, childId, missionRequest, LocalDate.now());
  }

  private UUID assignMission(String token, UUID childId, MissionRequest missionRequest, LocalDate dueDate) throws Exception {
    UUID missionId = createMission(token, missionRequest);
    String response = mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new AssignMissionRequest(List.of(childId), dueDate))))
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
