import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ArchitectureGraph,
  ChatAnswer,
  DocumentationArtifact,
  RepositoryImportResult,
  RepositorySummary,
  SearchResult
} from "@/types/api";

export const repositoryService = {
  async list(): Promise<RepositorySummary[]> {
    const response = await apiClient.get<ApiResponse<RepositorySummary[]>>("/repositories");
    return response.data.data;
  },

  async get(id: string): Promise<RepositorySummary> {
    const response = await apiClient.get<ApiResponse<RepositorySummary>>(`/repositories/${id}`);
    return response.data.data;
  },

  async import(fullName: string): Promise<RepositoryImportResult> {
    const response = await apiClient.post<ApiResponse<RepositoryImportResult>>("/repositories", { fullName });
    return response.data.data;
  },

  async reindex(id: string): Promise<RepositoryImportResult> {
    const response = await apiClient.post<ApiResponse<RepositoryImportResult>>(`/repositories/${id}/reindex`);
    return response.data.data;
  },

  async sync(id: string): Promise<RepositoryImportResult> {
    const response = await apiClient.post<ApiResponse<RepositoryImportResult>>(`/repositories/${id}/sync`);
    return response.data.data;
  },

  async delete(id: string): Promise<RepositorySummary> {
    const response = await apiClient.delete<ApiResponse<RepositorySummary>>(`/repositories/${id}`);
    return response.data.data;
  },

  async search(id: string, query: string): Promise<SearchResult[]> {
    const response = await apiClient.get<ApiResponse<SearchResult[]>>(`/repositories/${id}/search`, {
      params: { q: query }
    });
    return response.data.data;
  },

  async ask(id: string, input: { question: string; chatId?: string }): Promise<ChatAnswer> {
    const response = await apiClient.post<ApiResponse<ChatAnswer>>(`/repositories/${id}/chat`, input);
    return response.data.data;
  },

  async architecture(id: string): Promise<ArchitectureGraph> {
    const response = await apiClient.get<ApiResponse<ArchitectureGraph>>(`/repositories/${id}/architecture`);
    return response.data.data;
  },

  async documentation(id: string): Promise<DocumentationArtifact[]> {
    const response = await apiClient.get<ApiResponse<DocumentationArtifact[]>>(`/repositories/${id}/documentation`);
    return response.data.data;
  },

  async generateDocumentation(id: string, type: DocumentationArtifact["type"]): Promise<DocumentationArtifact> {
    const response = await apiClient.post<ApiResponse<DocumentationArtifact>>(`/repositories/${id}/documentation`, { type });
    return response.data.data;
  }
};
