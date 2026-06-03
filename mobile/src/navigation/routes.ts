import { AssignedMissionResponse, ChildResponse } from '../api/types';

export type RootStackParamList = {
  AuthWelcome: undefined;
  AuthLogin: undefined;
  AuthRegister: undefined;
  FamilyHub: undefined;
  ResponsibleTabs: { activeChild?: ChildResponse } | undefined;
  ResponsibleChildren: { feedback?: 'child-created' | 'child-deactivated' } | undefined;
  ResponsibleChildForm: { childId?: string } | undefined;
  ResponsibleChildDetail: { childId: string; feedback?: 'child-updated' | 'child-deactivated' };
  ResponsibleMissionForm: { missionId?: string } | undefined;
  ResponsibleAssignmentForm: { missionId: string };
  ResponsibleApprovals: undefined;
  ResponsibleRewardForm: { rewardId?: string } | undefined;
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
