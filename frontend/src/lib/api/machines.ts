import { apiClient } from "@/lib/api-client";

export type MachineStatus = "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER";

export interface MachineResponse {
  id: number;
  name: string;
  status: MachineStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMachineRequest {
  name: string;
}

export interface UpdateMachineStatusRequest {
  status: MachineStatus;
}

export const machinesService = {
  getAll: () => apiClient.get<MachineResponse[]>("/v1/machines"),
  create: (data: CreateMachineRequest) => apiClient.post<MachineResponse>("/v1/machines", data),
  updateStatus: (id: number, data: UpdateMachineStatusRequest) => apiClient.patch<MachineResponse>(`/v1/machines/${id}/status`, data),
  delete: (id: number) => apiClient.delete(`/v1/machines/${id}`),
};
