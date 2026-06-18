package br.com.habitinhos.config;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.family.FamilyUnit;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.missions.AssignedMission;
import br.com.habitinhos.missions.AssignedMissionRepository;
import br.com.habitinhos.missions.AssignedMissionStatus;
import br.com.habitinhos.missions.MissionRepository;
import br.com.habitinhos.rewards.RewardRedemptionRepository;
import br.com.habitinhos.rewards.RewardRepository;
import br.com.habitinhos.shared.AbstractIntegrationTest;
import br.com.habitinhos.wallet.CoinTransactionRepository;
import br.com.habitinhos.wallet.WalletRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "habitinhos.demo.seed.enabled=true")
class DemoDataSeederTest extends AbstractIntegrationTest {

  @Autowired
  private DemoDataSeeder demoDataSeeder;

  @Autowired
  private AppUserRepository appUserRepository;

  @Autowired
  private FamilyUnitRepository familyUnitRepository;

  @Autowired
  private ChildProfileRepository childProfileRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private MissionRepository missionRepository;

  @Autowired
  private AssignedMissionRepository assignedMissionRepository;

  @Autowired
  private RewardRepository rewardRepository;

  @Autowired
  private RewardRedemptionRepository rewardRedemptionRepository;

  @Autowired
  private CoinTransactionRepository coinTransactionRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  void seedsRepresentativeDemoDataAndIsIdempotent() throws Exception {
    demoDataSeeder.run();
    demoDataSeeder.run();

    AppUser responsible = appUserRepository.findByEmailIgnoreCase("demo@habitinhos.local")
        .orElseThrow();
    assertThat(passwordEncoder.matches("Demo12345", responsible.getPasswordHash())).isTrue();
    assertThat(passwordEncoder.matches("1234", responsible.getResponsiblePinHash())).isTrue();

    List<AppUser> demoUsers = appUserRepository.findAll()
        .stream()
        .filter(user -> "demo@habitinhos.local".equalsIgnoreCase(user.getEmail()))
        .toList();
    assertThat(demoUsers).hasSize(1);

    FamilyUnit family = familyUnitRepository.findById(responsible.getFamilyUnitId()).orElseThrow();
    assertThat(family.getName()).isEqualTo("Família Demo Habitinhos");
    assertThat(family.isActive()).isTrue();
    assertThat(familyUnitRepository.findAll())
        .extracting(FamilyUnit::getName)
        .containsExactly("Família Demo Habitinhos");

    List<ChildProfile> children = childProfileRepository
        .findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(family.getId());
    assertThat(children).hasSizeGreaterThanOrEqualTo(2);
    assertThat(children).allMatch(ChildProfile::isActive);
    assertThat(walletRepository.findAllByFamilyUnitIdAndChildIdIn(
        family.getId(),
        children.stream().map(ChildProfile::getId).toList()))
        .hasSize(children.size());

    assertThat(missionRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(family.getId()))
        .hasSizeGreaterThanOrEqualTo(3);

    List<AssignedMission> assignedMissions = assignedMissionRepository.findAllByFamilyUnitIdAndChildIdIn(
        family.getId(),
        children.stream().map(ChildProfile::getId).toList());
    assertThat(assignedMissions)
        .extracting(AssignedMission::getStatus)
        .contains(
            AssignedMissionStatus.PENDING,
            AssignedMissionStatus.AWAITING_APPROVAL,
            AssignedMissionStatus.COMPLETED);

    assertThat(rewardRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(family.getId()))
        .hasSizeGreaterThanOrEqualTo(2);
    assertThat(rewardRedemptionRepository.findAllByFamilyUnitIdOrderByCreatedAtDesc(
        family.getId(),
        org.springframework.data.domain.Pageable.unpaged()))
        .hasSizeGreaterThanOrEqualTo(1);
    assertThat(coinTransactionRepository.findAll())
        .hasSizeGreaterThanOrEqualTo(2);
  }
}
