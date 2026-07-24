"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { machinesService, MachineResponse, MachineStatus, CreateMachineRequest, UpdateMachineStatusRequest } from "@/lib/api/machines";
import { toast } from "sonner";
import { UI_LABELS } from "@/constants/ui";

export function useMachines() {
  const queryClient = useQueryClient();

  const {
    data: machines = [],
    isLoading: loading,
    isError,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["machines"],
    queryFn: () => machinesService.getAll(),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMachineRequest) => machinesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success("Machine added successfully");
    },
    onError: (err: any) => {
      const isServerError = err.status >= 500;
      toast.error(isServerError ? UI_LABELS.feedback.error.GENERIC : (err.message || UI_LABELS.feedback.error.GENERIC));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateMachineStatusRequest }) =>
      machinesService.updateStatus(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success("Machine status updated");
    },
    onError: (err: any) => {
      const isServerError = err.status >= 500;
      toast.error(isServerError ? UI_LABELS.feedback.error.GENERIC : (err.message || UI_LABELS.feedback.error.GENERIC));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => machinesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      toast.success("Machine deleted successfully");
    },
    onError: (err: any) => {
      const isServerError = err.status >= 500;
      toast.error(isServerError ? UI_LABELS.feedback.error.GENERIC : (err.message || UI_LABELS.feedback.error.GENERIC));
    },
  });

  const addMachine = async (data: CreateMachineRequest) => {
    return createMutation.mutateAsync(data);
  };

  const updateStatus = async (id: string, status: MachineStatus) => {
    return updateStatusMutation.mutateAsync({ id, data: { status } });
  };

  const removeMachine = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    machines,
    loading,
    error: isError ? (error as any).message : null,
    refresh,
    addMachine,
    updateStatus,
    removeMachine,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
