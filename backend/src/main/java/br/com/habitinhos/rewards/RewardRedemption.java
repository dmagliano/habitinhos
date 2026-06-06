package br.com.habitinhos.rewards;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reward_redemptions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RewardRedemption extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(name = "reward_id", nullable = false)
  private UUID rewardId;

  @Column(name = "child_id", nullable = false)
  private UUID childId;

  @Column(name = "wallet_id", nullable = false)
  private UUID walletId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private RewardRedemptionStatus status = RewardRedemptionStatus.REDEEMED;

  @Column(name = "snapshot_title", nullable = false, length = 160)
  private String snapshotTitle;

  @Column(name = "snapshot_cost", nullable = false)
  private int snapshotCost;

  @Column(name = "coin_transaction_id")
  private UUID coinTransactionId;

  @Column(name = "delivered_at")
  private Instant deliveredAt;

  public RewardRedemption(UUID familyUnitId, UUID childId, UUID walletId, Reward reward) {
    this.familyUnitId = familyUnitId;
    this.rewardId = reward.getId();
    this.childId = childId;
    this.walletId = walletId;
    this.snapshotTitle = reward.getTitle();
    this.snapshotCost = reward.getCost();
  }

  public void linkCoinTransaction(UUID coinTransactionId) {
    this.coinTransactionId = coinTransactionId;
  }

  public void cancel() {
    this.status = RewardRedemptionStatus.CANCELLED;
  }

  public void markDelivered(Instant deliveredAt) {
    if (this.status == RewardRedemptionStatus.DELIVERED) {
      return;
    }
    this.status = RewardRedemptionStatus.DELIVERED;
    this.deliveredAt = deliveredAt.truncatedTo(ChronoUnit.MICROS);
  }
}
