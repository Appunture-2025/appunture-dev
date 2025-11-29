import { apiClient } from "./client";
import type { User, APIResponse } from "../types";

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/admin/users");
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data;
  },

  updateRole: async (id: string, role: "USER" | "ADMIN"): Promise<User> => {
    const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return data;
  },

  disable: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/disable`);
  },

  enable: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${id}/enable`);
  },
};

// Exported functions for backwards compatibility
export async function getUsers(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<APIResponse<User[]>> {
  const { data } = await apiClient.get("/admin/users", {
    params: { page, pageSize, search },
  });
  return data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  return data;
}

export async function updateUser(
  id: string,
  userData: Partial<User>
): Promise<User> {
  const { data } = await apiClient.patch(`/admin/users/${id}`, userData);
  return data;
}

export async function updateUserRole(
  id: string,
  role: "USER" | "ADMIN"
): Promise<User> {
  const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return data;
}

export default usersApi;
