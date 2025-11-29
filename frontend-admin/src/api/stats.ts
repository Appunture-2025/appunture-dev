import { apiClient } from "./client";
import type { Stats } from "../types";

export const statsApi = {
  getStats: async (): Promise<Stats> => {
    const { data } = await apiClient.get("/admin/stats");
    return data;
  },

  getRecentActivity: async (
    limit: number = 10
  ): Promise<Stats["recentActivity"]> => {
    const { data } = await apiClient.get("/admin/activity", {
      params: { limit },
    });
    return data;
  },
};

// Exported functions for backwards compatibility
export async function getStats(): Promise<Stats> {
  const { data } = await apiClient.get("/admin/stats");
  return data;
}

export async function getRecentActivity(
  limit: number = 10
): Promise<Stats["recentActivity"]> {
  const { data } = await apiClient.get("/admin/activity", {
    params: { limit },
  });
  return data;
}

export default statsApi;
