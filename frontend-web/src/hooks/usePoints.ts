import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsService } from "../services/api";
import { Point, CreatePointData, UpdatePointData } from "../types";
import toast from "react-hot-toast";

export const usePoints = () => {
  return useQuery({
    queryKey: ["points"],
    queryFn: pointsService.getAll,
  });
};

export const usePoint = (id: number) => {
  return useQuery({
    queryKey: ["points", id],
    queryFn: () => pointsService.getById(id),
    enabled: !!id,
  });
};

export const useCreatePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePointData) => pointsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success("Ponto criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao criar ponto");
    },
  });
};

export const useUpdatePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePointData }) =>
      pointsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success("Ponto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao atualizar ponto");
    },
  });
};

export const useDeletePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pointsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points"] });
      toast.success("Ponto excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao excluir ponto");
    },
  });
};
