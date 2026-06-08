package br.com.habitinhos.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthResetTokenRepository extends JpaRepository<AuthResetToken, UUID> {

  List<AuthResetToken> findByUserIdAndPurposeAndUsedAtIsNull(UUID userId, AuthResetPurpose purpose);

  Optional<AuthResetToken> findByTokenHashAndPurpose(String tokenHash, AuthResetPurpose purpose);

  boolean existsByTokenHash(String tokenHash);
}
