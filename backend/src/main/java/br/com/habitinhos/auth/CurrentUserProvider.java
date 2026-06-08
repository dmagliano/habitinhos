package br.com.habitinhos.auth;

import br.com.habitinhos.shared.error.UnauthorizedException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

  private final AppUserRepository appUserRepository;

  public CurrentUserProvider(AppUserRepository appUserRepository) {
    this.appUserRepository = appUserRepository;
  }

  public CurrentUser getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new UnauthorizedException("UNAUTHORIZED", "Autenticação necessária.");
    }

    UUID userId = UUID.fromString(jwt.getClaimAsString("user_id"));
    AppUser user = appUserRepository.findById(userId)
        .filter(AppUser::isActive)
        .orElseThrow(() -> new UnauthorizedException("UNAUTHORIZED", "Autenticação necessária."));

    return new CurrentUser(
        user.getId(),
        user.getFamilyUnitId(),
        user.getRole(),
        user.getEmail());
  }
}
