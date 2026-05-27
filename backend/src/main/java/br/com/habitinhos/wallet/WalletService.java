package br.com.habitinhos.wallet;

import br.com.habitinhos.shared.error.ConflictException;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class WalletService {

  private final WalletRepository walletRepository;

  public WalletService(WalletRepository walletRepository) {
    this.walletRepository = walletRepository;
  }

  public Wallet createForChild(UUID familyUnitId, UUID childId) {
    if (walletRepository.existsByChildId(childId)) {
      throw new ConflictException("WALLET_ALREADY_EXISTS", "Carteira já existe para esta criança.");
    }

    return walletRepository.save(new Wallet(familyUnitId, childId, 0));
  }
}
