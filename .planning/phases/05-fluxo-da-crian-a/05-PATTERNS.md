# Phase 05: Fluxo da criança - Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 27
**Analogs found:** 25 / 27

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `mobile/package.json` | config | dependency update | `mobile/package.json` | exact |
| `mobile/package-lock.json` | config | dependency update | `mobile/package-lock.json` | exact |
| `mobile/src/api/types.ts` | model | transform | backend DTO records + `mobile/src/api/types.ts` | exact |
| `mobile/src/features/child/childService.ts` | service | request-response | `mobile/src/features/auth/authService.ts` + `mobile/src/api/client.ts` | role-match |
| `mobile/src/features/child/childTypes.ts` | utility | transform | `mobile/src/features/auth/authTypes.ts` | role-match |
| `mobile/src/features/child/ChildProfileSelectScreen.tsx` | component/screen | request-response | `mobile/src/features/family/FamilyHubScreen.tsx` + `AuthLoadingScreen.tsx` | role-match |
| `mobile/src/features/child/ChildTabsScreen.tsx` | route/component | event-driven navigation | `mobile/src/navigation/RootNavigator.tsx` | role-match |
| `mobile/src/features/child/ChildHomeScreen.tsx` | component/screen | request-response | `ChildStubScreen.tsx` + `LoginScreen.tsx` | role-match |
| `mobile/src/features/child/ChildMissionsScreen.tsx` | component/screen | CRUD mutation | `LoginScreen.tsx` + `PrimaryButton.tsx` | role-match |
| `mobile/src/features/child/ChildMissionDetailScreen.tsx` | component/screen | CRUD mutation | `ChildMissionsScreen` pattern + `ResponsibleStubScreen.tsx` | role-match |
| `mobile/src/features/child/ChildRewardsScreen.tsx` | component/screen | CRUD mutation | `LoginScreen.tsx` + `ApiError` pattern | role-match |
| `mobile/src/features/child/ChildProfileScreen.tsx` | component/screen | event-driven navigation | `ChildStubScreen.tsx` | exact |
| `mobile/src/features/child/components/BottomTabBar.tsx` | component | event-driven navigation | `Card.tsx` + `SecondaryButton.tsx` | partial |
| `mobile/src/features/child/components/ProgressBar.tsx` | component | transform | none | no-analog |
| `mobile/src/features/child/components/MissionCard.tsx` | component | CRUD mutation | `Card.tsx`, `CoinBadge.tsx`, `StatusBadge.tsx`, `PrimaryButton.tsx` | role-match |
| `mobile/src/features/child/components/RewardCard.tsx` | component | CRUD mutation | `Card.tsx`, `CoinBadge.tsx`, `StatusBadge.tsx`, `PrimaryButton.tsx` | role-match |
| `mobile/src/features/child/components/EmptyState.tsx` | component | request-response state | `AuthLoadingScreen.tsx` + `ChildStubScreen.tsx` | role-match |
| `mobile/src/features/child/components/FeedbackBanner.tsx` | component | request-response state | `StatusBadge.tsx` + `AuthLoadingScreen.tsx` | role-match |
| `mobile/src/navigation/RootNavigator.tsx` | route | event-driven navigation | `mobile/src/navigation/RootNavigator.tsx` | exact |
| `mobile/src/navigation/routes.ts` | route | transform | `mobile/src/navigation/routes.ts` | exact |
| `mobile/src/features/family/FamilyHubScreen.tsx` | component/screen | event-driven navigation | `FamilyHubScreen.tsx` | exact |
| `mobile/src/features/family/ChildStubScreen.tsx` | component/screen | request-response state | `ResponsibleStubScreen.tsx` | exact |
| `mobile/src/features/child/__tests__/child-service.test.ts` | test | request-response | `mobile/src/features/auth/__tests__/api-auth.test.ts` | exact |
| `mobile/src/features/child/__tests__/child-navigation.test.tsx` | test | event-driven navigation | `mobile/src/features/family/__tests__/family-navigation.test.tsx` | exact |
| `mobile/src/features/child/__tests__/child-home.test.tsx` | test | request-response | `login-screen.test.tsx` + `base-components.test.tsx` | role-match |
| `mobile/src/features/child/__tests__/child-missions.test.tsx` | test | CRUD mutation | `login-screen.test.tsx` + `api-auth.test.ts` | role-match |
| `mobile/src/features/child/__tests__/child-rewards.test.tsx` | test | CRUD mutation | `login-screen.test.tsx` + `api-auth.test.ts` | role-match |

