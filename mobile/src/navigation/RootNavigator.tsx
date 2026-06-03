import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthLoadingScreen } from '../features/auth/AuthLoadingScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { useAuth } from '../features/auth/AuthContext';
import { ChildMissionDetailScreen } from '../features/child/ChildMissionDetailScreen';
import { ChildProfileSelectScreen } from '../features/child/ChildProfileSelectScreen';
import { ChildTabsScreen } from '../features/child/ChildTabsScreen';
import { FamilyHubScreen } from '../features/family/FamilyHubScreen';
import { ResponsibleChildDetailScreen } from '../features/responsible/ResponsibleChildDetailScreen';
import { ResponsibleChildrenScreen } from '../features/responsible/ResponsibleChildrenScreen';
import { ResponsibleTabsScreen } from '../features/responsible/ResponsibleTabsScreen';

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
            <Stack.Screen component={ResponsibleTabsScreen} name="ResponsibleTabs" />
            <Stack.Screen component={ResponsibleChildrenScreen} name="ResponsibleChildren" />
            <Stack.Screen component={ResponsibleChildDetailScreen} name="ResponsibleChildDetail" />
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
