import { apiRequest } from '../../api/client';
import {
  AssignedMissionResponse,
  AssignMissionRequest,
  ChildProfileRequest,
  ChildResponse,
  MissionRequest,
  MissionResponse,
  RejectAssignedMissionRequest,
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

  async getMission(token: string, missionId: string): Promise<MissionResponse> {
    return apiRequest<MissionResponse>(`/missions/${missionId}`, { token });
  },

  async createMission(token: string, body: MissionRequest): Promise<MissionResponse> {
    return apiRequest<MissionResponse>('/missions', {
      body,
      method: 'POST',
      token,
    });
  },

  async updateMission(token: string, missionId: string, body: MissionRequest): Promise<MissionResponse> {
    return apiRequest<MissionResponse>(`/missions/${missionId}`, {
      body,
      method: 'PUT',
      token,
    });
  },

  async deactivateMission(token: string, missionId: string): Promise<MissionResponse> {
    return apiRequest<MissionResponse>(`/missions/${missionId}/deactivate`, {
      method: 'PATCH',
      token,
    });
  },

  async assignMission(
    token: string,
    missionId: string,
    body: AssignMissionRequest,
  ): Promise<AssignedMissionResponse[]> {
    return apiRequest<AssignedMissionResponse[]>(`/missions/${missionId}/assign`, {
      body,
      method: 'POST',
      token,
    });
  },

  async listPendingApprovals(token: string): Promise<AssignedMissionResponse[]> {
    return apiRequest<AssignedMissionResponse[]>('/assigned-missions/pending-approval', { token });
  },

  async approveAssignedMission(token: string, assignedMissionId: string): Promise<AssignedMissionResponse> {
    return apiRequest<AssignedMissionResponse>(`/assigned-missions/${assignedMissionId}/approve`, {
      method: 'POST',
      token,
    });
  },

  async rejectAssignedMission(
    token: string,
    assignedMissionId: string,
    body: RejectAssignedMissionRequest = {},
  ): Promise<AssignedMissionResponse> {
    return apiRequest<AssignedMissionResponse>(`/assigned-missions/${assignedMissionId}/reject`, {
      body,
      method: 'POST',
      token,
    });
  },

  async listRewards(token: string, includeInactive = false): Promise<RewardResponse[]> {
    return apiRequest<RewardResponse[]>(includeInactivePath('/rewards', includeInactive), { token });
  },
};