## Pattern Assignments

### `mobile/package.json` and `mobile/package-lock.json` (config, dependency update)

**Analog:** `mobile/package.json`

**Dependency pattern** (lines 5-15):
```json
"dependencies": {
  "@react-navigation/native": "^7.2.5",
  "@react-navigation/native-stack": "^7.16.0",
  "expo": "~56.0.8",
  "react-native-safe-area-context": "~5.7.0",
  "react-native-screens": "4.25.2"
}
```

**Apply:** add `@react-navigation/bottom-tabs` using `cd mobile && npx expo install @react-navigation/bottom-tabs`. Let npm update `package-lock.json`; do not hand-edit lockfile internals.

---

### `mobile/src/api/types.ts` (model, transform)

**Analog:** existing `ApiError` plus backend DTO records.

**Current API error pattern** (lines 1-5, 32-57):
```typescript
export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  userMessage: string;
  isNetworkError: boolean;
  isSessionExpired: boolean;
}
```

**Backend DTOs to mirror:**

`backend/src/main/java/br/com/habitinhos/children/dto/ChildResponse.java` (lines 6-13):
```java
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

`backend/src/main/java/br/com/habitinhos/wallet/dto/WalletResponse.java` (lines 6-10):
```java
public record WalletResponse(
    UUID childId,
    int balance,
    Instant createdAt,
    Instant updatedAt) {
}
```

`backend/src/main/java/br/com/habitinhos/missions/dto/AssignedMissionResponse.java` (lines 8-23):
```java
public record AssignedMissionResponse(
    UUID id,
    UUID missionId,
    UUID childId,
    AssignedMissionStatus status,
    LocalDate dueDate,
    Instant completedAt,
    Instant approvedAt,
    Instant rejectedAt,
    String rejectionReason,
    String snapshotTitle,
    String snapshotDescription,
    int snapshotCoinValue,
    boolean snapshotRequiresApproval,
    Instant createdAt,
    Instant updatedAt) {
}
```

`backend/src/main/java/br/com/habitinhos/rewards/dto/RewardResponse.java` (lines 6-13) and `RewardRedemptionResponse.java` (lines 7-17):
```java
public record RewardResponse(
    UUID id,
    String title,
    String description,
    int cost,
    boolean active,
    Instant createdAt,
    Instant updatedAt) {
}

public record RewardRedemptionResponse(
    UUID id,
    UUID rewardId,
    UUID childId,
    UUID walletId,
    RewardRedemptionStatus status,
    String snapshotTitle,
    int snapshotCost,
    UUID coinTransactionId,
    Instant createdAt,
    Instant updatedAt) {
}
```

**Apply:** add `ChildResponse`, `WalletResponse`, `AssignedMissionStatus`, `AssignedMissionResponse`, `RewardResponse`, `RewardRedemptionStatus`, and `RewardRedemptionResponse` as TypeScript API DTOs. Use `string` for Java `UUID`, `Instant`, and `LocalDate`; use `number` for Java `int`.

---

### `mobile/src/features/child/childService.ts` (service, request-response)

**Analog:** `mobile/src/features/auth/authService.ts`

**Imports pattern** (lines 1-4):
```typescript
import { apiRequest } from '../../api/client';
import { AuthResponse, MeResponse } from '../../api/types';

import { AuthSession } from './authTypes';
```

**Service call pattern** (lines 11-16, 25-43):
```typescript
export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async me(token: string): Promise<AuthSession> {
    const response = await apiRequest<MeResponse>('/me', {
      token,
    });
  },
};
```

**Shared wrapper pattern** from `mobile/src/api/client.ts` (lines 25-32, 55-67):
```typescript
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  assertNoClientFamilyAuthorization(path, options.body);

  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? 'GET',
    headers: buildHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

