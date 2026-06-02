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

  async getWallet(token: string, childId: string): Promise<WalletResponse> {
    return apiRequest<WalletResponse>(`/children/${childId}/wallet`, { token });
  },

  async listPendingMissions(
    token: string,
    childId: string,
  ): Promise<AssignedMissionResponse[]> {
    return apiRequest<AssignedMissionResponse[]>(`/children/${childId}/missions`, { token });
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

  async listRewards(token: string): Promise<RewardResponse[]> {
    return apiRequest<RewardResponse[]>('/rewards', { token });
  },

  async redeemReward(
    token: string,
    rewardId: string,
    childId: string,
  ): Promise<RewardRedemptionResponse> {
    return apiRequest<RewardRedemptionResponse>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
      token,
      body: { childId },
    });
  },
};
