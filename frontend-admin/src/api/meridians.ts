import { apiClient } from "./client";
import type { Meridian, APIResponse } from "../types";

export const meridiansApi = {
  getAll: async (): Promise<Meridian[]> => {
    const { data } = await apiClient.get("/admin/meridians");
    return data;
  },

  getById: async (id: string): Promise<Meridian> => {
    const { data } = await apiClient.get(`/admin/meridians/${id}`);
    return data;
  },

  getByCode: async (code: string): Promise<Meridian> => {
    const { data } = await apiClient.get(`/admin/meridians/code/${code}`);
    return data;
  },

  create: async (meridian: Omit<Meridian, "id">): Promise<Meridian> => {
    const { data } = await apiClient.post("/admin/meridians", meridian);
    return data;
  },

  update: async (
    id: string,
    meridian: Partial<Meridian>
  ): Promise<Meridian> => {
    const { data } = await apiClient.put(`/admin/meridians/${id}`, meridian);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/meridians/${id}`);
  },
};

// Exported functions for backwards compatibility
export async function getMeridians(
  page: number = 1,
  pageSize: number = 20
): Promise<APIResponse<Meridian[]>> {
  const { data } = await apiClient.get("/admin/meridians", {
    params: { page, pageSize },
  });
  return data;
}

export async function getMeridianById(id: string): Promise<Meridian> {
  const { data } = await apiClient.get(`/admin/meridians/${id}`);
  return data;
}

export async function createMeridian(
  meridian: Partial<Meridian>
): Promise<Meridian> {
  const { data } = await apiClient.post("/admin/meridians", meridian);
  return data;
}

export async function updateMeridian(
  id: string,
  meridian: Partial<Meridian>
): Promise<Meridian> {
  const { data } = await apiClient.put(`/admin/meridians/${id}`, meridian);
  return data;
}

export async function deleteMeridian(id: string): Promise<void> {
  await apiClient.delete(`/admin/meridians/${id}`);
}

export default meridiansApi;