if (options.token) {
  headers.Authorization = `Bearer ${options.token}`;
}
```

**Routes to copy exactly from backend controllers:**

`ChildController.java` (lines 44-49):
```java
@GetMapping
public List<ChildResponse> list() {
  var currentUser = currentUserProvider.getCurrentUser();
  return childService.list(currentUser);
}
```

`WalletController.java` (lines 15-33):
```java
@RestController
@RequestMapping("/children/{childId}/wallet")
public class WalletController {
  @GetMapping
  public WalletResponse getWallet(@PathVariable UUID childId) {
    var currentUser = currentUserProvider.getCurrentUser();
    return walletService.getWallet(currentUser, childId);
  }
}
```

`AssignedMissionController.java` (lines 34-45):
```java
@GetMapping("/children/{childId}/missions")
public List<AssignedMissionResponse> listPendingForChild(@PathVariable UUID childId) {
  var currentUser = currentUserProvider.getCurrentUser();
  return assignedMissionService.listPendingForChild(currentUser, childId);
}

@PostMapping("/assigned-missions/{id}/complete")
public AssignedMissionResponse complete(@PathVariable UUID id) {
  var currentUser = currentUserProvider.getCurrentUser();
  return assignedMissionService.complete(currentUser, id);
}
```

`RewardController.java` (lines 47-51, 75-86):
```java
@GetMapping
public List<RewardResponse> listActive() {
  var currentUser = currentUserProvider.getCurrentUser();
  return rewardService.listActive(currentUser);
}

@PostMapping("/{id}/redeem")
@ResponseStatus(HttpStatus.CREATED)
public RewardRedemptionResponse redeem(
    @PathVariable UUID id,
    @Valid @RequestBody RedeemRewardRequest request) {
  var currentUser = currentUserProvider.getCurrentUser();
  return rewardService.redeem(currentUser, id, request);
}
```

**Apply:** expose typed functions:

```typescript
listChildren(token)
getWallet(token, childId)
listPendingMissions(token, childId)
completeMission(token, assignedMissionId)
listRewards(token)
redeemReward(token, rewardId, childId) // POST /rewards/{id}/redeem with body { childId }
```

Never include `familyUnitId`; `apiRequest` rejects it before fetch.

---

### `mobile/src/features/child/childTypes.ts` (utility, transform)

**Analog:** `mobile/src/features/auth/authTypes.ts`

**Small feature type alias pattern** (lines 1-13):
```typescript
import { FamilySummary, UserSummary } from '../../api/types';

export type AuthUser = UserSummary;

export type AuthFamily = FamilySummary;

export type AuthSession = {
  token: string;
  user: AuthUser;
  family: AuthFamily;
};
```

**Apply:** keep this file small. Use it only for child UI helpers/view-models such as `SelectedChild`, `MissionFeedback`, `RewardAffordance`, or emoji mapping. Do not duplicate API DTOs already added to `mobile/src/api/types.ts`.

---

### `mobile/src/navigation/routes.ts` (route, transform)

**Analog:** current root route type.

**Existing route typing pattern** (lines 1-6):
```typescript
export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleStub: undefined;
  ChildStub: undefined;
};
```

**Apply:** replace `ChildStub` with child stack routes and add nested child tab route types. Child IDs and selected child data live in route params or scoped child-flow state, not in auth types.

---

### `mobile/src/navigation/RootNavigator.tsx` (route, event-driven navigation)

**Analog:** current authenticated stack.

**Imports and stack pattern** (lines 1-13):
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthLoadingScreen } from '../features/auth/AuthLoadingScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { useAuth } from '../features/auth/AuthContext';

import { RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();
```

**Authenticated route switch pattern** (lines 15-35):
```typescript
export function RootNavigator() {
  const { session, status } = useAuth();

  if (status === 'restoring' || (status === 'error' && !session)) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && status === 'authenticated' ? (
          <>
            <Stack.Screen component={FamilyHubScreen} name="FamilyHub" />
            <Stack.Screen component={ResponsibleStubScreen} name="ResponsibleStub" />
            <Stack.Screen component={ChildStubScreen} name="ChildStub" />
          </>
        ) : (
          <Stack.Screen component={LoginScreen} name="Auth" />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Apply:** keep the auth gate unchanged. Swap the child stack entry in the authenticated branch; do not add a separate child auth provider.

---

### `mobile/src/features/family/FamilyHubScreen.tsx` (component/screen, event-driven navigation)

**Analog:** current mode entry screen.

**Authenticated session and role-card pattern** (lines 11-39, 44-52):
```typescript
export function FamilyHubScreen({ navigation }: Props) {
  const { logout, session } = useAuth();
  const familyName = session?.family.name ?? 'sua família';

  return (
    <AppScreen>
      <AppHeader
        action={<SecondaryButton destructive label="Sair" onPress={logout} />}
        emoji="👨‍👩‍👧"
        subtitle={`Você está na família ${familyName}.`}
        title="Escolha como quer entrar"
      />

      <RoleCard
        description="Veja missões e recompensas da família quando a área estiver pronta."
        emoji="⭐"
        label="Sou criança"
        onPress={() => navigation.navigate('ChildStub')}
      />
    </AppScreen>
  );
}

