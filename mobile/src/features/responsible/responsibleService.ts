import { apiRequest } from '../../api/client';
import {
  ChildProfileRequest,
  ChildResponse,
  MissionResponse,
  ResponsibleDashboardResponse,
  RewardResponse,
} from '../../api/types';

function includeInactivePath(path: string, includeInactive?: boolean): string {
  return includeInactive ? `${path}?includeInactive=true` : path;
}

export const responsibleService = {
  async getDashboard(token: string): Promise<ResponsibleDashboardResponse> {
    return apiRequest<ResponsibleDashboardResponse>('/dashboard/responsible', { token });
  },

  async listChildren(token: string, includeInactive = false): Promise<ChildResponse[]> {
    return apiRequest<ChildResponse[]>(includeInactivePath('/children', includeInactive), { token });
  },

  async getChild(token: string, childId: string): Promise<ChildResponse> {
    return apiRequest<ChildResponse>(`/children/${childId}`, { token });
  },

  async createChild(token: string, body: ChildProfileRequest): Promise<ChildResponse> {
    return apiRequest<ChildResponse>('/children', {
      body,
      method: 'POST',
      token,
    });
  },

  async updateChild(token: string, childId: string, body: ChildProfileRequest): Promise<ChildResponse> {
    return apiRequest<ChildResponse>(`/children/${childId}`, {
      body,
      method: 'PUT',
      token,
    });
  },

  async deactivateChild(token: string, childId: string): Promise<ChildResponse> {
    return apiRequest<ChildResponse>(`/children/${childId}/deactivate`, {
      method: 'PATCH',
      token,
    });
  },

  async listMissions(token: string, includeInactive = false): Promise<MissionResponse[]> {
    return apiRequest<MissionResponse[]>(includeInactivePath('/missions', includeInactive), { token });
  },

  async listRewards(token: string, includeInactive = false): Promise<RewardResponse[]> {
    return apiRequest<RewardResponse[]>(includeInactivePath('/rewards', includeInactive), { token });
  },
};
