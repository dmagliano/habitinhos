# Phase 02: Domínio de missões e moedas - Pattern Map

**Mapped:** 2026-05-29
**Files analyzed:** 30
**Analogs found:** 30 / 30

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/main/resources/db/migration/V2__create_mission_coin_schema.sql` | migration | CRUD | `backend/src/main/resources/db/migration/V1__create_foundation_schema.sql` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/Mission.java` | model | CRUD | `backend/src/main/java/br/com/habitinhos/children/ChildProfile.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMission.java` | model | event-driven | `backend/src/main/java/br/com/habitinhos/wallet/Wallet.java` + `ChildProfile.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/RecurrenceType.java` | model | transform | `backend/src/main/java/br/com/habitinhos/auth/UserRole.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionStatus.java` | model | event-driven | `backend/src/main/java/br/com/habitinhos/auth/UserRole.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java` | repository | CRUD | `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionRepository.java` | repository | event-driven | `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/MissionService.java` | service | CRUD | `backend/src/main/java/br/com/habitinhos/children/ChildService.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionService.java` | service | event-driven | `backend/src/main/java/br/com/habitinhos/children/ChildService.java` + `backend/src/main/java/br/com/habitinhos/wallet/WalletService.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/MissionController.java` | controller | request-response | `backend/src/main/java/br/com/habitinhos/children/ChildController.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionController.java` | controller | request-response | `backend/src/main/java/br/com/habitinhos/children/ChildController.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/dto/MissionRequest.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildRequest.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/dto/MissionResponse.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildResponse.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/dto/AssignMissionRequest.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildRequest.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/missions/dto/AssignedMissionResponse.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildResponse.java` | exact |
| `backend/src/main/java/br/com/habitinhos/missions/dto/RejectAssignedMissionRequest.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildRequest.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/wallet/CoinTransaction.java` | model | event-driven | `backend/src/main/java/br/com/habitinhos/wallet/Wallet.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/wallet/CoinTransactionRepository.java` | repository | event-driven | `backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java` | repository | CRUD | `backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java` | modify-existing |
| `backend/src/main/java/br/com/habitinhos/wallet/WalletService.java` | service | event-driven | `backend/src/main/java/br/com/habitinhos/wallet/WalletService.java` + `ChildService.java` | modify-existing |
| `backend/src/main/java/br/com/habitinhos/wallet/WalletController.java` | controller | request-response | `backend/src/main/java/br/com/habitinhos/children/ChildController.java` | exact |
| `backend/src/main/java/br/com/habitinhos/wallet/dto/WalletResponse.java` | DTO | request-response | `backend/src/main/java/br/com/habitinhos/children/dto/ChildResponse.java` | exact |
| `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` | test | batch | `backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` | modify-existing |
| `backend/src/test/java/br/com/habitinhos/missions/MissionIntegrationTest.java` | test | request-response | `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` | exact |
| `backend/src/test/java/br/com/habitinhos/missions/MissionAssignmentIntegrationTest.java` | test | request-response | `backend/src/test/java/br/com/habitinhos/children/TenantIsolationIntegrationTest.java` | exact |
| `backend/src/test/java/br/com/habitinhos/missions/AssignedMissionIntegrationTest.java` | test | event-driven | `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` | role-match |
| `backend/src/test/java/br/com/habitinhos/missions/MissionApprovalIntegrationTest.java` | test | event-driven | `backend/src/test/java/br/com/habitinhos/children/TenantIsolationIntegrationTest.java` | role-match |
| `backend/src/test/java/br/com/habitinhos/missions/MissionWalletTransactionIntegrationTest.java` | test | event-driven | `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` | role-match |
| `backend/src/test/java/br/com/habitinhos/wallet/WalletIntegrationTest.java` | test | request-response | `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` | exact |
| `backend/src/test/java/br/com/habitinhos/OpenApiIntegrationTest.java` | test | request-response | `backend/src/test/java/br/com/habitinhos/auth/AuthIntegrationTest.java` | role-match |

## Pattern Assignments

### Mission controllers and wallet controller

**Apply to:** `MissionController.java`, `AssignedMissionController.java`, `WalletController.java`
**Analog:** `backend/src/main/java/br/com/habitinhos/children/ChildController.java`

**Imports pattern** (lines 3-18):
```java
import br.com.habitinhos.auth.CurrentUserProvider;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.children.dto.ChildResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
```

