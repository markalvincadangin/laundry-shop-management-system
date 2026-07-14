import { apiClient } from "@/lib/api-client";

export interface SystemSettings {
  id?: number;
  isSystemPaused: boolean;
}

export const settingsApi = {
  getSettings: async () => {
    const response = await apiClient.get<SystemSettings>('/v1/settings');
    return response;
  },
  
  updateSettings: async (isSystemPaused: boolean) => {
    const response = await apiClient.patch<SystemSettings>('/v1/settings/pause', { isSystemPaused });
    return response;
  }
};
