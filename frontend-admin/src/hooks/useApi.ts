import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";

interface UseApiOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

export function useApiQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: UseApiOptions<T>) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: QueryKey[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export function useApiMutation<TData, TVariables>({
  mutationFn,
  invalidateKeys = [],
  onSuccess,
  onError,
}: UseMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

// Alias for backwards compatibility - accepts positional arguments
export function useApi<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
}

export { useQuery, useMutation, useQueryClient };
