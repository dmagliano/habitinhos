import { AssignedMissionResponse, ChildResponse } from '../api/types';

export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleTabs: undefined;
  ResponsibleChildren: { feedback?: 'child-created' | 'child-deactivated' } | undefined;
  ResponsibleChildForm: { childId?: string } | undefined;
  ResponsibleChildDetail: { childId: string; feedback?: 'child-updated' | 'child-deactivated' };
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
