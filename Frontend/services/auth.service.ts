import { apiClient } from "@/lib/api-client";
import type { ApiResponse, AuthPayload } from "@/types/api";

export const authService = {
  async login(input: { email: string; password: string }): Promise<AuthPayload> {
    const response = await apiClient.post<ApiResponse<AuthPayload>>("/auth/login", input);
    return response.data.data;
  },

  async register(input: { email: string; name?: string; password: string }): Promise<AuthPayload> {
    const response = await apiClient.post<ApiResponse<AuthPayload>>("/auth/register", input);
    return response.data.data;
  }
};
