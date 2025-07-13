import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { symptomsService } from "../services/api";
import toast from "react-hot-toast";

export const useSymptoms = () => {
  return useQuery({
    queryKey: ["symptoms"],
    queryFn: symptomsService.getAll,
  });
};

export const useSymptom = (id: number) => {
  return useQuery({
    queryKey: ["symptoms", id],
    queryFn: () => symptomsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateSymptom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => symptomsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      toast.success("Sintoma criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar sintoma");
    },
  });
};

export const useUpdateSymptom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      symptomsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      toast.success("Sintoma atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar sintoma");
    },
  });
};

export const useDeleteSymptom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => symptomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      toast.success("Sintoma excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao excluir sintoma");
    },
  });
};
