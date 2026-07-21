import { apiClient } from "@/lib/api-client";

export interface AddOnCatalogResponse {
  id: string;
  name: string;
  defaultPrice: number;
  isActive: boolean;
}

export interface CreateAddOnCatalogRequest {
  name: string;
  defaultPrice: number;
}

export interface UpdateAddOnCatalogRequest {
  name?: string;
  defaultPrice?: number;
  isActive?: boolean;
}

export const addOnCatalogService = {
  async getAll(activeOnly: boolean = true): Promise<AddOnCatalogResponse[]> {
    const response = await apiClient.get<AddOnCatalogResponse[]>("/v1/add-ons", {
      params: { activeOnly },
    });
    return response;
  },

  async create(data: CreateAddOnCatalogRequest): Promise<AddOnCatalogResponse> {
    const response = await apiClient.post<AddOnCatalogResponse>("/v1/add-ons", data);
    return response;
  },

  async update(id: string, data: UpdateAddOnCatalogRequest): Promise<AddOnCatalogResponse> {
    const response = await apiClient.patch<AddOnCatalogResponse>(`/v1/add-ons/${id}`, data);
    return response;
  },
};