**Controller dependency/current-user pattern** (lines 20-35):
```java
@RestController
@RequestMapping("/children")
public class ChildController {

  private final ChildService childService;
  private final CurrentUserProvider currentUserProvider;

  public ChildController(ChildService childService, CurrentUserProvider currentUserProvider) {
    this.childService = childService;
    this.currentUserProvider = currentUserProvider;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ChildResponse create(@Valid @RequestBody ChildRequest request) {
    return childService.create(currentUserProvider.getCurrentUser(), request);
  }
```

**CRUD path pattern** (lines 38-55):
```java
@GetMapping
public List<ChildResponse> list() {
  return childService.list(currentUserProvider.getCurrentUser());
}

@GetMapping("/{id}")
public ChildResponse get(@PathVariable UUID id) {
  return childService.get(currentUserProvider.getCurrentUser(), id);
}

@PutMapping("/{id}")
public ChildResponse update(@PathVariable UUID id, @Valid @RequestBody ChildRequest request) {
  return childService.update(currentUserProvider.getCurrentUser(), id, request);
}

@PatchMapping("/{id}/deactivate")
public ChildResponse deactivate(@PathVariable UUID id) {
  return childService.deactivate(currentUserProvider.getCurrentUser(), id);
}
```

### Mission services

**Apply to:** `MissionService.java`, `AssignedMissionService.java`, wallet credit methods in `WalletService.java`
**Analog:** `backend/src/main/java/br/com/habitinhos/children/ChildService.java`

**Imports pattern** (lines 3-14):
```java
import br.com.habitinhos.auth.CurrentUser;
import br.com.habitinhos.auth.UserRole;
import br.com.habitinhos.children.dto.ChildRequest;
import br.com.habitinhos.children.dto.ChildResponse;
import br.com.habitinhos.shared.error.ForbiddenException;
import br.com.habitinhos.shared.error.NotFoundException;
import br.com.habitinhos.wallet.WalletService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
```

**Transactional create pattern** (lines 32-45):
```java
@Transactional
public ChildResponse create(CurrentUser currentUser, ChildRequest request) {
  requireResponsible(currentUser);
  UUID familyUnitId = currentUser.familyUnitId();
  ChildProfile child = new ChildProfile(
      familyUnitId,
      request.name().trim(),
      request.age(),
      normalizeOptional(request.avatarKey()),
      hashOptionalPin(request.accessPin()));

  childProfileRepository.saveAndFlush(child);
  walletService.createForChild(familyUnitId, child.getId());
  return toResponse(child);
}
```

**Family-scoped read/update pattern** (lines 48-80):
```java
@Transactional(readOnly = true)
public List<ChildResponse> list(CurrentUser currentUser) {
  requireResponsible(currentUser);
  return childProfileRepository
      .findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId())
      .stream()
      .map(this::toResponse)
      .toList();
}

@Transactional(readOnly = true)
public ChildResponse get(CurrentUser currentUser, UUID id) {
  requireResponsible(currentUser);
  return childProfileRepository.findByIdAndFamilyUnitId(id, currentUser.familyUnitId())
      .map(this::toResponse)
      .orElseThrow(this::childNotFound);
}

@Transactional
public ChildResponse update(CurrentUser currentUser, UUID id, ChildRequest request) {
  requireResponsible(currentUser);
  ChildProfile child = childProfileRepository
      .findByIdAndFamilyUnitIdAndActiveTrue(id, currentUser.familyUnitId())
      .orElseThrow(this::childNotFound);
```

**Role guard and not-found pattern** (lines 93-123):
```java
private void requireResponsible(CurrentUser currentUser) {
  if (currentUser.role() != UserRole.RESPONSIBLE) {
    throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
  }
}

private NotFoundException childNotFound() {
  return new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada.");
}
```

### Mission and assignment entities

**Apply to:** `Mission.java`, `AssignedMission.java`, `CoinTransaction.java`, and touched Phase 1 entities used as domain analogs (`AppUser.java`, `FamilyUnit.java`, `ChildProfile.java`, `Wallet.java`, `BaseEntity.java`, `ApiException.java`).
**Analog:** `backend/src/main/java/br/com/habitinhos/children/ChildProfile.java`; `backend/src/main/java/br/com/habitinhos/wallet/Wallet.java`; `backend/src/main/java/br/com/habitinhos/shared/model/BaseEntity.java`

