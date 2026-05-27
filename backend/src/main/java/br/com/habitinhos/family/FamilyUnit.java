package br.com.habitinhos.family;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "family_units")
public class FamilyUnit extends BaseEntity {

  @Column(nullable = false, length = 160)
  private String name;

  @Column(nullable = false)
  private boolean active = true;

  protected FamilyUnit() {
  }

  public FamilyUnit(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }
}