function RoleCard({ description, emoji, label, onPress }) {
  return (
    <Card accessibilityLabel={label} onPress={onPress} variant="highlight">
      ...
    </Card>
  );
}
```

**Apply:** change the child role action to navigate to `ChildProfileSelect`/child stack entry. Preserve logout and responsible route behavior.

---

### `mobile/src/features/family/ChildStubScreen.tsx` (component/screen, replace/remove)

**Analog:** current child placeholder and `ResponsibleStubScreen.tsx`.

**Current stub shell** (lines 11-24):
```typescript
export function ChildStubScreen({ navigation }: Props) {
  const { logout } = useAuth();

  return (
    <AppScreen>
      <AppHeader action={<SecondaryButton destructive label="Sair" onPress={logout} />} emoji="⭐" title="Área da criança" />
      <Card style={styles.card}>
        <StatusBadge emoji="🌱" label="Quase pronto" variant="selected" />
        <Text style={styles.title}>Área da criança</Text>
        <Text style={styles.copy}>Logo as missões e recompensas da família aparecem aqui.</Text>
      </Card>
      <SecondaryButton label="Trocar modo" onPress={() => navigation.navigate('FamilyHub')} />
      <SecondaryButton destructive label="Sair da conta" onPress={logout} />
    </AppScreen>
  );
}
```

**Apply:** this file should either be deleted after route removal or stop being referenced. If retained temporarily, do not add fake child data to it.

---

### `mobile/src/features/child/ChildProfileSelectScreen.tsx` (component/screen, request-response)

**Analog:** `FamilyHubScreen.tsx` for selectable cards; `AuthLoadingScreen.tsx` for loading/error/retry.

**Imports pattern** from `FamilyHubScreen.tsx` (lines 1-7):
```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, AppScreen, Card, SecondaryButton } from '../../components';
import { RootStackParamList } from '../../navigation/routes';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../auth/AuthContext';
```

**Loading/error pattern** from `AuthLoadingScreen.tsx` (lines 12-26):
```typescript
return (
  <AppScreen centered scroll={false}>
    <Text style={styles.copy}>{hasError ? errorMessage : 'Preparando sua família...'}</Text>
    {hasError ? (
      <>
        <StatusBadge emoji="!" label="Conexão indisponível" variant="warning" />
        <PrimaryButton label="Tentar novamente" onPress={retryRestore} />
      </>
    ) : (
      <ActivityIndicator color={colors.primaryDark} size="large" />
    )}
  </AppScreen>
);
```

**Apply:** call `childService.listChildren(session.token)`, show only real backend children, and use `Card` pressables for selection. Empty copy must be `Nenhuma criança cadastrada` / `Peça para um responsável criar um perfil primeiro.`

---

### `mobile/src/features/child/ChildTabsScreen.tsx` (route/component, event-driven navigation)

**Analog:** `RootNavigator.tsx`; no existing tab navigator in codebase.

**Navigator pattern to copy** from `RootNavigator.tsx` (lines 23-34):
```typescript
<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {session && status === 'authenticated' ? (
      <>
        <Stack.Screen component={FamilyHubScreen} name="FamilyHub" />
        <Stack.Screen component={ResponsibleStubScreen} name="ResponsibleStub" />
        <Stack.Screen component={ChildStubScreen} name="ChildStub" />
      </>
    ) : (
      <Stack.Screen component={LoginScreen} name="Auth" />
    )}
  </Stack.Navigator>
