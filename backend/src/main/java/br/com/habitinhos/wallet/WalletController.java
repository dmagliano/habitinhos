package br.com.habitinhos.wallet;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.wallet.dto.WalletResponse;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/children/{childId}/wallet")
public class WalletController {

  private final WalletService walletService;
  private final CurrentUserProvider currentUserProvider;

  public WalletController(WalletService walletService, CurrentUserProvider currentUserProvider) {
    this.walletService = walletService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping
  public WalletResponse getWallet(@PathVariable UUID childId) {
    return walletService.getWallet(currentUserProvider.getCurrentUser(), childId);
  }
}
