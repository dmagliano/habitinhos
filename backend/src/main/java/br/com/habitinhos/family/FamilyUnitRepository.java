package br.com.habitinhos.family;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyUnitRepository extends JpaRepository<FamilyUnit, UUID> {
}