</NavigationContainer>
```

**Apply:** use `createBottomTabNavigator` from the installed bottom-tabs package with `tabBar={(props) => <BottomTabBar {...props} />}`. Pass selected child route params into `ChildHome`, `ChildMissions`, `ChildRewards`, and `ChildProfile`.

---

### Child screens: `ChildHomeScreen.tsx`, `ChildMissionsScreen.tsx`, `ChildMissionDetailScreen.tsx`, `ChildRewardsScreen.tsx`, `ChildProfileScreen.tsx`

**Analog:** `ChildStubScreen.tsx`, `LoginScreen.tsx`, base components, and `AuthContext`.

**Screen shell pattern** from `ChildStubScreen.tsx` (lines 14-24):
```typescript
return (
  <AppScreen>
    <AppHeader action={<SecondaryButton destructive label="Sair" onPress={logout} />} emoji="⭐" title="Área da criança" />
    <Card style={styles.card}>
      <StatusBadge emoji="🌱" label="Quase pronto" variant="selected" />
      <Text style={styles.title}>Área da criança</Text>
      <Text style={styles.copy}>Logo as missões e recompensas da família aparecem aqui.</Text>
    </Card>
    <SecondaryButton label="Trocar modo" onPress={() => navigation.navigate('FamilyHub')} />
    <SecondaryButton destructive label="Sair da conta" onPress={logout} />
  </AppScreen>
);
```

**Submit/loading pattern** from `LoginScreen.tsx` (lines 13-22, 59-67):
```typescript
const isLoading = status === 'loading';

async function handleSubmit() {
  if (isLoading) {
    return;
  }

  await login(email.trim(), password);
}

{errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

<PrimaryButton
  label={isLoading ? 'Entrando...' : 'Entrar na conta'}
  loading={isLoading}
  onPress={handleSubmit}
/>

{showRetry ? <SecondaryButton label="Tentar novamente" onPress={retryRestore} /> : null}
```

**Session pattern** from `AuthContext.tsx` (lines 9-15, 86-100, 108-115):
```typescript
type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retryRestore: () => Promise<void>;
};

const logout = useCallback(async () => {
  await tokenStorage.clearToken();
  setSession(null);
  setErrorMessage(null);
  setStatus('unauthenticated');
}, []);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Apply per screen:**

- `ChildHomeScreen.tsx`: fetch wallet, pending missions, and rewards with `session.token`; show balance before pending missions; retry all reads together.
- `ChildMissionsScreen.tsx`: fetch wallet and pending missions; disable only the completing mission action while `completeMission` is in flight.
- `ChildMissionDetailScreen.tsx`: use stack route params for `assignedMissionId`; complete via backend and show returned status feedback.
- `ChildRewardsScreen.tsx`: fetch wallet and rewards; compute affordability locally for disabled/helper UI; redemption final state comes from backend response/refetch.
- `ChildProfileScreen.tsx`: copy `ChildStubScreen` logout/switch patterns, but route `Trocar criança` back to `ChildProfileSelect`; do not fake responsible PIN validation.

---

### Domain components: `MissionCard.tsx`, `RewardCard.tsx`, `EmptyState.tsx`, `FeedbackBanner.tsx`

**Analog:** base reusable components.

**Card pattern** from `Card.tsx` (lines 15-29, 32-54):
```typescript
export function Card({ children, variant = 'default', onPress, accessibilityLabel, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}
```

**Coin/status composition** from `CoinBadge.tsx` (lines 10-18) and `StatusBadge.tsx` (lines 13-29):
```typescript
export function CoinBadge({ amount, label = 'moedas' }: CoinBadgeProps) {
  return (
    <View accessibilityLabel={`${amount} ${label}`} style={styles.badge}>
      <Text style={styles.emoji}>🪙</Text>
      <Text style={styles.label}>
        {amount} {label}
      </Text>
    </View>
  );
}

const variantStyles = {
  pending: { backgroundColor: colors.surfaceSoft, color: colors.textSecondary },
  selected: { backgroundColor: colors.primarySoft, color: colors.primaryDark },
  success: { backgroundColor: colors.successSoft, color: colors.success },
  warning: { backgroundColor: colors.warningSoft, color: colors.accentDark },
  error: { backgroundColor: colors.errorSoft, color: colors.error },
} as const;
```

**Button pattern** from `PrimaryButton.tsx` (lines 14-25):
```typescript
export function PrimaryButton({ label, onPress, disabled = false, loading = false, accessibilityLabel, style }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, isDisabled && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={colors.textInverse} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}
```

**Apply:**

- `MissionCard.tsx`: compose `Card`, `EmojiAvatar`/emoji text, `CoinBadge`, `StatusBadge`, and a `PrimaryButton` or detail action. Use accessibility labels such as `Concluir missão {title}`.
- `RewardCard.tsx`: compose `Card`, cost `CoinBadge`, affordability helper, and disabled/active redeem action. Show exact missing coins.
- `EmptyState.tsx`: copy the simple card/status layout from `ChildStubScreen`; no nested cards.
- `FeedbackBanner.tsx`: use `StatusBadge` palettes and friendly PT-BR messages; no raw backend codes in visible text.

