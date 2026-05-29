package br.com.habitinhos.wallet;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wallets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Wallet extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(name = "child_id", nullable = false, unique = true)
  private UUID childId;

  @Column(nullable = false)
  private int balance;

  public Wallet(UUID familyUnitId, UUID childId, int balance) {
    this.familyUnitId = familyUnitId;
    this.childId = childId;
    this.balance = balance;
  }
}
