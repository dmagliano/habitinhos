package br.com.habitinhos.auth;

import org.springframework.stereotype.Component;

@Component
public class PermanentDeletionFailureInjector {

  public void afterFirstFamilyDelete() {
    // Production intentionally does nothing; integration tests replace this bean.
  }
}
