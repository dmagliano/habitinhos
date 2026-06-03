export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
};

export type UserRole = 'RESPONSIBLE';

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type FamilySummary = {
  id: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: UserSummary;
  family: FamilySummary;
};

export type MeResponse = UserSummary & {
  familyId: string;
  familyName: string;
};

export type ChildResponse = {
  id: string;
  name: string;
  age: number;
  avatarKey: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChildProfileRequest = {
  name: string;
  age: number;
  avatarKey: string;
};

export type WalletResponse = {
  childId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type AssignedMissionStatus =
  | 'PENDING'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type AssignedMissionResponse = {
  id: string;
  missionId: string;
  childId: string;
  status: AssignedMissionStatus;
  dueDate: string | null;
  completedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  snapshotTitle: string;
  snapshotDescription: string;
  snapshotCoinValue: number;
  snapshotRequiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RewardResponse = {
  id: string;
  title: string;
  description: string;
  cost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RewardRedemptionStatus = 'REDEEMED';

export type RewardRedemptionResponse = {
  id: string;
  rewardId: string;
  childId: string;
  walletId: string;
  status: RewardRedemptionStatus;
  snapshotTitle: string;
  snapshotCost: number;
  coinTransactionId: string;
  createdAt: string;
  updatedAt: string;
};

export type MissionResponse = {
  id: string;
  title: string;
  description: string;
  coinValue: number;
  requiresApproval: boolean;
  recurrenceType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MissionRequest = {
  title: string;
  description: string;
  coinValue: number;
  requiresApproval: boolean;
  recurrenceType: MissionResponse['recurrenceType'];
};

export type AssignMissionRequest = {
  childIds: string[];
  dueDate?: string | null;
};

export type RejectAssignedMissionRequest = {
  reason?: string;
};

export type ResponsibleDashboardMissionCounts = Record<AssignedMissionStatus, number>;

export type ResponsibleDashboardChildSummary = {
  id: string;
  name: string;
  age: number;
  avatarKey: string;
  balance: number;
  missionCounts: ResponsibleDashboardMissionCounts;
};

export type ResponsibleDashboardApproval = {
  id: string;
  childId: string;
  childName: string;
  missionTitle: string;
  coinValue: number;
  completedAt: string | null;
};

export type ResponsibleDashboardRedemption = {
  id: string;
  rewardId: string;
  childId: string;
  childName: string;
  rewardTitle: string;
  rewardCost: number;
  redeemedAt: string;
};

export type ResponsibleDashboardResponse = {
  children: ResponsibleDashboardChildSummary[];
  pendingApprovalCount: number;
  approvalPreview: ResponsibleDashboardApproval[];
  recentRedemptions: ResponsibleDashboardRedemption[];
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  userMessage: string;
  isNetworkError: boolean;
  isSessionExpired: boolean;

  constructor(params: {
    message: string;
    userMessage: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown>;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.userMessage = params.userMessage;
    this.isNetworkError = params.isNetworkError ?? false;
    this.isSessionExpired = params.status === 401 || params.status === 403;
  }
}
