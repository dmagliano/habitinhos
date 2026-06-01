package br.com.habitinhos.rewards;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.rewards.dto.CreateRewardRequest;
import br.com.habitinhos.rewards.dto.RedeemRewardRequest;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.wallet.CoinTransaction;
import br.com.habitinhos.wallet.CoinTransactionRepository;
import br.com.habitinhos.wallet.CoinTransactionSourceType;
import br.com.habitinhos.wallet.CoinTransactionType;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

class RewardRedemptionIntegrationTest extends AbstractIntegrationTest {

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
  private WalletRepository walletRepository;

  @Test
  void childRewardRedemptionDebitsWalletAndLinksLedger() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID rewardId = createReward(token, new CreateRewardRequest("Cinema", "Sessão de sábado", 10));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    creditWallet(childId, user.getFamilyUnitId(), 15);

    String response = mockMvc.perform(post("/rewards/{id}/redeem", rewardId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RedeemRewardRequest(childId))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.rewardId").value(rewardId.toString()))
        .andExpect(jsonPath("$.childId").value(childId.toString()))
        .andExpect(jsonPath("$.status").value("REDEEMED"))
        .andExpect(jsonPath("$.snapshotTitle").value("Cinema"))
        .andExpect(jsonPath("$.snapshotCost").value(10))
        .andExpect(jsonPath("$.coinTransactionId").exists())
        .andExpect(jsonPath("$.familyUnitId").doesNotExist())
        .andReturn()
        .getResponse()
        .getContentAsString();

    JsonNode redemptionJson = objectMapper.readTree(response);
    UUID redemptionId = UUID.fromString(redemptionJson.get("id").asText());
    UUID transactionId = UUID.fromString(redemptionJson.get("coinTransactionId").asText());
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    RewardRedemption redemption = rewardRedemptionRepository.findById(redemptionId).orElseThrow();
    CoinTransaction transaction = coinTransactionRepository.findById(transactionId).orElseThrow();

    assertThat(wallet.getBalance()).isEqualTo(5);
    assertThat(redemption.getCoinTransactionId()).isEqualTo(transactionId);
    assertThat(transaction.getType()).isEqualTo(CoinTransactionType.DEBIT);
    assertThat(transaction.getSourceType()).isEqualTo(CoinTransactionSourceType.REWARD_REDEMPTION);
    assertThat(transaction.getRewardRedemptionId()).isEqualTo(redemptionId);
    assertThat(transaction.getAmount()).isEqualTo(10);
    assertThat(transaction.getBalanceAfter()).isEqualTo(5);
  }

  @Test
  void rewardRedemptionWithInsufficientBalanceRollsBackWithoutPartialRecords() throws Exception {
    String token = registerToken("responsavel@example.com", "Familia Demo");
    UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
    UUID rewardId = createReward(token, new CreateRewardRequest("Cinema", "Sessão de sábado", 10));
    AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
    creditWallet(childId, user.getFamilyUnitId(), 3);

    mockMvc.perform(post("/rewards/{id}/redeem", rewardId)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RedeemRewardRequest(childId))))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.code").value("INSUFFICIENT_BALANCE"));

    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
        .orElseThrow();
    assertThat(wallet.getBalance()).isEqualTo(3);
    assertThat(rewardRedemptionRepository.findAll()).isEmpty();
    assertThat(coinTransactionRepository.findAll()).isEmpty();
  }

  @Test
  void rewardRedemptionBlocksCrossFamilyRewardAndChildAccess() throws Exception {
    String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
    String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
    UUID childA = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));
    UUID childB = createChild(familyBToken, new ChildRequest("Noah", 7, "rocket", null));
    UUID rewardA = createReward(familyAToken, new CreateRewardRequest("Cinema", "Sessão A", 10));
    UUID rewardB = createReward(familyBToken, new CreateRewardRequest("Sorvete", "Sessão B", 5));

    mockMvc.perform(post("/rewards/{id}/redeem", rewardB)
            .header("Authorization", "Bearer " + familyAToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RedeemRewardRequest(childA))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("REWARD_NOT_FOUND"));

    mockMvc.perform(post("/rewards/{id}/redeem", rewardA)
            .header("Authorization", "Bearer " + familyAToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(new RedeemRewardRequest(childB))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));

    assertThat(rewardRedemptionRepository.findAll()).isEmpty();
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

  private void creditWallet(UUID childId, UUID familyUnitId, int amount) {
    Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, familyUnitId)
        .orElseThrow();
    wallet.credit(amount);
    walletRepository.saveAndFlush(wallet);
  }
}
