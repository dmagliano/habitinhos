package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.AuthResponse;
import br.com.habitinhos.auth.dto.DeleteAccountRequest;
import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.MeResponse;
import br.com.habitinhos.auth.dto.PasswordResetConfirmRequest;
import br.com.habitinhos.auth.dto.PasswordResetRequest;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetConfirmRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetRequest;
import br.com.habitinhos.auth.dto.VerifyResponsiblePinRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private static final Logger log = LoggerFactory.getLogger(AuthController.class);

  private final AuthService authService;
  private final CurrentUserProvider currentUserProvider;

  public AuthController(AuthService authService, CurrentUserProvider currentUserProvider) {
    this.authService = authService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping("/auth/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    log.info("Auth register request received");
    return authService.register(request);
  }

  @PostMapping("/auth/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    log.info("Auth login request received");
    return authService.login(request);
  }

  @PostMapping("/auth/password-reset/request")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
    log.info("Password reset request received");
    authService.requestPasswordReset(request);
  }

  @PostMapping("/auth/password-reset/confirm")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
    log.info("Password reset confirmation received");
    authService.confirmPasswordReset(request);
  }

  @PostMapping("/auth/responsible-pin/verify")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void verifyResponsiblePin(@Valid @RequestBody VerifyResponsiblePinRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Responsible PIN verification request received for userId={}", currentUser.userId());
    authService.verifyResponsiblePin(currentUser, request);
  }

  @PostMapping("/auth/responsible-pin/reset/request")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public void requestResponsiblePinReset(@Valid @RequestBody ResponsiblePinResetRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Responsible PIN reset request received for userId={}", currentUser.userId());
    authService.requestResponsiblePinReset(currentUser, request);
  }

  @PostMapping("/auth/responsible-pin/reset/confirm")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void confirmResponsiblePinReset(@Valid @RequestBody ResponsiblePinResetConfirmRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Responsible PIN reset confirmation received for userId={}", currentUser.userId());
    authService.confirmResponsiblePinReset(currentUser, request);
  }

  @GetMapping("/me")
  public MeResponse me() {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.debug("Auth me request for userId={} familyUnitId={}", currentUser.userId(), currentUser.familyUnitId());
    return authService.me(currentUser);
  }

  @DeleteMapping("/me")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Account deletion request received for userId={}", currentUser.userId());
    authService.deleteAccount(currentUser, request);
  }
}
