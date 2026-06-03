import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthLoadingScreen } from '../features/auth/AuthLoadingScreen';
import { AuthWelcomeScreen } from '../features/auth/AuthWelcomeScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { useAuth } from '../features/auth/AuthContext';
import { RegisterScreen } from '../features/auth/RegisterScreen';
import { ChildMissionDetailScreen } from '../features/child/ChildMissionDetailScreen';
import { ChildProfileSelectScreen } from '../features/child/ChildProfileSelectScreen';
import { ChildTabsScreen } from '../features/child/ChildTabsScreen';
import { FamilyHubScreen } from '../features/family/FamilyHubScreen';
import { ResponsibleChildDetailScreen } from '../features/responsible/ResponsibleChildDetailScreen';
import { ResponsibleChildFormScreen } from '../features/responsible/ResponsibleChildFormScreen';
import { ResponsibleChildrenScreen } from '../features/responsible/ResponsibleChildrenScreen';
import { ResponsibleApprovalsScreen } from '../features/responsible/ResponsibleApprovalsScreen';
import { ResponsibleAssignmentFormScreen } from '../features/responsible/ResponsibleAssignmentFormScreen';
import { ResponsibleMissionFormScreen } from '../features/responsible/ResponsibleMissionFormScreen';
import { ResponsibleRewardFormScreen } from '../features/responsible/ResponsibleRewardFormScreen';
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
            <Stack.Screen component={ChildProfileSelectScreen} name="ChildProfileSelect" />
            <Stack.Screen component={ChildTabsScreen} name="ChildTabs" />
            <Stack.Screen component={ChildMissionDetailScreen} name="ChildMissionDetail" />
            <Stack.Screen component={FamilyHubScreen} name="FamilyHub" />
            <Stack.Screen component={ResponsibleTabsScreen} name="ResponsibleTabs" />
            <Stack.Screen component={ResponsibleChildrenScreen} name="ResponsibleChildren" />
            <Stack.Screen component={ResponsibleChildFormScreen} name="ResponsibleChildForm" />
            <Stack.Screen component={ResponsibleChildDetailScreen} name="ResponsibleChildDetail" />
            <Stack.Screen component={ResponsibleMissionFormScreen} name="ResponsibleMissionForm" />
            <Stack.Screen component={ResponsibleAssignmentFormScreen} name="ResponsibleAssignmentForm" />
            <Stack.Screen component={ResponsibleApprovalsScreen} name="ResponsibleApprovals" />
            <Stack.Screen component={ResponsibleRewardFormScreen} name="ResponsibleRewardForm" />
          </>
        ) : (
          <>
            <Stack.Screen component={AuthWelcomeScreen} name="AuthWelcome" />
            <Stack.Screen component={LoginScreen} name="AuthLogin" />
            <Stack.Screen component={RegisterScreen} name="AuthRegister" />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
