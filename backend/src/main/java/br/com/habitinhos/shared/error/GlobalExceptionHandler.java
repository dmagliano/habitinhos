package br.com.habitinhos.shared.error;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiError> handleApiException(ApiException exception) {
    if (exception.getStatus().is5xxServerError()) {
      log.error("Application error: code={} status={} message={}", exception.getCode(), exception.getStatus(), exception.getMessage());
    } else {
      log.warn("Business error: code={} status={} message={}", exception.getCode(), exception.getStatus(), exception.getMessage());
    }
    return ResponseEntity
        .status(exception.getStatus())
        .body(ApiError.of(exception.getCode(), exception.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
    Map<String, Object> details = new LinkedHashMap<>();
    exception.getBindingResult().getFieldErrors().forEach(error ->
        details.put(error.getField(), error.getDefaultMessage()));
    log.warn("Validation error: fields={}", details.keySet());
    return ResponseEntity
        .badRequest()
        .body(new ApiError("VALIDATION_ERROR", "Dados inválidos.", details));
  }

  @ExceptionHandler(AuthenticationException.class)
  ResponseEntity<ApiError> handleAuthentication(AuthenticationException exception) {
    log.warn("Authentication error: {}", exception.getMessage());
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(ApiError.of("UNAUTHORIZED", "Autenticação necessária."));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException exception) {
    log.warn("Access denied error: {}", exception.getMessage());
    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(ApiError.of("FORBIDDEN", "Acesso não permitido."));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> handleUnexpected(Exception exception) {
    log.error("Unexpected error", exception);
    return ResponseEntity
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiError.of("INTERNAL_SERVER_ERROR", "Erro interno inesperado."));
  }
}
