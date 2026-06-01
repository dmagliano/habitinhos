package br.com.habitinhos.wallet;

import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.wallet.dto.CoinTransactionResponse;
import br.com.habitinhos.wallet.dto.WalletResponse;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/children/{childId}/wallet")
public class WalletController {

  private static final Logger log = LoggerFactory.getLogger(WalletController.class);

  private final WalletService walletService;
  private final CurrentUserProvider currentUserProvider;

  public WalletController(WalletService walletService, CurrentUserProvider currentUserProvider) {
    this.walletService = walletService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping
  public WalletResponse getWallet(@PathVariable UUID childId) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Get wallet request: familyUnitId={} childId={}", currentUser.familyUnitId(), childId);
    return walletService.getWallet(currentUser, childId);
  }

  @GetMapping("/transactions")
  public List<CoinTransactionResponse> getStatement(@PathVariable UUID childId) {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("Get wallet statement request: familyUnitId={} childId={}", currentUser.familyUnitId(), childId);
    return walletService.getStatement(currentUser, childId);
  }
}