---

### `mobile/src/features/child/components/BottomTabBar.tsx` (component, event-driven navigation)

**Analog:** no existing tab bar. Use `Card`/`SecondaryButton` visual patterns and React Navigation tab-bar props.

**Pressable/card affordance source** from `Card.tsx` (lines 18-23):
```typescript
<Pressable
  accessibilityLabel={accessibilityLabel}
  accessibilityRole="button"
  onPress={onPress}
  style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
>
```

**Touch target source** from `SecondaryButton.tsx` (lines 29-35):
```typescript
button: {
  alignItems: 'center',
  backgroundColor: colors.secondarySoft,
  borderRadius: radius.lg,
  justifyContent: 'center',
  minHeight: 48,
  paddingHorizontal: spacing.lg,
}
```

**Apply:** four destinations only: `Início`, `Missões`, `Recompensas`, `Perfil`. Active tab uses text plus pill shape and `colors.primarySoft`/`colors.tabActive`. No external icons; emojis are acceptable.

---

### `mobile/src/features/child/components/ProgressBar.tsx` (component, transform)

**Analog:** no direct analog in codebase.

**Theme tokens to use** from `colors.ts` (lines 2-18), `radius.ts` (lines 1-7), and `spacing.ts` (lines 1-11):
```typescript
export const colors = {
  background: '#F5FBF8',
  surfaceMuted: '#E9EFED',
  primary: '#4FD1C5',
  success: '#38A169',
  accent: '#F6AD55',
  warningSoft: '#FFF3DF',
} as const;

export const radius = {
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
} as const;
```

**Apply:** clamp values 0-100, use a fixed 12px pill track, expose an accessibility label/value. Only render real progress when API data supports completed/total counts; with current backend, prefer pending-count summaries over fake progress.

---

### Tests: child service and child screens

**Analog:** `api-auth.test.ts`, `family-navigation.test.tsx`, `login-screen.test.tsx`, and `base-components.test.tsx`.

**API wrapper test pattern** from `api-auth.test.ts` (lines 13-35, 62-80):
```typescript
it('posts login credentials and returns auth response', async () => {
  fetchMock.mockResolvedValueOnce(createResponse(200, response));

  await expect(
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email: 'dani@example.com', password: 'secret' },
    }),
  ).resolves.toEqual(response);

  expect(fetchMock).toHaveBeenCalledWith(
    'http://10.0.2.2:8080/auth/login',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'dani@example.com', password: 'secret' }),
    }),
  );
});

it('injects bearer token without accepting client familyUnitId authorization', async () => {
  await apiRequest('/me', { token: 'jwt-token' });
  expect(fetchMock).toHaveBeenCalledWith(
    'http://10.0.2.2:8080/me',
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
    }),
  );
});
```

**Navigation test pattern** from `family-navigation.test.tsx` (lines 36-47, 49-67):
```typescript
it('shows family mode choices and navigates to each stub', () => {
  render(<FamilyHubScreen navigation={navigation} route={{ key: 'FamilyHub', name: 'FamilyHub' }} />);

  fireEvent.press(screen.getByRole('button', { name: 'Sou responsável' }));
  fireEvent.press(screen.getByRole('button', { name: 'Sou criança' }));

  expect(navigate).toHaveBeenCalledWith('ResponsibleStub');
  expect(navigate).toHaveBeenCalledWith('ChildStub');
});

it('lets responsible and child stubs switch mode and logout without fake data', () => {
  render(<ChildStubScreen navigation={navigation} route={{ key: 'ChildStub', name: 'ChildStub' } as never} />);
  fireEvent.press(screen.getByRole('button', { name: 'Sair da conta' }));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/saldo/i)).toBeNull();
});
```

**Async UI/error test pattern** from `login-screen.test.tsx` (lines 36-60):
```typescript
fireEvent.changeText(screen.getByLabelText('E-mail'), 'dani@example.com');
fireEvent.changeText(screen.getByLabelText('Senha'), 'secret');
fireEvent.press(screen.getByRole('button', { name: 'Entrar na conta' }));

await waitFor(() => expect(login).toHaveBeenCalledWith('dani@example.com', 'secret'));

expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
expect(screen.getByText('Nao conseguimos conectar ao servidor. Verifique a conexao e tente novamente.')).toBeOnTheScreen();
```

