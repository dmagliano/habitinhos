package br.com.habitinhos.shared.error;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiError> handleApiException(ApiException exception) {
    return ResponseEntity
        .status(exception.getStatus())
        .body(ApiError.of(exception.getCode(), exception.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
    Map<String, Object> details = new LinkedHashMap<>();
    exception.getBindingResult().getFieldErrors().forEach(error ->
        details.put(error.getField(), error.getDefaultMessage()));
    return ResponseEntity
        .badRequest()
        .body(new ApiError("VALIDATION_ERROR", "Dados inválidos.", details));
  }

  @ExceptionHandler(AuthenticationException.class)
  ResponseEntity<ApiError> handleAuthentication() {
    return ResponseEntity
        .status(HttpStatus.UNAUTHORIZED)
        .body(ApiError.of("UNAUTHORIZED", "Autenticação necessária."));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiError> handleAccessDenied() {
    return ResponseEntity
        .status(HttpStatus.FORBIDDEN)
        .body(ApiError.of("FORBIDDEN", "Acesso não permitido."));
  }
}
