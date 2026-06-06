# Phase 06: Fluxo do responsável - Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 43
**Analogs found:** 43 / 43

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `mobile/src/navigation/routes.ts` | route | request-response | `mobile/src/navigation/routes.ts` | exact-modify |
| `mobile/src/navigation/RootNavigator.tsx` | route | event-driven | `mobile/src/navigation/RootNavigator.tsx` | exact-modify |
| `mobile/src/features/family/FamilyHubScreen.tsx` | component | event-driven | `mobile/src/features/family/FamilyHubScreen.tsx` | exact-modify |
| `mobile/src/features/family/ResponsibleStubScreen.tsx` | component | event-driven | `mobile/src/features/family/ResponsibleStubScreen.tsx` | exact-replace |
| `mobile/src/api/types.ts` | model | transform | `mobile/src/api/types.ts` | exact-modify |
| `mobile/src/features/responsible/responsibleService.ts` | service | request-response | `mobile/src/features/child/childService.ts` | exact |
| `mobile/src/features/responsible/responsibleTypes.ts` | model | transform | `mobile/src/api/types.ts` | role-match |
| `mobile/src/features/responsible/ResponsibleTabsScreen.tsx` | component | event-driven | `mobile/src/features/child/ChildTabsScreen.tsx` | exact |
| `mobile/src/features/responsible/ResponsibleHomeScreen.tsx` | component | request-response | `mobile/src/features/child/ChildHomeScreen.tsx` | exact |
| `mobile/src/features/responsible/ResponsibleChildDetailScreen.tsx` | component | request-response | `mobile/src/features/child/ChildMissionDetailScreen.tsx` | role-match |
| `mobile/src/features/responsible/ResponsibleChildrenScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildProfileSelectScreen.tsx` | role-match |
| `mobile/src/features/responsible/ResponsibleChildFormScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildRewardsScreen.tsx` | flow-match |
| `mobile/src/features/responsible/ResponsibleMissionsScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildMissionsScreen.tsx` | exact |
| `mobile/src/features/responsible/ResponsibleMissionFormScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildMissionsScreen.tsx` | flow-match |
| `mobile/src/features/responsible/ResponsibleAssignmentFormScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildMissionsScreen.tsx` | flow-match |
| `mobile/src/features/responsible/ResponsibleApprovalsScreen.tsx` | component | request-response | `mobile/src/features/child/ChildMissionsScreen.tsx` | exact |
| `mobile/src/features/responsible/ResponsibleRewardsScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildRewardsScreen.tsx` | exact |
| `mobile/src/features/responsible/ResponsibleRewardFormScreen.tsx` | component | CRUD | `mobile/src/features/child/ChildRewardsScreen.tsx` | flow-match |
| `mobile/src/features/responsible/ResponsibleProfileScreen.tsx` | component | event-driven | `mobile/src/features/child/ChildTabsScreen.tsx` | exact |
| `mobile/src/features/responsible/components/MetricSummaryCard.tsx` | component | transform | `mobile/src/components/Card.tsx` | role-match |
| `mobile/src/features/responsible/components/ChildSummaryCard.tsx` | component | transform | `mobile/src/features/child/ChildHomeScreen.tsx` | role-match |
| `mobile/src/features/responsible/components/ApprovalCard.tsx` | component | event-driven | `mobile/src/features/child/components/MissionCard.tsx` | role-match |
| `mobile/src/features/responsible/components/ManageListItem.tsx` | component | event-driven | `mobile/src/features/child/components/RewardCard.tsx` | role-match |
| `mobile/src/features/responsible/components/ResponsibleFormSection.tsx` | component | transform | `mobile/src/components/Card.tsx` | role-match |
| `mobile/src/features/responsible/components/EmojiPicker.tsx` | component | event-driven | `mobile/src/features/child/components/BottomTabBar.tsx` | flow-match |
| `mobile/src/features/responsible/components/CoinValueControl.tsx` | component | event-driven | `mobile/src/components/CoinBadge.tsx` | role-match |
| `mobile/src/features/responsible/components/ChildPicker.tsx` | component | event-driven | `mobile/src/features/child/components/BottomTabBar.tsx` | flow-match |
| `mobile/src/features/responsible/components/ConfirmActionSheet.tsx` | component | event-driven | `mobile/src/features/child/ChildRewardsScreen.tsx` | flow-match |
| `mobile/src/features/responsible/components/EmptyState.tsx` | component | transform | `mobile/src/features/child/components/EmptyState.tsx` | exact |
| `mobile/src/features/responsible/components/FeedbackBanner.tsx` | component | transform | `mobile/src/features/child/components/FeedbackBanner.tsx` | exact |
| `mobile/src/features/responsible/__tests__/responsible-service.test.ts` | test | request-response | `mobile/src/features/child/__tests__/child-service.test.ts` | exact |
| `mobile/src/features/responsible/__tests__/responsible-navigation.test.tsx` | test | event-driven | `mobile/src/features/family/__tests__/family-navigation.test.tsx` | exact |
| `mobile/src/features/responsible/__tests__/responsible-dashboard.test.tsx` | test | request-response | `mobile/src/features/child/__tests__/child-missions.test.tsx` | role-match |
| `mobile/src/features/responsible/__tests__/responsible-children.test.tsx` | test | CRUD | `mobile/src/features/child/__tests__/child-missions.test.tsx` | flow-match |
| `mobile/src/features/responsible/__tests__/responsible-missions.test.tsx` | test | CRUD | `mobile/src/features/child/__tests__/child-missions.test.tsx` | exact |
| `mobile/src/features/responsible/__tests__/responsible-approvals.test.tsx` | test | request-response | `mobile/src/features/child/__tests__/child-missions.test.tsx` | exact |
| `mobile/src/features/responsible/__tests__/responsible-rewards.test.tsx` | test | CRUD | `mobile/src/features/child/__tests__/child-rewards.test.tsx` | exact |
| `backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardController.java` | controller | request-response | `backend/src/main/java/br/com/habitinhos/children/ChildController.java` | exact |
| `backend/src/main/java/br/com/habitinhos/dashboard/ResponsibleDashboardService.java` | service | CRUD | `backend/src/main/java/br/com/habitinhos/children/ChildService.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/dashboard/dto/ResponsibleDashboardResponse.java` | model | transform | `backend/src/main/java/br/com/habitinhos/rewards/dto/RewardResponse.java` | role-match |
| `backend/src/main/java/br/com/habitinhos/children/ChildController.java` | controller | request-response | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/children/ChildService.java` | service | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/children/ChildProfileRepository.java` | model | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/missions/MissionController.java` | controller | request-response | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/missions/MissionService.java` | service | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java` | model | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/missions/AssignedMissionRepository.java` | model | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/rewards/RewardController.java` | controller | request-response | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/rewards/RewardService.java` | service | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/rewards/RewardRepository.java` | model | CRUD | same file | exact-modify |
| `backend/src/main/java/br/com/habitinhos/rewards/RewardRedemptionRepository.java` | model | CRUD | same file | exact-modify |
| `backend/src/test/java/br/com/habitinhos/dashboard/ResponsibleDashboardIntegrationTest.java` | test | request-response | `backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` | exact |
| backend child/mission/reward integration tests | test | CRUD | existing same-domain integration tests | exact-modify |

## Pattern Assignments

### Mobile Navigation Files

**Apply to:** `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/features/family/FamilyHubScreen.tsx`, `ResponsibleTabsScreen.tsx`, `ResponsibleProfileScreen.tsx`

**Analogs:** `mobile/src/navigation/routes.ts`, `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/features/child/ChildTabsScreen.tsx`, `mobile/src/features/family/FamilyHubScreen.tsx`

**Route typing pattern** (`mobile/src/navigation/routes.ts` lines 1-10):
```typescript
import { AssignedMissionResponse, ChildResponse } from '../api/types';