**Phase 2 Lombok decision:** Touched backend entities should use Lombok for boilerplate only:
`@Getter` and `@NoArgsConstructor(access = AccessLevel.PROTECTED)`. Do not add broad class-level
`@Setter`; state transitions stay in explicit domain methods such as `update`, `deactivate`,
`markCompleted`, `approve`, `reject`, and wallet credit methods.

**Entity annotation and tenant field pattern** (`ChildProfile.java` lines 3-17):
```java
import br.com.habitinhos.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "child_profiles")
public class ChildProfile extends BaseEntity {

  @Column(name = "family_unit_id", nullable = false)
  private UUID familyUnitId;

  @Column(nullable = false, length = 160)
  private String name;
```

**Protected JPA constructor and explicit constructor pattern** (`Wallet.java` lines 22-29):
```java
protected Wallet() {
}

public Wallet(UUID familyUnitId, UUID childId, int balance) {
  this.familyUnitId = familyUnitId;
  this.childId = childId;
  this.balance = balance;
}
```

**Base timestamp/id pattern** (`BaseEntity.java` lines 13-37):
```java
@MappedSuperclass
public abstract class BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false)
  private UUID id;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void prePersist() {
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
```

**Enum pattern** (`UserRole.java` lines 1-5):
```java
package br.com.habitinhos.auth;

public enum UserRole {
  RESPONSIBLE,
  ADMIN
}
```

### Mission and wallet repositories

**Apply to:** `MissionRepository.java`, `AssignedMissionRepository.java`, `CoinTransactionRepository.java`, modified `WalletRepository.java`
**Analog:** `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java`; `backend/src/main/java/br/com/habitinhos/wallet/WalletRepository.java`

**Family-scoped repository pattern** (`ChildProfileRepository.java` lines 1-15):
```java
package br.com.habitinhos.children;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildProfileRepository extends JpaRepository<ChildProfile, UUID> {

  List<ChildProfile> findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(UUID familyUnitId);

  Optional<ChildProfile> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  Optional<ChildProfile> findByIdAndFamilyUnitIdAndActiveTrue(UUID id, UUID familyUnitId);
}
```

**Wallet lookup pattern to extend with lock** (`WalletRepository.java` lines 1-11):
```java
package br.com.habitinhos.wallet;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {

  Optional<Wallet> findByChildIdAndFamilyUnitId(UUID childId, UUID familyUnitId);

  boolean existsByChildId(UUID childId);
}
```

Planner should add a locked method using the same signature style, with `@Lock(PESSIMISTIC_WRITE)` and a query if derived locking is insufficient.

### DTO records

**Apply to:** all `missions/dto/*.java`, `wallet/dto/WalletResponse.java`
**Analog:** `backend/src/main/java/br/com/habitinhos/children/dto/ChildRequest.java`, `ChildResponse.java`

**Request validation pattern** (`ChildRequest.java` lines 1-20):
```java
package br.com.habitinhos.children.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChildRequest(
    @NotBlank(message = "Nome é obrigatório.")
    @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres.")
    String name,

    @Min(value = 0, message = "Idade não pode ser negativa.")
    Integer age,

    @Size(max = 80, message = "Avatar deve ter no máximo 80 caracteres.")
    String avatarKey,

    @Size(min = 4, max = 20, message = "PIN deve ter entre 4 e 20 caracteres.")
    String accessPin) {
}
```

**Response record pattern** (`ChildResponse.java` lines 1-14):
```java
package br.com.habitinhos.children.dto;

import java.time.Instant;
import java.util.UUID;

public record ChildResponse(
    UUID id,
    String name,
    Integer age,
    String avatarKey,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {
}
```

### Wallet credit and ledger service

**Apply to:** modified `WalletService.java`, `CoinTransaction.java`, `CoinTransactionRepository.java`
**Analog:** current `WalletService.java`, `ChildService.java`

**Existing wallet creation pattern** (`WalletService.java` lines 1-22):
```java
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
```

**Service-to-service atomic creation pattern** (`ChildService.java` lines 32-45):
```java
@Transactional
public ChildResponse create(CurrentUser currentUser, ChildRequest request) {
  requireResponsible(currentUser);
  UUID familyUnitId = currentUser.familyUnitId();
  ChildProfile child = new ChildProfile(
      familyUnitId,
      request.name().trim(),
      request.age(),
      normalizeOptional(request.avatarKey()),
      hashOptionalPin(request.accessPin()));

  childProfileRepository.saveAndFlush(child);
  walletService.createForChild(familyUnitId, child.getId());
  return toResponse(child);
}
```