**Base component assertion pattern** from `base-components.test.tsx` (lines 7-19, 22-47):
```typescript
const button = screen.getByRole('button', { name: 'Entrar na conta' });

expect(button).toBeDisabled();
expect(button).toHaveStyle({ minHeight: 56 });

fireEvent.press(button);

expect(onPress).not.toHaveBeenCalled();
```

**Apply per test file:**

- `child-service.test.ts`: assert all real paths, method/body for complete/redeem, Bearer token headers, and no `familyUnitId`.
- `child-navigation.test.tsx`: update old `ChildStub` expectations to `ChildProfileSelect`, selected child -> tabs, profile switch -> selector, logout -> auth.
- `child-home.test.tsx`: cover wallet balance, pending mission summary, loading, empty, error, and retry.
- `child-missions.test.tsx`: cover pending list, complete loading, `COMPLETED` feedback, `AWAITING_APPROVAL` feedback, and refetch calls.
- `child-rewards.test.tsx`: cover affordability, confirmation, successful redemption, `INSUFFICIENT_BALANCE`, disabled action, and refetched balance.

## Shared Patterns

### Authentication And Family Isolation

**Source:** `mobile/src/api/client.ts` and `mobile/src/features/auth/AuthContext.tsx`
**Apply to:** all child services and screens.

```typescript
if (options.token) {
  headers.Authorization = `Bearer ${options.token}`;
}

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

Source lines: `mobile/src/api/client.ts` lines 65-67 and 106-114.

**Rule:** selected child is UI state inside the responsible authenticated session. Do not create child auth, do not send `familyUnitId`, and do not fake PIN validation.

### Error Handling

**Source:** `mobile/src/api/client.ts`, `mobile/src/api/types.ts`, backend `GlobalExceptionHandler`.

`mobile/src/api/client.ts` (lines 86-104):
```typescript
function createApiError(status: number, body?: ApiErrorBody): ApiError {
  return new ApiError({
    status,
    code: body?.code,
    details: body?.details,
    message: body?.message ?? `HTTP ${status}`,
    userMessage: mapUserMessage(status, body),
  });
}

function mapUserMessage(status: number, body?: ApiErrorBody): string {
  if (status === 401 || status === 403) {
    return body?.code === 'INVALID_CREDENTIALS'
      ? INVALID_CREDENTIALS_MESSAGE
      : SESSION_EXPIRED_MESSAGE;
  }

  return body?.message || GENERIC_ERROR_MESSAGE;
}
```

Backend error shape from `GlobalExceptionHandler.java` (lines 27-40):
```java
return ResponseEntity
    .status(exception.getStatus())
    .body(ApiError.of(exception.getCode(), exception.getMessage()));

return ResponseEntity
    .badRequest()
    .body(new ApiError("VALIDATION_ERROR", "Dados inválidos.", details));
```

**Rule:** use `ApiError.code` for semantic overrides like `INSUFFICIENT_BALANCE`; otherwise show `ApiError.userMessage` or UI-SPEC fallback copy.

### Mission Completion And Refetch

**Source:** `AssignedMissionService.java`
**Apply to:** mission screens, home summaries, mission feedback.

`AssignedMissionService.java` (lines 84-103, 106-138):
```java
public List<AssignedMissionResponse> listPendingForChild(CurrentUser currentUser, UUID childId) {
  List<AssignedMissionResponse> pendingMissions = assignedMissionRepository
      .findAllByFamilyUnitIdAndChildIdAndStatusOrderByDueDateAscCreatedAtAsc(
          familyUnitId,
          childId,
          AssignedMissionStatus.PENDING)
      .stream()
      .map(this::toResponse)
      .toList();
  return pendingMissions;
}