export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleStub: undefined;
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
```

Copy this shape by adding `ResponsibleTabs`, detail routes, form routes, approvals, assignment, and reward routes with explicit params. Keep screen names in English; visible labels stay PT-BR.

**Authenticated stack pattern** (`mobile/src/navigation/RootNavigator.tsx` lines 24-38):
```typescript
return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && status === 'authenticated' ? (
        <>
          <Stack.Screen component={FamilyHubScreen} name="FamilyHub" />
          <Stack.Screen component={ResponsibleStubScreen} name="ResponsibleStub" />
          <Stack.Screen component={ChildProfileSelectScreen} name="ChildProfileSelect" />
          <Stack.Screen component={ChildTabsScreen} name="ChildTabs" />
          <Stack.Screen component={ChildMissionDetailScreen} name="ChildMissionDetail" />
        </>
      ) : (
        <Stack.Screen component={LoginScreen} name="Auth" />
      )}
    </Stack.Navigator>
  </NavigationContainer>
);
```

Replace `ResponsibleStub` with `ResponsibleTabs` and stack screens above tabs. Do not create a second login/session boundary for responsible mode.

**Tab navigator pattern** (`mobile/src/features/child/ChildTabsScreen.tsx` lines 24-69):
```typescript
const Tab = createBottomTabNavigator<ChildTabParamList>();

