package br.com.habitinhos.wallet;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "wallets")
public class Wallet extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(name = "child_id", nullable = false, unique = true)
  private UUID childId;

  @Column(nullable = false)
  private int balance;

  protected Wallet() {
  }

  public Wallet(UUID familyUnitId, UUID childId, int balance) {
    this.familyUnitId = familyUnitId;
    this.childId = childId;
    this.balance = balance;
  }

  public UUID getFamilyUnitId() {
    return familyUnitId;
  }

  public void setFamilyUnitId(UUID familyUnitId) {
    this.familyUnitId = familyUnitId;
  }

  public UUID getChildId() {
    return childId;
  }

  public void setChildId(UUID childId) {
    this.childId = childId;
  }

  public int getBalance() {
    return balance;
  }

  public void setBalance(int balance) {
    this.balance = balance;
  }
}
