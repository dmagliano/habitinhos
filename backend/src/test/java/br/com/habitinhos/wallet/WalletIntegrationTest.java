package br.com.habitinhos.wallet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.rewards.Reward;
import br.com.habitinhos.rewards.RewardRedemption;
import br.com.habitinhos.rewards.RewardRedemptionRepository;
import br.com.habitinhos.rewards.RewardRepository;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.shared.error.ConflictException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class WalletIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private CoinTransactionRepository coinTransactionRepository;

  @Autowired
  private RewardRedemptionRepository rewardRedemptionRepository;

  @Autowired
  private RewardRepository rewardRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private WalletService walletService;

  @Test
  void responsibleCanReadOwnChildWalletWithoutTenantLeak() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));

    mockMvc.perform(get("/children/{childId}/wallet", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.childId").value(childId.toString()))
        .andExpect(jsonPath("$.balance").value(0))
        .andExpect(jsonPath("$.createdAt").exists())
        .andExpect(jsonPath("$.updatedAt").exists())
        .andExpect(jsonPath("$.familyUnitId").doesNotExist());
  }

  @Test
  void responsibleCannotReadWalletFromAnotherFamily() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID foreignChildId = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));

    mockMvc.perform(get("/children/{childId}/wallet", foreignChildId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));
  }

  @Test
  void responsibleCanListOwnChildWalletStatementWithoutTenantLeak() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    wallet.credit(15);
    walletRepository.saveAndFlush(wallet);
    RewardRedemption redemption = createRedemption(user, childId, wallet.getId(), 10);
    CoinTransaction transaction = walletService.debitForRewardRedemption(
        user.getFamilyUnitId(),
        childId,
        redemption.getId(),
        10,
        user.getId());

    mockMvc.perform(get("/children/{childId}/wallet/transactions", childId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(transaction.getId().toString()))
        .andExpect(jsonPath("$[0].childId").value(childId.toString()))
        .andExpect(jsonPath("$[0].rewardRedemptionId").value(redemption.getId().toString()))
        .andExpect(jsonPath("$[0].assignedMissionId").doesNotExist())
        .andExpect(jsonPath("$[0].type").value("DEBIT"))
        .andExpect(jsonPath("$[0].sourceType").value("REWARD_REDEMPTION"))
        .andExpect(jsonPath("$[0].amount").value(10))
        .andExpect(jsonPath("$[0].balanceAfter").value(5))
        .andExpect(jsonPath("$[0].familyUnitId").doesNotExist());
  }

  @Test
  void responsibleCannotListWalletStatementFromAnotherFamily() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID foreignChildId = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));

    mockMvc.perform(get("/children/{childId}/wallet/transactions", foreignChildId)
            .header("Authorization", "Bearer " + familyAToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));
  }

  @Test
  void debitForRewardRedemptionUpdatesWalletAndCreatesAuditableLedger() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    wallet.credit(15);
    walletRepository.saveAndFlush(wallet);
    RewardRedemption redemption = createRedemption(user, childId, wallet.getId(), 10);

    CoinTransaction transaction = walletService.debitForRewardRedemption(
        user.getFamilyUnitId(),
        childId,
        redemption.getId(),
        10,
        user.getId());

    Wallet updatedWallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    List<CoinTransaction> transactions = coinTransactionRepository.findAll();

    assertThat(updatedWallet.getBalance()).isEqualTo(5);
    assertThat(transactions).hasSize(1);
    assertThat(transaction.getId()).isEqualTo(transactions.get(0).getId());
    assertThat(transaction.getType()).isEqualTo(CoinTransactionType.DEBIT);
    assertThat(transaction.getSourceType()).isEqualTo(CoinTransactionSourceType.REWARD_REDEMPTION);
    assertThat(transaction.getAmount()).isEqualTo(10);
    assertThat(transaction.getBalanceAfter()).isEqualTo(5);
    assertThat(transaction.getAssignedMissionId()).isNull();
    assertThat(transaction.getRewardRedemptionId()).isEqualTo(redemption.getId());
    assertThat(transaction.getWalletId()).isEqualTo(wallet.getId());
    assertThat(transaction.getChildId()).isEqualTo(childId);
    assertThat(transaction.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
    assertThat(transaction.getCreatedByUserId()).isEqualTo(user.getId());
  }

  @Test
  void debitForRewardRedemptionRejectsInsufficientBalanceWithoutPartialWalletOrLedgerChange()
      throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    wallet.credit(3);
    walletRepository.saveAndFlush(wallet);
    RewardRedemption redemption = createRedemption(user, childId, wallet.getId(), 10);

    assertThatThrownBy(() -> walletService.debitForRewardRedemption(
        user.getFamilyUnitId(),
        childId,
        redemption.getId(),
        10,
        user.getId()))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("Saldo insuficiente");

    Wallet unchangedWallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    assertThat(unchangedWallet.getBalance()).isEqualTo(3);
    assertThat(coinTransactionRepository.findAll()).isEmpty();
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

  private RewardRedemption createRedemption(AppUser user, UUID childId, UUID walletId, int cost) {
    Reward reward = rewardRepository.saveAndFlush(new Reward(
        user.getFamilyUnitId(),
        "Cinema",
        "Sessão de sábado",
        cost,
        user.getId()));
    return rewardRedemptionRepository.saveAndFlush(new RewardRedemption(
        user.getFamilyUnitId(),
        childId,
        walletId,
        reward));
  }
}
