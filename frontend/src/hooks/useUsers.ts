import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, UserResponse } from "@/services/users.service";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

/**
 * useUsers: Hook for staff management.
 * Standardized with TanStack Query and consistent return structure.
 */
export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersService.getAll(),
    staleTime: 60 * 1000, // 1 minute
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => usersService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(UI_LABELS.feedback.success.GENERIC);
    },
    onError: () => {
      toast.error(UI_LABELS.feedback.error.GENERIC);
    },
  });

  return { 
    users, 
    loading, 
    error: isError ? (error as any).message : null, 
    pagination: {
      page: 0,
      totalPages: 1,
      totalElements: users.length,
    },
    refresh: refetch, 
    toggleStatus: toggleStatusMutation.mutate 
  };
}
