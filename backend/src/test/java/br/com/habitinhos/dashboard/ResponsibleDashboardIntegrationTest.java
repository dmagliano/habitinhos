package br.com.habitinhos.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.missions.AssignedMission;
import br.com.habitinhos.missions.AssignedMissionRepository;
import br.com.habitinhos.missions.RecurrenceType;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.RedeemRewardRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.wallet.Wallet;
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

class ResponsibleDashboardIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private AssignedMissionRepository assignedMissionRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Test
  void responsibleDashboardReturnsOnlyAuthenticatedFamilyAggregate() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");

    UUID childA = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));
    UUID secondChildA = createChild(familyAToken, new ChildRequest("Bia", 6, "moon", null));
    UUID childB = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));

    UUID pending = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Arrumar cama", "Organizar travesseiros", 4, true, RecurrenceType.ONCE));
    UUID awaitingOne = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Estudar", "Ler capítulo", 6, true, RecurrenceType.ONCE));
    UUID awaitingTwo = assignMission(
        familyAToken,
        secondChildA,
        new MissionRequest("Guardar roupa", "Dobrar camisetas", 5, true, RecurrenceType.ONCE));
    UUID awaitingThree = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Varrer sala", "Limpar a sala", 3, true, RecurrenceType.ONCE));
    UUID completed = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Lavar copos", "Depois do almoço", 9, false, RecurrenceType.ONCE));
    UUID rejected = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Tirar lixo", "Antes da noite", 2, true, RecurrenceType.ONCE));
    UUID cancelled = assignMission(
        familyAToken,
        childA,
        new MissionRequest("Regar plantas", "Varanda", 1, true, RecurrenceType.ONCE));
    assignMission(
        familyBToken,
        childB,
        new MissionRequest("Missão externa", "Outra família", 12, true, RecurrenceType.ONCE));

    complete(familyAToken, awaitingOne);
    complete(familyAToken, awaitingTwo);
    complete(familyAToken, awaitingThree);
    complete(familyAToken, completed);
    complete(familyAToken, rejected);
    reject(familyAToken, rejected);
    cancelAssignment(cancelled);

    AppUser userA = appUserRepository.findByEmailIgnoreCase("responsavel.a@example.com").orElseThrow();
    creditWallet(childA, userA.getFamilyUnitId(), 50);
    creditWallet(secondChildA, userA.getFamilyUnitId(), 20);
    redeemReward(familyAToken, childA, "Cinema", 10);
    redeemReward(familyAToken, childA, "Sorvete", 7);
    redeemReward(familyAToken, secondChildA, "Livro", 12);
    redeemReward(familyAToken, childA, "Parque", 6);
    AppUser userB = appUserRepository.findByEmailIgnoreCase("responsavel.b@example.com").orElseThrow();
    creditWallet(childB, userB.getFamilyUnitId(), 20);
    redeemReward(familyBToken, childB, "Recompensa externa", 5);

    String response = mockMvc.perform(get("/dashboard/responsible")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.children.length()").value(2))
        .andExpect(jsonPath("$.children[0].id").value(childA.toString()))
        .andExpect(jsonPath("$.children[0].name").value("Lia"))
        .andExpect(jsonPath("$.children[0].balance").value(36))
        .andExpect(jsonPath("$.children[0].missionCounts.PENDING").value(1))
        .andExpect(jsonPath("$.children[0].missionCounts.AWAITING_APPROVAL").value(2))
        .andExpect(jsonPath("$.children[0].missionCounts.COMPLETED").value(1))
        .andExpect(jsonPath("$.children[0].missionCounts.REJECTED").value(1))
        .andExpect(jsonPath("$.children[0].missionCounts.CANCELLED").value(1))
        .andExpect(jsonPath("$.pendingApprovalCount").value(3))
        .andExpect(jsonPath("$.approvalPreview.length()").value(2))
        .andExpect(jsonPath("$.approvalPreview[0].id").value(awaitingOne.toString()))
        .andExpect(jsonPath("$.approvalPreview[0].childId").value(childA.toString()))
        .andExpect(jsonPath("$.approvalPreview[0].childName").value("Lia"))
        .andExpect(jsonPath("$.approvalPreview[0].missionTitle").value("Estudar"))
        .andExpect(jsonPath("$.recentRedemptions.length()").value(3))
        .andExpect(jsonPath("$.recentRedemptions[0].rewardTitle").value("Parque"))
        .andExpect(jsonPath("$.recentRedemptions[0].rewardCost").value(6))
        .andExpect(jsonPath("$.recentRedemptions[0].childId").value(childA.toString()))
        .andExpect(jsonPath("$.recentRedemptions[0].childName").value("Lia"))
        .andExpect(jsonPath("$.recentRedemptions[0].status").value("REDEEMED"))
        .andExpect(jsonPath("$.recentRedemptions[0].deliveredAt").isEmpty())
        .andExpect(jsonPath("$.familyUnitId").doesNotExist())
        .andReturn()
        .getResponse()
        .getContentAsString();

    assertThat(response)
        .doesNotContain("Noah")
        .doesNotContain("Missão externa")
        .doesNotContain("Recompensa externa")
        .doesNotContain(userA.getFamilyUnitId().toString());
    assertThat(pending).isNotNull();
  }

  @Test
  void responsibleDashboardProjectsDeliveredRedemptionMetadata() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID childA = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));
    UUID childB = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));
    AppUser userA = appUserRepository.findByEmailIgnoreCase("responsavel.a@example.com").orElseThrow();
    AppUser userB = appUserRepository.findByEmailIgnoreCase("responsavel.b@example.com").orElseThrow();
    creditWallet(childA, userA.getFamilyUnitId(), 20);
    creditWallet(childB, userB.getFamilyUnitId(), 20);

    UUID deliveredRedemption = redeemReward(familyAToken, childA, "Cinema", 10);
    redeemReward(familyBToken, childB, "Recompensa externa", 5);
    String deliveredResponse = mockMvc.perform(patch("/reward-redemptions/{id}/delivered", deliveredRedemption)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
    String deliveredAt = objectMapper.readTree(deliveredResponse).get("deliveredAt").asText();

    String response = mockMvc.perform(get("/dashboard/responsible")
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.recentRedemptions.length()").value(1))
        .andExpect(jsonPath("$.recentRedemptions[0].id").value(deliveredRedemption.toString()))
        .andExpect(jsonPath("$.recentRedemptions[0].rewardTitle").value("Cinema"))
        .andExpect(jsonPath("$.recentRedemptions[0].status").value("DELIVERED"))
        .andExpect(jsonPath("$.recentRedemptions[0].deliveredAt").value(deliveredAt))
        .andExpect(jsonPath("$.recentRedemptions[0].redeemedAt").exists())
        .andReturn()
        .getResponse()
        .getContentAsString();

    assertThat(response)
        .doesNotContain("Noah")
        .doesNotContain("Recompensa externa")
        .doesNotContain(userA.getFamilyUnitId().toString());
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

  private void complete(String token, UUID assignedMissionId) throws Exception {
    mockMvc.perform(post("/assigned-missions/{id}/complete", assignedMissionId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
  }

  private void reject(String token, UUID assignedMissionId) throws Exception {
    mockMvc.perform(post("/assigned-missions/{id}/reject", assignedMissionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(Map.of("reason", "Precisa refazer"))))
        .andExpect(status().isOk());
  }

  private void cancelAssignment(UUID assignedMissionId) {
    AssignedMission assignment = assignedMissionRepository.findById(assignedMissionId).orElseThrow();
    assignment.cancel();
    assignedMissionRepository.saveAndFlush(assignment);
  }

  private void creditWallet(UUID childId, UUID familyUnitId, int amount) {
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, familyUnitId)
        .orElseThrow();
    wallet.credit(amount);
    walletRepository.saveAndFlush(wallet);
  }

  private UUID redeemReward(String token, UUID childId, String title, int cost) throws Exception {
    UUID rewardId = createReward(token, new CreateRewardRequest(title, "Prêmio combinado", cost));
    String response = mockMvc.perform(post("/rewards/{id}/redeem", rewardId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RedeemRewardRequest(childId))))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();
    return UUID.fromString(objectMapper.readTree(response).get("id").asText());
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
