package br.com.habitinhos.wallet;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coin_transactions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CoinTransaction {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false)
  private UUID id;

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(name = "wallet_id", nullable = false)
  private UUID walletId;

  @Column(name = "child_id", nullable = false)
  private UUID childId;

  @Column(name = "assigned_mission_id")
  private UUID assignedMissionId;

  @Column(name = "reward_redemption_id")
  private UUID rewardRedemptionId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CoinTransactionType type;

  @Enumerated(EnumType.STRING)
  @Column(name = "source_type", nullable = false, length = 40)
  private CoinTransactionSourceType sourceType;

  @Column(nullable = false)
  private int amount;

  @Column(name = "balance_after", nullable = false)
  private int balanceAfter;

  @Column(length = 255)
  private String description;

  @Column(name = "created_by_user_id")
  private UUID createdByUserId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  private CoinTransaction(
      UUID familyUnitId,
      UUID walletId,
      UUID childId,
      UUID assignedMissionId,
      UUID rewardRedemptionId,
      CoinTransactionType type,
      CoinTransactionSourceType sourceType,
      int amount,
      int balanceAfter,
      String description,
      UUID createdByUserId) {
    this.familyUnitId = familyUnitId;
    this.walletId = walletId;
    this.childId = childId;
    this.assignedMissionId = assignedMissionId;
    this.rewardRedemptionId = rewardRedemptionId;
    this.type = type;
    this.sourceType = sourceType;
    this.amount = amount;
    this.balanceAfter = balanceAfter;
    this.description = description;
    this.createdByUserId = createdByUserId;
  }

  public static CoinTransaction missionCredit(
      UUID familyUnitId,
      UUID walletId,
      UUID childId,
      UUID assignedMissionId,
      int amount,
      int balanceAfter,
      String description,
      UUID createdByUserId) {
    return new CoinTransaction(
        familyUnitId,
        walletId,
        childId,
        assignedMissionId,
        null,
        CoinTransactionType.CREDIT,
        CoinTransactionSourceType.MISSION_COMPLETION,
        amount,
        balanceAfter,
        description,
        createdByUserId);
  }

  public static CoinTransaction rewardRedemptionDebit(
      UUID familyUnitId,
      UUID walletId,
      UUID childId,
      UUID rewardRedemptionId,
      int amount,
      int balanceAfter,
      String description,
      UUID createdByUserId) {
    return new CoinTransaction(
        familyUnitId,
        walletId,
        childId,
        null,
        rewardRedemptionId,
        CoinTransactionType.DEBIT,
        CoinTransactionSourceType.REWARD_REDEMPTION,
        amount,
        balanceAfter,
        description,
        createdByUserId);
  }

  @PrePersist
  void prePersist() {
    createdAt = Instant.now();
  }
}