export function ChildTabsScreen({ navigation, route }: Props) {
  const { child } = route.params;
  const { logout, session } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="ChildHome"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="ChildHome" options={{ title: 'Início' }}>
        {({ navigation: tabNavigation }) => (
          <ChildHomeScreen
            child={child}
            onOpenMissions={() => tabNavigation.navigate('ChildMissions')}
          />
        )}
      </Tab.Screen>
```

Responsible tabs should copy the custom `tabBar`, render callback style, and stack navigation for detail/form routes.

**Mode-entry pattern** (`mobile/src/features/family/FamilyHubScreen.tsx` lines 24-36):
```typescript
<RoleCard
  description="Acompanhe missões, crianças e recompensas quando a área estiver pronta."
  emoji="🧭"
  label="Sou responsável"
  onPress={() => navigation.navigate('ResponsibleStub')}
/>
<RoleCard
  description="Escolha um perfil para brincar com as missões da família."
  emoji="⭐"
  label="Sou criança"
  onPress={() => navigation.navigate('ChildProfileSelect')}
/>
```

Change the responsible action to `ResponsibleTabs`. Keep `FamilyHub` available from the responsible profile.

---

### Mobile API Types and Responsible Service

**Apply to:** `mobile/src/api/types.ts`, `mobile/src/features/responsible/responsibleService.ts`, `mobile/src/features/responsible/responsibleTypes.ts`

**Analogs:** `mobile/src/api/types.ts`, `mobile/src/api/client.ts`, `mobile/src/features/child/childService.ts`

**DTO type pattern** (`mobile/src/api/types.ts` lines 32-72):
```typescript
export type ChildResponse = {
  id: string;
  name: string;
  age: number;
  avatarKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssignedMissionStatus =
  | 'PENDING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';
```

Add responsible dashboard and request/response types here when they mirror backend DTOs. Keep UI-only derived helpers in `responsibleTypes.ts`.

**Service wrapper pattern** (`mobile/src/features/child/childService.ts` lines 1-50):
```typescript
import { apiRequest } from '../../api/client';
import {
  AssignedMissionResponse,
  ChildResponse,
  RewardRedemptionResponse,
  RewardResponse,
  WalletResponse,
} from '../../api/types';

export const childService = {
  async listChildren(token: string): Promise<ChildResponse[]> {
    return apiRequest<ChildResponse[]>('/children', { token });
  },

  async completeMission(token: string, assignedMissionId: string): Promise<AssignedMissionResponse> {
    return apiRequest<AssignedMissionResponse>(
      `/assigned-missions/${assignedMissionId}/complete`,
      {
        method: 'POST',
        token,
      },
    );
  },
};
```

Responsible service should be a plain object of small token-aware calls. Use `apiRequest`; do not call `fetch` directly from screens.

**No client family authorization guard** (`mobile/src/api/client.ts` lines 25-32 and 106-113):
```typescript
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  assertNoClientFamilyAuthorization(path, options.body);

  try {
    const response = await fetch(buildApiUrl(path), {
      method: options.method ?? 'GET',
      headers: buildHeaders(options),
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
```

```typescript
function assertNoClientFamilyAuthorization(path: string, body: unknown): void {
  if (path.includes('familyUnitId') || containsFamilyUnitId(body)) {
    throw new ApiError({
      message: 'Client-side familyUnitId authorization is not allowed',
      userMessage: GENERIC_ERROR_MESSAGE,
      code: 'CLIENT_FAMILY_CONTEXT_REJECTED',
    });
  }
}
```

Every responsible service test must assert calls include `Authorization: Bearer ...` and do not include `familyUnitId`.

---

### Mobile Dashboard, Detail, and List Screens

**Apply to:** `ResponsibleHomeScreen.tsx`, `ResponsibleChildDetailScreen.tsx`, `ResponsibleChildrenScreen.tsx`, `ResponsibleMissionsScreen.tsx`, `ResponsibleRewardsScreen.tsx`

**Analogs:** `mobile/src/features/child/ChildHomeScreen.tsx`, `mobile/src/features/child/ChildMissionsScreen.tsx`, `mobile/src/features/child/ChildRewardsScreen.tsx`

**Load/refetch state pattern** (`mobile/src/features/child/ChildHomeScreen.tsx` lines 18-58):
```typescript
type LoadState = 'loading' | 'ready' | 'error';

export function ChildHomeScreen({ child, onOpenMissions }: ChildHomeScreenProps) {
  const { session } = useAuth();
  const token = session?.token ?? null;
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [missions, setMissions] = useState<AssignedMissionResponse[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const loadHome = useCallback(async () => {
    if (!token) {
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    try {
      const [walletResponse, missionsResponse] = await Promise.all([
        childService.getWallet(token, child.id),
        childService.listPendingMissions(token, child.id),
      ]);

      setWallet(walletResponse);
      setMissions(missionsResponse);
      setLoadState('ready');
    } catch {
      setWallet(null);
      setMissions([]);
      setLoadState('error');
    }
  }, [child.id, token]);
```

Use the same screen-owned `LoadState`, token guard, and localized retry UI. For dashboard aggregates, prefer one `getResponsibleDashboard` call; if composing sections, show localized partial errors rather than fake zeros.

**Screen shell and state rendering pattern** (`mobile/src/features/child/ChildHomeScreen.tsx` lines 60-81):
```typescript
return (
  <AppScreen>
    <AppHeader
      emoji={getAvatarEmoji(child.avatarKey)}
      greeting="Você está indo muito bem!"
      title={`Oi, ${child.name}!`}
    />

    {loadState === 'loading' ? (
      <Card style={styles.stateCard} variant="highlight">
        <ActivityIndicator color={colors.primaryDark} />
        <Text style={styles.stateTitle}>Carregando seu tesouro...</Text>
      </Card>
    ) : null}

    {loadState === 'error' ? (
      <Card style={styles.stateCard}>
        <Text style={styles.stateEmoji}>🛟</Text>
        <Text style={styles.stateTitle}>Não conseguimos carregar agora. Tente novamente.</Text>
        <SecondaryButton label="Tentar novamente" onPress={loadHome} />
      </Card>
    ) : null}
```

Responsible screens should reuse `AppScreen`, `AppHeader`, `Card`, buttons, `CoinBadge`, `StatusBadge`, and PT-BR copy from `06-UI-SPEC.md`.

**Mutation feedback/refetch pattern** (`mobile/src/features/child/ChildMissionsScreen.tsx` lines 78-105):
```typescript
const handleComplete = async (mission: AssignedMissionResponse) => {
  if (!token || completingMissionRef.current === mission.id) {
    return;
  }

  completingMissionRef.current = mission.id;
  setCompletingMissionId(mission.id);
  setFeedback(null);

  try {
    const completedMission = await childService.completeMission(token, mission.id);
    const refreshed = await loadMissions(false);

    if (completedMission.status === 'AWAITING_APPROVAL') {
      setFeedback({ type: 'awaiting-approval' });
    } else if (completedMission.status === 'COMPLETED') {
      setFeedback({
        type: 'completed',
        coins: completedMission.snapshotCoinValue,
        balance: refreshed?.wallet.balance ?? wallet?.balance ?? 0,
      });
    }
  } catch (error) {
    setFeedback({ type: 'error', message: getMissionErrorMessage(error) });
  } finally {
    completingMissionRef.current = null;
    setCompletingMissionId(null);
  }
};
```

Copy this for approve/reject/deactivate/save flows: block duplicate submit with a ref, set the submitting id, perform mutation, refetch affected dashboard/list/wallet data, then show `FeedbackBanner`.

**Reward confirmation pattern** (`mobile/src/features/child/ChildRewardsScreen.tsx` lines 78-109):
```typescript
const confirmRedemption = async () => {
  if (!token || !selectedReward || redeemingRewardRef.current === selectedReward.id) {
    return;
  }

  redeemingRewardRef.current = selectedReward.id;
  setRedeemingRewardId(selectedReward.id);
  setFeedback(null);

  try {
    await childService.redeemReward(token, selectedReward.id, child.id);
    await loadRewards(false);
    setSelectedReward(null);
    setFeedback({ type: 'success' });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'INSUFFICIENT_BALANCE') {
      setSelectedReward(null);
      setFeedback({ type: 'insufficient' });
```

Use this shape for destructive confirmations and reward/child/mission deactivation. Keep the item visible on error.

---

### Mobile Responsible Domain Components

**Apply to:** `MetricSummaryCard.tsx`, `ChildSummaryCard.tsx`, `ApprovalCard.tsx`, `ManageListItem.tsx`, `ResponsibleFormSection.tsx`, `EmojiPicker.tsx`, `CoinValueControl.tsx`, `ChildPicker.tsx`, `ConfirmActionSheet.tsx`, `EmptyState.tsx`, `FeedbackBanner.tsx`

**Analogs:** `BottomTabBar.tsx`, `EmptyState.tsx`, `FeedbackBanner.tsx`, `ChildHomeScreen.tsx`, `ChildRewardsScreen.tsx`

**Pressable/accessibility pattern** (`mobile/src/features/child/components/BottomTabBar.tsx` lines 38-50):
```typescript
<Pressable
  accessibilityLabel={`Abrir ${label}`}
  accessibilityRole="button"
  key={route.key}
  onPress={onPress}
  style={[styles.item, isFocused && styles.itemActive]}
>
  <Text style={styles.emoji}>{copy?.emoji ?? '⭐'}</Text>
  <Text numberOfLines={1} style={[styles.label, isFocused && styles.labelActive]}>
    {label}
  </Text>
</Pressable>
```

Copy this for pickers and list items: explicit `accessibilityRole`, action-oriented `accessibilityLabel`, stable dimensions, selected state styles.

**Empty state pattern** (`mobile/src/features/child/components/EmptyState.tsx` lines 6-19):
```typescript
type EmptyStateProps = {
  emoji: string;
  title: string;
  body: string;
};

export function EmptyState({ body, emoji, title }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Card>
  );
}
```

Either generalize/export the child component or duplicate this minimal shape under responsible. Add optional action only if required by a screen contract.

**Feedback banner pattern** (`mobile/src/features/child/components/FeedbackBanner.tsx` lines 39-65):
```typescript
export function FeedbackBanner({ message, statusLabel, title, variant }: FeedbackBannerProps) {
  const selectedPalette = palette[variant];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: selectedPalette.backgroundColor,
          borderColor: selectedPalette.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{selectedPalette.emoji}</Text>
        <Text style={[styles.title, { color: selectedPalette.textColor }]}>{title}</Text>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {statusLabel ? (
        <StatusBadge
          emoji={selectedPalette.emoji}
          label={statusLabel}
          variant={selectedPalette.badgeVariant}
        />
      ) : null}
    </View>
  );
}
```

Use for approvals, create/edit/deactivate success, partial mission assignment warning, and recoverable errors.

---

### Backend Dashboard Controller and Service

**Apply to:** `ResponsibleDashboardController.java`, `ResponsibleDashboardService.java`, `ResponsibleDashboardResponse.java`

**Analogs:** `ChildController.java`, `ChildService.java`, `WalletService.java`, repository interfaces

**Controller auth/logging pattern** (`backend/src/main/java/br/com/habitinhos/children/ChildController.java` lines 22-49):
```java
@RestController
@RequestMapping("/children")
public class ChildController {

  private static final Logger log = LoggerFactory.getLogger(ChildController.class);

  private final ChildService childService;
  private final CurrentUserProvider currentUserProvider;

  public ChildController(ChildService childService, CurrentUserProvider currentUserProvider) {
    this.childService = childService;
    this.currentUserProvider = currentUserProvider;
  }

  @GetMapping
  public List<ChildResponse> list() {
    var currentUser = currentUserProvider.getCurrentUser();
    log.debug("List children request: familyUnitId={}", currentUser.familyUnitId());
    return childService.list(currentUser);
  }
}
```

Create `@RestController @RequestMapping("/dashboard")`; `GET /responsible` obtains `currentUser` and delegates. Do not accept `familyUnitId`.

**Service authorization/scoping pattern** (`backend/src/main/java/br/com/habitinhos/children/ChildService.java` lines 53-70 and 103-107):
```java
@Transactional(readOnly = true)
public List<ChildResponse> list(CurrentUser currentUser) {
  requireResponsible(currentUser);
  List<ChildResponse> children = childProfileRepository
      .findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId())
      .stream()
      .map(this::toResponse)
      .toList();
  log.debug("Children listed: familyUnitId={} count={}", currentUser.familyUnitId(), children.size());
  return children;
}
```

```java
private void requireResponsible(CurrentUser currentUser) {
  if (currentUser.role() != UserRole.RESPONSIBLE) {
    log.warn("Access denied: non-responsible role={} familyUnitId={}", currentUser.role(), currentUser.familyUnitId());
    throw new ForbiddenException("RESPONSIBLE_REQUIRED", "Apenas responsáveis podem realizar esta ação.");
  }
}
```

Dashboard service must call `requireResponsible`, use `currentUser.familyUnitId()` for every repository query, and be `@Transactional(readOnly = true)`.

**Wallet/recent-activity source pattern** (`backend/src/main/java/br/com/habitinhos/wallet/WalletService.java` lines 144-170):
```java
@Transactional(readOnly = true)
public WalletResponse getWallet(CurrentUser currentUser, UUID childId) {
  childProfileRepository.findByIdAndFamilyUnitId(childId, currentUser.familyUnitId())
      .orElseThrow(() -> new NotFoundException("CHILD_NOT_FOUND", "Criança não encontrada."));

  Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(childId, currentUser.familyUnitId())
      .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
  log.debug("Wallet resolved: familyUnitId={} childId={} walletId={}", currentUser.familyUnitId(), childId, wallet.getId());
  return new WalletResponse(
      wallet.getChildId(),
      wallet.getBalance(),
      wallet.getCreatedAt(),
      wallet.getUpdatedAt());
}
```

Dashboard balance and recent redemption summaries should come from wallet/redemption repositories, not mobile-side math.

---

### Backend Inactive List Support

**Apply to:** `ChildController.java`, `ChildService.java`, `ChildProfileRepository.java`, `MissionController.java`, `MissionService.java`, `MissionRepository.java`, `RewardController.java`, `RewardService.java`, `RewardRepository.java`

**Analogs:** same files

**Active-only default pattern** (`backend/src/main/java/br/com/habitinhos/missions/MissionService.java` lines 42-50):
```java
@Transactional(readOnly = true)
public List<MissionResponse> list(CurrentUser currentUser) {
  requireResponsible(currentUser);
  List<MissionResponse> missions = missionRepository.findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(currentUser.familyUnitId())
      .stream()
      .map(this::toResponse)
      .toList();
  log.debug("Missions listed: familyUnitId={} count={}", currentUser.familyUnitId(), missions.size());
  return missions;
}
```

Extend by adding `includeInactive=false` query handling, preserving current default. Suggested implementation pattern:

```java
@GetMapping
public List<MissionResponse> list(@RequestParam(defaultValue = "false") boolean includeInactive) {
  var currentUser = currentUserProvider.getCurrentUser();
  log.debug("List missions request: familyUnitId={} includeInactive={}", currentUser.familyUnitId(), includeInactive);
  return missionService.list(currentUser, includeInactive);
}
```

**Repository naming pattern** (`backend/src/main/java/br/com/habitinhos/missions/MissionRepository.java` lines 8-14):
```java
public interface MissionRepository extends JpaRepository<Mission, UUID> {

  List<Mission> findAllByFamilyUnitIdAndActiveTrueOrderByCreatedAtAsc(UUID familyUnitId);

  Optional<Mission> findByIdAndFamilyUnitId(UUID id, UUID familyUnitId);

  Optional<Mission> findByIdAndFamilyUnitIdAndActiveTrue(UUID id, UUID familyUnitId);
}
```

Add `findAllByFamilyUnitIdOrderByCreatedAtAsc(UUID familyUnitId)` for management lists. Repeat for children and rewards. Do not change update/deactivate lookups; they should keep active-only mutation guards.

---

### Backend Mission Assignment and Approvals

**Apply to:** `MissionController.java`, `AssignedMissionController.java`, `AssignedMissionService.java`, `AssignedMissionRepository.java`, dashboard approval counts

**Analogs:** mission assignment and approval services/controllers

**Assignment endpoint pattern** (`backend/src/main/java/br/com/habitinhos/missions/MissionController.java` lines 79-95):
```java
@PostMapping("/{id}/assign")
@ResponseStatus(HttpStatus.CREATED)
public List<AssignedMissionResponse> assign(
    @PathVariable UUID id,
    @Valid @RequestBody AssignMissionRequest request) {
  var currentUser = currentUserProvider.getCurrentUser();
  log.info(
      "Assign mission request: familyUnitId={} missionId={} childCount={}",
      currentUser.familyUnitId(),
      id,
      request.childIds().size());
  return assignedMissionService.assign(
      currentUser,
      id,
      request.childIds(),
      request.dueDate());
}
```

Mobile create-then-assign must call `POST /missions` first, then this endpoint. If assignment fails, keep mission success and show retry.

**Assignment service pattern** (`backend/src/main/java/br/com/habitinhos/missions/AssignedMissionService.java` lines 48-81):
```java
requireResponsible(currentUser);
UUID familyUnitId = currentUser.familyUnitId();
Mission mission = missionRepository.findByIdAndFamilyUnitIdAndActiveTrue(missionId, familyUnitId)
    .orElseThrow(this::missionNotFound);

List<AssignedMissionStatus> openStatuses =
    List.of(AssignedMissionStatus.PENDING, AssignedMissionStatus.AWAITING_APPROVAL);
List<AssignedMission> assignments = new ArrayList<>();

for (UUID childId : childIds) {
  ChildProfile child = childProfileRepository.findByIdAndFamilyUnitIdAndActiveTrue(childId, familyUnitId)
      .orElseThrow(this::childNotFound);

  boolean hasOpenAssignment = assignedMissionRepository.existsByMissionIdAndChildIdAndStatusIn(
      missionId, child.getId(), openStatuses);
  if (hasOpenAssignment) {
    throw new ConflictException(
        "MISSION_DUPLICATE_ASSIGNMENT",
        "Missão já atribuída para esta criança.");
  }

  assignments.add(new AssignedMission(familyUnitId, missionId, child.getId(), dueDate, mission));
}
```

Keep assignment only to active children and active missions.

**Approval/rejection endpoint pattern** (`backend/src/main/java/br/com/habitinhos/missions/AssignedMissionController.java` lines 48-69):
```java
@GetMapping("/assigned-missions/pending-approval")
public List<AssignedMissionResponse> listPendingApproval() {
  var currentUser = currentUserProvider.getCurrentUser();
  log.debug("List pending approval assigned missions request: familyUnitId={}", currentUser.familyUnitId());
  return assignedMissionService.listPendingApproval(currentUser);
}

@PostMapping("/assigned-missions/{id}/approve")
public AssignedMissionResponse approve(@PathVariable UUID id) {
  var currentUser = currentUserProvider.getCurrentUser();
  log.info("Approve assigned mission request: familyUnitId={} assignedMissionId={}", currentUser.familyUnitId(), id);
  return assignedMissionService.approve(currentUser, id);
}
```

**Approval service pattern** (`backend/src/main/java/br/com/habitinhos/missions/AssignedMissionService.java` lines 157-178):
```java
@Transactional
public AssignedMissionResponse approve(CurrentUser currentUser, UUID assignedMissionId) {
  requireResponsible(currentUser);
  UUID familyUnitId = currentUser.familyUnitId();
  AssignedMission assignedMission = assignedMissionRepository
      .findByIdAndFamilyUnitId(assignedMissionId, familyUnitId)
      .orElseThrow(this::assignedMissionNotFound);
  requireStatus(assignedMission, AssignedMissionStatus.AWAITING_APPROVAL);

  assignedMission.approve();
  walletService.creditForMission(
      familyUnitId,
      assignedMission.getChildId(),
      assignedMission.getId(),
      assignedMission.getSnapshotCoinValue(),
      currentUser.userId());
```

Dashboard counts and approval queue should reuse `AWAITING_APPROVAL` queries, and mobile should refetch after approve/reject.

---

### Backend DTO and Error Handling

**Apply to:** new dashboard DTOs, any new/modified request DTOs

**Analogs:** existing request DTOs and global error handler

**Validation pattern** (`backend/src/main/java/br/com/habitinhos/missions/dto/MissionRequest.java` lines 9-24):
```java
public record MissionRequest(
    @NotBlank(message = "Título é obrigatório.")
    @Size(max = 160, message = "Título deve ter no máximo 160 caracteres.")
    String title,

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres.")
    String description,

    @Min(value = 1, message = "Moedas deve ser maior que zero.")
    int coinValue,

    @NotNull(message = "requiresApproval é obrigatório.")
    Boolean requiresApproval,

    @NotNull(message = "recurrenceType é obrigatório.")
    RecurrenceType recurrenceType) {
}
```

**Assignment validation pattern** (`backend/src/main/java/br/com/habitinhos/missions/dto/AssignMissionRequest.java` lines 8-11):
```java
public record AssignMissionRequest(
    @NotEmpty(message = "Informe ao menos uma criança para atribuição.")
    List<UUID> childIds,
    LocalDate dueDate) {
}
```

**Error response pattern** (`backend/src/main/java/br/com/habitinhos/shared/error/GlobalExceptionHandler.java` lines 20-40):
```java
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
```

Do not add per-controller try/catch for normal business errors. Throw `NotFoundException`, `ConflictException`, or `ForbiddenException` and let the global handler format the API response.

---

### Mobile Tests

**Apply to:** all `mobile/src/features/responsible/__tests__/*`

**Analogs:** `child-service.test.ts`, `child-missions.test.tsx`, `family-navigation.test.tsx`

**Service test pattern** (`mobile/src/features/child/__tests__/child-service.test.ts` lines 1-10 and 27-38):
```typescript
import { childService } from '../childService';

const fetchMock = jest.fn();

globalThis.fetch = fetchMock;

describe('childService', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });
```

```typescript
await expect(childService.listChildren('jwt-token')).resolves.toEqual(children);

expect(fetchMock).toHaveBeenCalledWith(
  'http://10.0.2.2:8080/children',
  expect.objectContaining({
    method: 'GET',
    headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
    body: undefined,
  }),
);
expect(JSON.stringify(fetchMock.mock.calls[0])).not.toContain('familyUnitId');
```

Responsible service tests must cover dashboard, `includeInactive`, child CRUD, mission CRUD/assign, approvals, rewards, and no `familyUnitId`.

**Component async/mutation test pattern** (`mobile/src/features/child/__tests__/child-missions.test.tsx` lines 9-19 and 82-119):
```typescript
jest.mock('../../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../childService', () => ({
  childService: {
    completeMission: jest.fn(),
    getWallet: jest.fn(),
    listPendingMissions: jest.fn(),
  },
}));
```

```typescript
fireEvent.press(completeButton);
fireEvent.press(completeButton);

expect(childService.completeMission).toHaveBeenCalledTimes(1);
expect(completeButton).toBeDisabled();
expect(otherButton).not.toBeDisabled();

await act(async () => {
  deferred.resolve(completion);
});

expect(await screen.findByText('Missão concluída! +5 moedas')).toBeOnTheScreen();
expect(screen.getByText('Saldo atualizado: 15 moedas')).toBeOnTheScreen();
expect(childService.getWallet).toHaveBeenCalledTimes(2);
expect(childService.listPendingMissions).toHaveBeenCalledTimes(2);
```

Use this for approval duplicate-submit, partial assignment failure, deactivate confirmations, and refetch assertions.

**Navigation test pattern** (`mobile/src/features/family/__tests__/family-navigation.test.tsx` lines 35-45):
```typescript
it('shows family mode choices and navigates to responsible and child flows', () => {
  render(<FamilyHubScreen navigation={navigation} route={{ key: 'FamilyHub', name: 'FamilyHub' }} />);

  fireEvent.press(screen.getByRole('button', { name: 'Sou responsável' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sou criança' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));

  expect(screen.getByText('Escolha como quer entrar')).toBeOnTheScreen();
  expect(navigate).toHaveBeenCalledWith('ResponsibleStub');
  expect(navigate).toHaveBeenCalledWith('ChildProfileSelect');
  expect(logout).toHaveBeenCalledTimes(1);
});
```

Update expected route to `ResponsibleTabs`; add tests for responsible profile returning to `FamilyHub` and logout.

---

### Backend Integration Tests

**Apply to:** `ResponsibleDashboardIntegrationTest.java`, modified child/mission/reward integration tests

**Analogs:** `AbstractIntegrationTest.java`, `ChildIntegrationTest.java`, `MissionAssignmentIntegrationTest.java`, `MissionApprovalIntegrationTest.java`

**Integration base pattern** (`backend/src/test/java/br/com/habitinhos/shared/AbstractIntegrationTest.java` lines 12-30):
```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
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
```

New backend tests should extend this base and use `MockMvc`.

**CRUD/list/deactivate test pattern** (`backend/src/test/java/br/com/habitinhos/children/ChildIntegrationTest.java` lines 82-120):
```java
@Test
void listGetUpdateAndDeactivateOwnChildren() throws Exception {
  String token = registerToken("responsavel@example.com");
  UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));

  mockMvc.perform(get("/children")
          .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].id").value(childId.toString()))
      .andExpect(jsonPath("$[0].name").value("Lia"));

  mockMvc.perform(patch("/children/{id}/deactivate", childId)
          .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.active").value(false));

  mockMvc.perform(get("/children")
          .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$").isEmpty());
}
```

Add matching tests for `GET /children?includeInactive=true`, `/missions?includeInactive=true`, and `/rewards?includeInactive=true` while preserving current active-only default.

**Assignment isolation test pattern** (`backend/src/test/java/br/com/habitinhos/missions/MissionAssignmentIntegrationTest.java` lines 78-94):
```java
@Test
void assignMissionRejectsChildFromAnotherFamilyWithSafeNotFound() throws Exception {
  String familyAToken = registerToken("responsavel.a@example.com", "Familia A");
  String familyBToken = registerToken("responsavel.b@example.com", "Familia B");
  UUID missionId = createMission(
      familyAToken,
      new MissionRequest("Levar lixo", "Retirar lixo reciclável", 4, true, RecurrenceType.DAILY));
  UUID foreignChildId = createChild(familyBToken, new ChildRequest("Theo", 6, "moon", null));

  mockMvc.perform(post("/missions/{id}/assign", missionId)
          .header("Authorization", "Bearer " + familyAToken)
          .contentType(MediaType.APPLICATION_JSON)
          .content(objectMapper.writeValueAsString(
              new AssignMissionRequest(List.of(foreignChildId), null))))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.code").value("CHILD_NOT_FOUND"));
}
```

Dashboard tests must include cross-family exclusion and no `familyUnitId` fields in responses.

**Approval/wallet test pattern** (`backend/src/test/java/br/com/habitinhos/missions/MissionApprovalIntegrationTest.java` lines 44-78):
```java
@Test
void responsibleCanListPendingApprovalAndApproveOnce() throws Exception {
  String token = registerToken("responsavel@example.com", "Familia Demo");
  UUID childId = createChild(token, new ChildRequest("Lia", 8, "star", null));
  UUID assignedMissionId = assignMission(
      token,
      childId,
      new MissionRequest("Estudar", "Ler capítulo", 6, true, RecurrenceType.ONCE));
  complete(token, assignedMissionId);

  mockMvc.perform(get("/assigned-missions/pending-approval")
          .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$[0].id").value(assignedMissionId.toString()))
      .andExpect(jsonPath("$[0].status").value("AWAITING_APPROVAL"))
      .andExpect(jsonPath("$[0].familyUnitId").doesNotExist());
```

Dashboard integration tests should assert pending approval count, child balances, mission count buckets, recent redemption snapshots, and no duplicated coin credit.

## Shared Patterns

### Mobile API and Auth

**Source:** `mobile/src/api/client.ts`
**Apply to:** all responsible service calls

Use `apiRequest(path, { token, method, body })`; the wrapper adds `Authorization`, JSON headers, PT-BR user messages, and rejects `familyUnitId`.

### Mobile Screen State

**Source:** `mobile/src/features/child/ChildMissionsScreen.tsx`
**Apply to:** all responsible screens with API data or mutations

Use local `LoadState`, `useAuth`, `useCallback` loader, `setTimeout(..., 0)` inside `useEffect`, explicit loading/error/empty/ready render branches, mutation refs to prevent duplicate submits, and refetch after success.

### Backend Tenant Isolation

**Source:** `ChildService`, `MissionService`, `AssignedMissionService`, `RewardService`, `WalletService`
**Apply to:** dashboard and inactive-list support

Every service method receives `CurrentUser`, calls `requireResponsible` where responsible-only behavior applies, and queries by `currentUser.familyUnitId()`. Cross-family IDs should return safe not-found errors.

### Backend Error Handling

**Source:** `GlobalExceptionHandler`
**Apply to:** all new backend code

Throw project exceptions; do not format error responses manually in controllers. Validation stays in DTO annotations.

### Soft Deactivation

**Source:** `ChildService.deactivate`, `MissionService.deactivate`, `RewardService.deactivate`
**Apply to:** child/mission/reward management

Update/deactivate methods use active-only lookups, call `deactivate()`, return response with `active=false`, and history stays intact. List defaults stay active-only; management visibility is opt-in.

## No Analog Found

All planned files have usable analogs. The only new architectural capability is `GET /dashboard/responsible`; it should copy controller/service/repository/test conventions from existing child/mission/reward/wallet code rather than introduce a new pattern.

## Metadata

**Analog search scope:** `mobile/src`, `backend/src/main/java`, `backend/src/test/java`, `.planning/phases/05-fluxo-da-crian-a`
**Files scanned:** 96 source/test/planning files, excluding `node_modules`
**Pattern extraction date:** 2026-06-02
