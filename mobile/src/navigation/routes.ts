import { AssignedMissionResponse, ChildResponse } from '../api/types';

export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleTabs: undefined;
  ResponsibleChildDetail: { childId: string };
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
