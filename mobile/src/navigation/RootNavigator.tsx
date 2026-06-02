import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthLoadingScreen } from '../features/auth/AuthLoadingScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { useAuth } from '../features/auth/AuthContext';
import { ChildMissionDetailScreen } from '../features/child/ChildMissionDetailScreen';
import { ChildProfileSelectScreen } from '../features/child/ChildProfileSelectScreen';
import { ChildTabsScreen } from '../features/child/ChildTabsScreen';
import { FamilyHubScreen } from '../features/family/FamilyHubScreen';
import { ResponsibleStubScreen } from '../features/family/ResponsibleStubScreen';

import { RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
}