Use this shape for `creditForMission(...)`: one `@Transactional` method, load wallet by `childId + familyUnitId` with a pessimistic lock, update `balance`, persist `CoinTransaction`, and return a response/entity. Do not update balances from mission services directly.

### Flyway migration

**Apply to:** `V2__create_mission_coin_schema.sql`
**Analog:** `backend/src/main/resources/db/migration/V1__create_foundation_schema.sql`

**Table/check/fk pattern** (lines 21-40):
```sql
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  name VARCHAR(160) NOT NULL,
  age INTEGER CHECK (age IS NULL OR age >= 0),
  avatar_key VARCHAR(80),
  access_pin_hash VARCHAR(255),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  family_unit_id UUID NOT NULL REFERENCES family_units(id),
  child_id UUID NOT NULL UNIQUE REFERENCES child_profiles(id),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

**Index pattern** (lines 42-45):
```sql
CREATE INDEX idx_app_users_family_unit_id ON app_users(family_unit_id);
CREATE INDEX idx_child_profiles_family_unit_id ON child_profiles(family_unit_id);
CREATE INDEX idx_wallets_family_unit_id ON wallets(family_unit_id);
CREATE INDEX idx_wallets_child_id ON wallets(child_id);
```

### Integration tests

**Apply to:** all Phase 2 integration tests
**Analog:** `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java`, `TenantIsolationIntegrationTest.java`, `AuthIntegrationTest.java`, `AbstractIntegrationTest.java`

**Test base and database cleanup pattern** (`AbstractIntegrationTest.java` lines 11-37):
```java
@SpringBootTest
@AutoConfigureMockMvc
public abstract class AbstractIntegrationTest {

  @ServiceConnection
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine");

  static {
    POSTGRES.start();
  }

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @BeforeEach
  void cleanDatabase() {
    jdbcTemplate.execute(
        """
        DO $$
        BEGIN
          IF to_regclass('public.family_units') IS NOT NULL THEN
            TRUNCATE TABLE wallets, child_profiles, app_users, family_units RESTART IDENTITY CASCADE;
          END IF;
        END $$;
        """);
  }
}
```

Update the truncate list in dependency order for Phase 2 tables: `coin_transactions`, `assigned_missions`, `missions`, `wallets`, `child_profiles`, `app_users`, `family_units`.

**MockMvc + repository assertions pattern** (`ChildIntegrationTest.java` lines 47-79):
```java
@Test
void createChildWithoutEmailCreatesZeroBalanceWalletForAuthenticatedFamily() throws Exception {
  String token = registerToken("responsavel@example.com");

  String response = mockMvc.perform(post("/children")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(new ChildRequest(
              "Lia",
              8,
              "star",
              null))))
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.name").value("Lia"))
      .andExpect(jsonPath("$.avatarKey").value("star"))
      .andExpect(jsonPath("$.active").value(true))
      .andExpect(jsonPath("$.email").doesNotExist())
      .andExpect(jsonPath("$.familyUnitId").doesNotExist())
      .andExpect(jsonPath("$.accessPinHash").doesNotExist())
      .andReturn()
      .getResponse()
      .getContentAsString();

  UUID childId = UUID.fromString(objectMapper.readTree(response).get("id").asText());
  ChildProfile child = childProfileRepository.findById(childId).orElseThrow();
  AppUser user = appUserRepository.findByEmailIgnoreCase("responsavel@example.com").orElseThrow();
  Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, user.getFamilyUnitId())
      .orElseThrow();

  assertThat(child.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
  assertThat(wallet.getBalance()).isZero();
  assertThat(wallet.getFamilyUnitId()).isEqualTo(user.getFamilyUnitId());
  assertThat(walletRepository.findAll()).hasSize(1);
}
```

**Tenant isolation test pattern** (`TenantIsolationIntegrationTest.java` lines 29-65):
```java
@Test
void secondFamilyCannotSeeReadUpdateOrDeactivateFirstFamilyChild() throws Exception {
  String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
  String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
  UUID familyAChildId = createChild(familyAToken, new ChildRequest("Lia", 8, "star", null));

  mockMvc.perform(get("/children")
          .header("Authorization", "Bearer " + familyBToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$").isEmpty());

  mockMvc.perform(get("/children/{id}", familyAChildId)
          .header("Authorization", "Bearer " + familyBToken))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));
```

**Helper method pattern** (`ChildIntegrationTest.java` lines 142-168):
```java
private String registerToken(String email) throws Exception {
  String response = mockMvc.perform(post("/auth/register")
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(new RegisterRequest(
              "Responsavel Demo",
              email,
              "senha123",
              "Familia Demo"))))
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
  return objectMapper.readTree(response).get("token").asText();
}

