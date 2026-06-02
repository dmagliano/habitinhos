import { AssignedMissionResponse, ChildResponse } from '../api/types';

export type RootStackParamList = {
  Auth: undefined;
  FamilyHub: undefined;
  ResponsibleStub: undefined;
  ChildProfileSelect: undefined;
  ChildTabs: { child: ChildResponse };
  ChildMissionDetail: { child: ChildResponse; mission: AssignedMissionResponse | null };
};