public AssignedMissionResponse complete(CurrentUser currentUser, UUID assignedMissionId) {
  requireStatus(assignedMission, AssignedMissionStatus.PENDING);

  assignedMission.markCompleted();
  if (!assignedMission.isSnapshotRequiresApproval()) {
    walletService.creditForMission(...);
  }
  return toResponse(assignedMission);
}
```

**Rule:** after completion, refetch wallet and pending missions. Preserve the returned completion response only for immediate feedback because the list endpoint returns pending missions only.

### Reward Redemption And Balance

**Source:** `RewardService.java`, `WalletService.java`, `RedeemRewardRequest.java`
**Apply to:** rewards screen/service/tests.

`RewardService.java` (lines 105-135):
```java
public RewardRedemptionResponse redeem(CurrentUser currentUser, UUID rewardId, RedeemRewardRequest request) {
  UUID familyUnitId = currentUser.familyUnitId();
  Reward reward = rewardRepository.findByIdAndFamilyUnitIdAndActiveTrue(rewardId, familyUnitId)
      .orElseThrow(this::rewardNotFound);
  ChildProfile child = childProfileRepository
      .findByIdAndFamilyUnitIdAndActiveTrue(request.childId(), familyUnitId)
      .orElseThrow(this::childNotFound);
  Wallet wallet = walletRepository.findByChildIdAndFamilyUnitId(child.getId(), familyUnitId)
      .orElseThrow(this::walletNotFound);

  RewardRedemption redemption = rewardRedemptionRepository.saveAndFlush(new RewardRedemption(...));
  CoinTransaction transaction = walletService.debitForRewardRedemption(...);
  redemption.linkCoinTransaction(transaction.getId());
  return toResponse(redemption);
}
```

`WalletService.java` (lines 112-121):
```java
Wallet wallet = walletRepository.findByChildIdAndFamilyUnitIdForUpdate(childId, familyUnitId)
    .orElseThrow(() -> new NotFoundException("WALLET_NOT_FOUND", "Carteira não encontrada."));
if (wallet.getBalance() < amount) {
  throw new ConflictException("INSUFFICIENT_BALANCE", "Saldo insuficiente para resgatar esta recompensa.");
}
wallet.debit(amount);
```

`RedeemRewardRequest.java` (lines 6-8):
```java
public record RedeemRewardRequest(
    @NotNull(message = "Criança é obrigatória.")
    UUID childId) {
}
```

**Rule:** UI may compute `missingCoins` for disabled states, but backend remains the source of truth. Submit `POST /rewards/{id}/redeem` with `{ childId }`; after success or backend insufficient balance, refetch wallet.

### Visual Composition

**Source:** base components and theme tokens.
**Apply to:** all child screens and child domain components.

`AppScreen.tsx` (lines 14-27, 38-42):
```typescript
export function AppScreen({ children, scroll = true, centered = false, style, contentStyle }: AppScreenProps) {
  const content = <View style={[styles.content, centered && styles.centered, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
```

`AppHeader.tsx` (lines 16-28):
```typescript
export function AppHeader({ title, subtitle, greeting, emoji, action }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        {emoji ? <EmojiAvatar emoji={emoji} label={title} size="md" /> : null}
        <View style={styles.copy}>
          {greeting ? <Text style={styles.greeting}>{greeting}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}
```

`EmojiAvatar.tsx` (lines 27-37):
```typescript
export function EmojiAvatar({ emoji, label, size = 'md' }: EmojiAvatarProps) {
  const dimension = sizeMap[size];

  return (
    <View
      accessibilityLabel={label}
      accessible
      style={[styles.avatar, { height: dimension, width: dimension }]}
    >
      <Text style={[styles.emoji, { fontSize: emojiSizeMap[size] }]}>{emoji}</Text>
    </View>
  );
}
```

**Rule:** compose from existing base components first; add child domain components only for repeated mission/reward/tab/feedback UI.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `mobile/src/features/child/components/BottomTabBar.tsx` | component | event-driven navigation | No existing bottom tab navigator or custom tab bar exists. Use official `@react-navigation/bottom-tabs` plus base component/token patterns. |
| `mobile/src/features/child/components/ProgressBar.tsx` | component | transform | No progress component exists. Build a minimal token-based pill and only show it when real count data exists. |

## Metadata

**Analog search scope:** `.planning/phases/05-fluxo-da-crian-a`, `mobile/src/api`, `mobile/src/features`, `mobile/src/navigation`, `mobile/src/components`, `mobile/src/theme`, `backend/src/main/java/br/com/habitinhos/{children,missions,rewards,wallet,shared/error}`

**Files scanned:** 60+

**Pattern extraction date:** 2026-06-02

**Backend route reality:** current code exposes `POST /rewards/{id}/redeem` with `{ childId }`, not the child-scoped docs route. Mobile services should mirror code reality unless the planner explicitly adds a backend/docs reconciliation task.