private UUID createChild(String token, ChildRequest request) throws Exception {
  String response = mockMvc.perform(post("/children")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(request)))
      .andExpect(status().isCreated())
      .andReturn()
      .getResponse()
      .getContentAsString();
  JsonNode json = objectMapper.readTree(response);
  return UUID.fromString(json.get("id").asText());
}
```

## Shared Patterns

### Current User and Tenant Context

**Source:** `backend/src/main/java/br/com/habitinhos/auth/CurrentUser.java`, `CurrentUserProvider.java`
**Apply to:** all controllers/services that read or mutate family-scoped Phase 2 data

`CurrentUser.java` lines 5-9:
```java
public record CurrentUser(
    UUID userId,
    UUID familyUnitId,
    UserRole role,
    String email) {
}
```

`CurrentUserProvider.java` lines 23-34:
```java
public CurrentUser getCurrentUser() {
  Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
  if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
    throw new UnauthorizedException("UNAUTHORIZED", "Autenticação necessária.");
  }

  return new CurrentUser(
      UUID.fromString(jwt.getClaimAsString("user_id")),
      UUID.fromString(jwt.getClaimAsString("family_unit_id")),
      UserRole.valueOf(jwt.getClaimAsString("role")),
      jwt.getClaimAsString("email"));
}
```

### Error Handling

**Source:** `backend/src/main/java/br/com/habitinhos/shared/error/*`
**Apply to:** all services and controllers

`ApiException.java` lines 5-22:
```java
public class ApiException extends RuntimeException {

  private final String code;
  private final HttpStatus status;

  public ApiException(HttpStatus status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }
```

`GlobalExceptionHandler.java` lines 16-30:
```java
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
```

Use stable English codes and PT-BR user-facing messages, e.g. `MISSION_NOT_FOUND`, `ASSIGNED_MISSION_NOT_FOUND`, `MISSION_DUPLICATE_ASSIGNMENT`, `INVALID_MISSION_STATUS`, `WALLET_NOT_FOUND`.

### OpenAPI

**Source:** `backend/src/main/java/br/com/habitinhos/config/OpenApiConfig.java`
**Apply to:** new public controllers and `OpenApiIntegrationTest`

Lines 16-30:
```java
@Bean
OpenAPI openAPI() {
  return new OpenAPI()
      .info(new Info()
          .title("Habitinhos API")
          .version("0.1.0")
          .description("Backend API do MVP Habitinhos."))
      .components(new Components().addSecuritySchemes(
          BEARER_AUTH,
          new SecurityScheme()
              .name(BEARER_AUTH)
              .type(SecurityScheme.Type.HTTP)
              .scheme("bearer")
              .bearerFormat("JWT")))
      .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
}
```

### Mission Workflow Defaults

**Source:** `02-CONTEXT.md`, `02-RESEARCH.md`, `docs/api-contract.md`
**Apply to:** `AssignedMissionService`, assignment repository queries, transactional tests

Planner should implement:
- `Mission` as reusable family-scoped template with `active` soft deactivation.
- `AssignedMission` as snapshot row with `snapshotTitle`, `snapshotDescription`, `snapshotCoinValue`, `snapshotRequiresApproval`.
- Status transitions: `PENDING -> COMPLETED`, `PENDING -> AWAITING_APPROVAL`, `AWAITING_APPROVAL -> COMPLETED`, `AWAITING_APPROVAL -> REJECTED`.
- Duplicate active assignment guard for same `missionId + childId` while open.
- Wallet credits only inside wallet service and only after valid no-approval completion or approval.

## No Analog Found

All required files have at least a role-match analog. The only missing exact analog is repository-level pessimistic locking for wallet mutation; planner should add it to `WalletRepository` using Spring Data JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` while preserving current repository style.

## Metadata

**Analog search scope:** `backend/src/main/java/br/com/habitinhos/auth`, `children`, `wallet`, `shared`, `config`, `backend/src/test/java/br/com/habitinhos`, `backend/src/main/resources/db/migration`
**Files scanned:** 33
**Pattern extraction date:** 2026-05-29
