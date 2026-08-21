package br.com.habitinhos.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

  Optional<AppUser> findByEmailIgnoreCase(String email);

  Optional<AppUser> findByEmailIgnoreCaseAndActiveTrue(String email);

  @Query(value = "SELECT * FROM app_users WHERE lower(trim(email)) = :email ORDER BY created_at, id", nativeQuery = true)
  List<AppUser> findAllByNormalizedEmail(@Param("email") String email);

  boolean existsByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCaseAndActiveTrue(String email);
}
