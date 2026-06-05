package br.com.habitinhos.missions;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.missions.dto.AssignMissionRequest;
import br.com.habitinhos.missions.dto.MissionRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.shared.error.ConflictException;
import br.com.habitinhos.wallet.CoinTransaction;
import br.com.habitinhos.wallet.CoinTransactionRepository;
import br.com.habitinhos.wallet.CoinTransactionSourceType;
import br.com.habitinhos.wallet.CoinTransactionType;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import br.com.habitinhos.wallet.WalletService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class MissionWalletTransactionIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private AssignedMissionRepository assignedMissionRepository;

  @Autowired
  private CoinTransactionRepository coinTransactionRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private WalletService walletService;

  @Test
  void creditForMissionUpdatesWalletAndCreatesAuditableLedgerInOneTransaction() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Guardar brinquedos", "Organizar caixas", 7, false, RecurrenceType.ONCE));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();

    walletService.creditForMission(user.getFamilyUnitId(), childId, assignedMissionId, 7, user.getId());

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    List<CoinTransaction> transactions = coinTransactionRepository.findAll();

    assertThat(wallet.getBalance()).isEqualTo(7);
    assertThat(transactions).hasSize(1);
    CoinTransaction transaction = transactions.get(0);
    assertThat(transaction.getType()).isEqualTo(CoinTransactionType.CREDIT);
    assertThat(transaction.getSourceType()).isEqualTo(CoinTransactionSourceType.MISSION_COMPLETION);
    assertThat(transaction.getAmount()).isEqualTo(7);
    assertThat(transaction.getBalanceAfter()).isEqualTo(7);
    assertThat(transaction.getAssignedMissionId()).isEqualTo(assignedMissionId);
    assertThat(transaction.getRewardRedemptionId()).isNull();
    assertThat(transaction.getWalletId()).isEqualTo(wallet.getId());
    assertThat(transaction.getChildId()).isEqualTo(childId);
    assertThat(transaction.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
    assertThat(transaction.getCreatedByUserId()).isEqualTo(user.getId());
  }

  @Test
  void duplicateMissionCreditRollsBackWithoutPartialWalletOrLedgerChange() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID assignedMissionId = assignMission(
        token,
        childId,
        new MissionRequest("Lavar louça", "Lavar copos", 5, false, RecurrenceType.ONCE));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();

    walletService.creditForMission(user.getFamilyUnitId(), childId, assignedMissionId, 5, user.getId());

    assertThatThrownBy(() ->
        walletService.creditForMission(user.getFamilyUnitId(), childId, assignedMissionId, 5, user.getId()))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("Crédito de moedas já registrado");

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    assertThat(wallet.getBalance()).isEqualTo(5);
    assertThat(coinTransactionRepository.findAll()).hasSize(1);
  }

  @Test
  void walletMutationUsesPessimisticWriteLock() throws Exception {
    Lock lock = WalletRepository.class
        .getMethod("findByChildIdAndFamilyUnitIdForUpdate", UUID.class, UUID.class)
        .getAnnotation(Lock.class);

    assertThat(lock).isNotNull();
    assertThat(lock.value()).isEqualTo(LockModeType.PESSIMISTIC_WRITE);
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
    mockMvc.perform(post("/missions/{id}/assign", missionId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(
                new AssignMissionRequest(List.of(childId), LocalDate.of(2026, 6, 1)))))
        .andExpect(status().isCreated());
    return assignedMissionRepository.findAll().get(0).getId();
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
