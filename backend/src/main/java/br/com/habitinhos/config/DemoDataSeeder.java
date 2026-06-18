package br.com.habitinhos.config;

import br.com.habitinhos.auth.AppUser;
import br.com.habitinhos.auth.AppUserRepository;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.ChildProfile;
import br.com.habitinhos.children.ChildProfileRepository;
import br.com.habitinhos.family.FamilyUnit;
import br.com.habitinhos.family.FamilyUnitRepository;
import br.com.habitinhos.missions.AssignedMission;
import br.com.habitinhos.missions.AssignedMissionRepository;
import br.com.habitinhos.missions.Mission;
import br.com.habitinhos.missions.MissionRepository;
import br.com.habitinhos.missions.RecurrenceType;
import br.com.habitinhos.rewards.Reward;
import br.com.habitinhos.rewards.RewardRedemption;
import br.com.habitinhos.rewards.RewardRedemptionRepository;
import br.com.habitinhos.rewards.RewardRepository;
import br.com.habitinhos.wallet.CoinTransaction;
import br.com.habitinhos.wallet.Wallet;
import br.com.habitinhos.wallet.WalletRepository;
import br.com.habitinhos.wallet.WalletService;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
@ConditionalOnProperty(prefix = "habitinhos.demo.seed", name = "enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
  private static final String DEMO_EMAIL = "demo@habitinhos.local";

  private final AppUserRepository appUserRepository;
  private final FamilyUnitRepository familyUnitRepository;
  private final ChildProfileRepository childProfileRepository;
  private final WalletRepository walletRepository;
  private final WalletService walletService;
  private final MissionRepository missionRepository;
  private final AssignedMissionRepository assignedMissionRepository;
  private final RewardRepository rewardRepository;
  private final RewardRedemptionRepository rewardRedemptionRepository;
  private final PasswordEncoder passwordEncoder;

  public DemoDataSeeder(
      AppUserRepository appUserRepository,
      FamilyUnitRepository familyUnitRepository,
      ChildProfileRepository childProfileRepository,
      WalletRepository walletRepository,
      WalletService walletService,
      MissionRepository missionRepository,
      AssignedMissionRepository assignedMissionRepository,
      RewardRepository rewardRepository,
      RewardRedemptionRepository rewardRedemptionRepository,
      PasswordEncoder passwordEncoder) {
    this.appUserRepository = appUserRepository;
    this.familyUnitRepository = familyUnitRepository;
    this.childProfileRepository = childProfileRepository;
    this.walletRepository = walletRepository;
    this.walletService = walletService;
    this.missionRepository = missionRepository;
    this.assignedMissionRepository = assignedMissionRepository;
    this.rewardRepository = rewardRepository;
    this.rewardRedemptionRepository = rewardRedemptionRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(ApplicationArguments args) {
    run();
  }

  @Transactional
  public void run() {
    if (appUserRepository.existsByEmailIgnoreCase(DEMO_EMAIL)) {
      log.info("Demo seed skipped: responsible account already exists.");
      return;
    }

    FamilyUnit family = familyUnitRepository.saveAndFlush(new FamilyUnit("Família Demo Habitinhos"));
    AppUser responsible = appUserRepository.saveAndFlush(new AppUser(
        family.getId(),
        "Dani Demo",
        DEMO_EMAIL,
        UserRole.RESPONSIBLE,
        passwordEncoder.encode("Demo12345"),
        passwordEncoder.encode("1234")));

    ChildProfile nina = createChild(family, "Nina", 8, "star", "1111");
    ChildProfile leo = createChild(family, "Leo", 6, "rocket", "2222");
    Wallet ninaWallet = walletService.createForChild(family.getId(), nina.getId());
    walletService.createForChild(family.getId(), leo.getId());

    Mission tidyRoom = createMission(
        family,
        responsible,
        "Arrumar o quarto",
        "Guardar brinquedos e deixar a cama pronta.",
        20,
        true,
        RecurrenceType.DAILY,
        1);
    Mission readBook = createMission(
        family,
        responsible,
        "Ler por 20 minutos",
        "Registrar a leitura do dia.",
        15,
        false,
        RecurrenceType.DAILY,
        1);
    Mission helpTable = createMission(
        family,
        responsible,
        "Ajudar a pôr a mesa",
        "Preparar pratos e talheres com supervisão.",
        10,
        true,
        RecurrenceType.WEEKLY,
        7);

    AssignedMission awaitingApproval = assignMission(family, tidyRoom, nina, LocalDate.now());
    awaitingApproval.markCompleted();
    assignedMissionRepository.saveAndFlush(awaitingApproval);

    AssignedMission completedReading = assignMission(family, readBook, nina, LocalDate.now().minusDays(1));
    completedReading.markCompleted();
    assignedMissionRepository.saveAndFlush(completedReading);
    walletService.creditForMission(
        family.getId(),
        nina.getId(),
        completedReading.getId(),
        readBook.getCoinValue(),
        responsible.getId());

    AssignedMission completedTable = assignMission(family, helpTable, leo, LocalDate.now().minusDays(2));
    completedTable.markCompleted();
    completedTable.approve();
    assignedMissionRepository.saveAndFlush(completedTable);
    walletService.creditForMission(
        family.getId(),
        leo.getId(),
        completedTable.getId(),
        helpTable.getCoinValue(),
        responsible.getId());

    assignMission(family, tidyRoom, leo, LocalDate.now().plusDays(1));

    Reward movieNight = createReward(
        family,
        responsible,
        "Noite de filme",
        "Escolher o filme da família no fim de semana.",
        10);
    createReward(
        family,
        responsible,
        "Passeio no parque",
        "Trocar moedas por um passeio especial.",
        25);

    RewardRedemption redemption = rewardRedemptionRepository.saveAndFlush(new RewardRedemption(
        family.getId(),
        nina.getId(),
        ninaWallet.getId(),
        movieNight));
    CoinTransaction debit = walletService.debitForRewardRedemption(
        family.getId(),
        nina.getId(),
        redemption.getId(),
        movieNight.getCost(),
        responsible.getId());
    redemption.linkCoinTransaction(debit.getId());

    log.info("Demo seed created: responsibleEmail={} familyUnitId={}", DEMO_EMAIL, family.getId());
  }

  private ChildProfile createChild(FamilyUnit family, String name, int age, String avatarKey, String pin) {
    return childProfileRepository.saveAndFlush(new ChildProfile(
        family.getId(),
        name,
        age,
        avatarKey,
        passwordEncoder.encode(pin)));
  }

  private Mission createMission(
      FamilyUnit family,
      AppUser responsible,
      String title,
      String description,
      int coinValue,
      boolean requiresApproval,
      RecurrenceType recurrenceType,
      int completionWindowDays) {
    return missionRepository.saveAndFlush(new Mission(
        family.getId(),
        title,
        description,
        coinValue,
        requiresApproval,
        recurrenceType,
        completionWindowDays,
        responsible.getId()));
  }

  private AssignedMission assignMission(
      FamilyUnit family,
      Mission mission,
      ChildProfile child,
      LocalDate scheduledDate) {
    LocalDate dueDate = scheduledDate.plusDays(mission.getCompletionWindowDays());
    return assignedMissionRepository.saveAndFlush(new AssignedMission(
        family.getId(),
        mission.getId(),
        child.getId(),
        scheduledDate,
        dueDate,
        mission));
  }

  private Reward createReward(
      FamilyUnit family,
      AppUser responsible,
      String title,
      String description,
      int cost) {
    return rewardRepository.saveAndFlush(new Reward(
        family.getId(),
        title,
        description,
        cost,
        responsible.getId()));
  }
}
