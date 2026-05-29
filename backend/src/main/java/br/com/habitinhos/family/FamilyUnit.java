package br.com.habitinhos.family;

import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "family_units")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FamilyUnit extends BaseEntity {

  @Column(nullable = false, length = 160)
  private String name;

  @Column(nullable = false)
  private boolean active = true;

  public FamilyUnit(String name) {
    this.name = name;
  }
}
