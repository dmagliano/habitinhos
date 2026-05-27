package br.com.habitinhos.auth;

import java.time.Clock;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final JwtEncoder jwtEncoder;
  private final Clock clock;
  private final String issuer;
  private final long expirationMinutes;

  public JwtService(
      JwtEncoder jwtEncoder,
      @Value("${habitinhos.security.jwt.issuer}") String issuer,
      @Value("${habitinhos.security.jwt.expiration-minutes}") long expirationMinutes) {
    this.jwtEncoder = jwtEncoder;
    this.issuer = issuer;
    this.expirationMinutes = expirationMinutes;
    this.clock = Clock.systemUTC();
  }

  public String issueToken(AppUser user) {
    Instant issuedAt = Instant.now(clock);
    Instant expiresAt = issuedAt.plusSeconds(expirationMinutes * 60);

    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(issuer)
        .subject(user.getId().toString())
        .issuedAt(issuedAt)
        .expiresAt(expiresAt)
        .claim("user_id", user.getId().toString())
        .claim("family_unit_id", user.getFamilyUnitId().toString())
        .claim("role", user.getRole().name())
        .claim("email", user.getEmail())
        .build();

    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
  }
}
