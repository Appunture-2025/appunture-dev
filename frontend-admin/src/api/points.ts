import { apiClient } from "./client";
import type { Point, APIResponse } from "../types";

export const pointsApi = {
  getAll: async (): Promise<Point[]> => {
    const { data } = await apiClient.get("/admin/points");
    return data;
  },

  getById: async (id: string): Promise<Point> => {
    const { data } = await apiClient.get(`/admin/points/${id}`);
    return data;
  },

  create: async (point: Omit<Point, "id">): Promise<Point> => {
    const { data } = await apiClient.post("/admin/points", point);
    return data;
  },

  update: async (id: string, point: Partial<Point>): Promise<Point> => {
    const { data } = await apiClient.put(`/admin/points/${id}`, point);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/points/${id}`);
  },

  search: async (query: string): Promise<Point[]> => {
    const { data } = await apiClient.get("/admin/points/search", {
      params: { q: query },
    });
    return data;
  },

  getByMeridian: async (meridianCode: string): Promise<Point[]> => {
    const { data } = await apiClient.get(
      `/admin/points/meridian/${meridianCode}`
    );
    return data;
  },
};

// Exported functions for backwards compatibility
export async function getPoints(
  page: number = 1,
  pageSize: number = 20
): Promise<APIResponse<Point[]>> {
  const { data } = await apiClient.get("/admin/points", {
    params: { page, pageSize },
  });
  return data;
}

export async function deletePoint(id: string): Promise<void> {
  await apiClient.delete(`/admin/points/${id}`);
}

export async function searchPoints(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<APIResponse<Point[]>> {
  const { data } = await apiClient.get("/admin/points/search", {
    params: { q: query, page, pageSize },
  });
  return data;
}

export async function getPointById(id: string): Promise<Point> {
  const { data } = await apiClient.get(`/admin/points/${id}`);
  return data;
}

export async function createPoint(point: Partial<Point>): Promise<Point> {
  const { data } = await apiClient.post("/admin/points", point);
  return data;
}

export async function updatePoint(
  id: string,
  point: Partial<Point>
): Promise<Point> {
  const { data } = await apiClient.put(`/admin/points/${id}`, point);
  return data;
}

export default pointsApi;
