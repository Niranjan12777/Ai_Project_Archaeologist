import axios from "axios";
import { AppError } from "../utils/app-error.js";

interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
  description: string | null;
  private: boolean;
  clone_url: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export class GitHubService {
  async fetchRepository(fullName: string, token?: string): Promise<GitHubRepositoryResponse> {
    try {
      const response = await axios.get<GitHubRepositoryResponse>(
        `https://api.github.com/repos/${fullName}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        }
      );
      return response.data;
    } catch {
      throw new AppError("Unable to fetch repository from GitHub", 502);
    }
  }
}
