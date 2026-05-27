package br.com.habitinhos.auth;

import br.com.habitinhos.shared.error.UnauthorizedException;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

  public CurrentUser getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
      throw new UnauthorizedException("UNAUTHORIZED", "Autenticação necessária.");
    }

    return new CurrentUser(
        UUID.fromString(jwt.getClaimAsString("user_id")),
        UUID.fromString(jwt.getClaimAsString("family_unit_id")),
        UserRole.valueOf(jwt.getClaimAsString("role")),
        jwt.getClaimAsString("email"));
  }
}
