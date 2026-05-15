import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, UserResponse } from "@/services/users.service";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

/**
 * useUsers: Hook for staff management.
 * Standardized with TanStack Query and consistent return structure.
 */
export function useUsers(params: any = { page: 0, size: 20 }) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", params],
    queryFn: () => usersService.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => usersService.getStats(),
    staleTime: 60 * 1000,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => usersService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast.success(UI_LABELS.feedback.success.GENERIC);
    },
    onError: () => {
      toast.error(UI_LABELS.feedback.error.GENERIC);
    },
  });

  return { 
    users: data?.content ?? [], 
    stats,
    loading, 
    error: isError ? (error as any).message : null, 
    pagination: {
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
    },
    refresh: refetch, 
    toggleStatus: toggleStatusMutation.mutate 
  };
}
