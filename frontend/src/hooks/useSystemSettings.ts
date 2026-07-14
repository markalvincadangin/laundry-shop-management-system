import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';

export const useSystemSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['systemSettings'],
    queryFn: settingsApi.getSettings,
    refetchInterval: 30000, // Poll every 30s to stay updated
  });

  const mutation = useMutation({
    mutationFn: (isPaused: boolean) => settingsApi.updateSettings(isPaused),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
    },
  });

  return {
    ...query,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending
  };
};
