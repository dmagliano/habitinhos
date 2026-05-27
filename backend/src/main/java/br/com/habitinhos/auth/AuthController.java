package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.AuthResponse;
import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.MeResponse;
import br.com.habitinhos.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private final AuthService authService;
  private final CurrentUserProvider currentUserProvider;

  public AuthController(AuthService authService, CurrentUserProvider currentUserProvider) {
    this.authService = authService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping("/auth/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public MeResponse me() {
    return authService.me(currentUserProvider.getCurrentUser());
  }
}
