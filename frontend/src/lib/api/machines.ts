import { apiClient } from "@/lib/api-client";

export type MachineStatus = "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER";

export interface MachineResponse {
  id: string;
  name: string;
  status: MachineStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMachineRequest {
  name: string;
}

export interface UpdateMachineRequest {
  name: string;
  status: MachineStatus;
}

export interface UpdateMachineStatusRequest {
  status: MachineStatus;
}

export const machinesService = {
  getAll: () => apiClient.get<MachineResponse[]>("/v1/machines"),
  create: (data: CreateMachineRequest, options?: { operationIdentifier?: string }) => apiClient.post<MachineResponse>("/v1/machines", data, options),
  update: (id: string, data: UpdateMachineRequest, options?: { operationIdentifier?: string }) => apiClient.put<MachineResponse>(`/v1/machines/${id}`, data, options),
  updateStatus: (id: string, data: UpdateMachineStatusRequest, options?: { operationIdentifier?: string }) => apiClient.patch<MachineResponse>(`/v1/machines/${id}/status`, data, options),
  delete: (id: string, options?: { operationIdentifier?: string }) => apiClient.delete(`/v1/machines/${id}`, options),
};
