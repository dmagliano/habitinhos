package br.com.habitinhos.auth;

import br.com.habitinhos.auth.dto.AuthResponse;
import br.com.habitinhos.auth.dto.DeleteAccountConfirmRequest;
import br.com.habitinhos.auth.dto.DeleteAccountRequest;
import br.com.habitinhos.auth.dto.LoginRequest;
import br.com.habitinhos.auth.dto.MeResponse;
import br.com.habitinhos.auth.dto.PasswordResetConfirmRequest;
import br.com.habitinhos.auth.dto.PasswordResetRequest;
import br.com.habitinhos.auth.dto.PermanentDeletionConfirmRequest;
import br.com.habitinhos.auth.dto.PermanentDeletionRequest;
import br.com.habitinhos.auth.dto.RegisterRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetConfirmRequest;
import br.com.habitinhos.auth.dto.ResponsiblePinResetRequest;
import br.com.habitinhos.auth.dto.VerifyResponsiblePinRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
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
  private final PermanentAccountDeletionService permanentAccountDeletionService;

  public AuthController(
      AuthService authService,
      CurrentUserProvider currentUserProvider,
      PermanentAccountDeletionService permanentAccountDeletionService) {
    this.authService = authService;
    this.currentUserProvider = currentUserProvider;
    this.permanentAccountDeletionService = permanentAccountDeletionService;
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

  @PostMapping("/auth/account-deletion/request")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public void requestAccountDeletion(@Valid @RequestBody DeleteAccountRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Account deletion confirmation request received for userId={}", currentUser.userId());
    authService.requestAccountDeletion(currentUser, request);
  }

  @PostMapping("/auth/account-deletion/confirm")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void confirmAccountDeletion(@Valid @RequestBody DeleteAccountConfirmRequest request) {
    CurrentUser currentUser = currentUserProvider.getCurrentUser();
    log.info("Account deletion confirmation received for userId={}", currentUser.userId());
    authService.confirmAccountDeletion(currentUser, request);
  }

  @PostMapping("/auth/account-deletion/permanent/request")
  @ResponseStatus(HttpStatus.ACCEPTED)
  @Operation(
      summary = "Solicitar exclusão permanente dos dados",
      description = "Responde de forma idêntica exista ou não uma conta e envia um código quando há correspondência.")
  @SecurityRequirements
  @ApiResponses({
      @ApiResponse(responseCode = "202", description = "Solicitação processada sem revelar se o e-mail existe"),
      @ApiResponse(responseCode = "400", description = "Corpo inválido")
  })
  public void requestPermanentAccountDeletion(@Valid @RequestBody PermanentDeletionRequest request) {
    log.info("Permanent account deletion request received");
    authService.requestPermanentAccountDeletion(request);
  }

  @PostMapping("/auth/account-deletion/permanent/confirm")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(
      summary = "Confirmar exclusão permanente dos dados",
      description = "Exclui irreversivelmente todas as contas e famílias associadas ao e-mail confirmado.")
  @SecurityRequirements
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Dados excluídos permanentemente"),
      @ApiResponse(responseCode = "400", description = "E-mail ou código inválido, expirado ou já utilizado")
  })
  public void confirmPermanentAccountDeletion(@Valid @RequestBody PermanentDeletionConfirmRequest request) {
    log.info("Permanent account deletion confirmation received");
    permanentAccountDeletionService.confirm(request);
  }
}
