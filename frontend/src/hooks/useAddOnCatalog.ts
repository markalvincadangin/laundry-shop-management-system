import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addOnCatalogService, CreateAddOnCatalogRequest, UpdateAddOnCatalogRequest } from "@/lib/api/addOnCatalog";

export const ADD_ON_CATALOG_KEYS = {
  all: ["add-on-catalog"] as const,
  active: () => [...ADD_ON_CATALOG_KEYS.all, "active"] as const,
  lists: () => [...ADD_ON_CATALOG_KEYS.all, "list"] as const,
};

export function useAddOnCatalog(activeOnly: boolean = true) {
  return useQuery({
    queryKey: activeOnly ? ADD_ON_CATALOG_KEYS.active() : ADD_ON_CATALOG_KEYS.lists(),
    queryFn: () => addOnCatalogService.getAll(activeOnly),
  });
}

export function useCreateAddOnCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddOnCatalogRequest) => addOnCatalogService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADD_ON_CATALOG_KEYS.all });
    },
  });
}

export function useUpdateAddOnCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddOnCatalogRequest }) => addOnCatalogService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADD_ON_CATALOG_KEYS.all });
    },
  });
}
