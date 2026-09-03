export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: unknown;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: "USER" | "ADMIN";
}

export interface AuthPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RepositoryIndexJob {
  id: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELED";
  progress: number;
  currentStep?: string | null;
  errorMessage?: string | null;
}

export interface RepositorySummary {
  id: string;
  name?: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  indexJobs?: RepositoryIndexJob[];
  files?: RepositoryFile[];
  commits?: RepositoryCommit[];
  branches?: RepositoryBranch[];
  architectureGraphs?: ArchitectureGraph[];
  documentation?: DocumentationArtifact[];
}

export interface RepositoryImportResult {
  repository: RepositorySummary;
  indexJob: RepositoryIndexJob;
}

export interface RepositoryFile {
  id: string;
  path: string;
  language?: string | null;
  extension?: string | null;
  sizeBytes: number;
  updatedAt: string;
}

export interface RepositoryCommit {
  id: string;
  sha: string;
  message: string;
  authorName?: string | null;
  authorEmail?: string | null;
  committedAt: string;
  summary?: string | null;
}

export interface RepositoryBranch {
  id: string;
  name: string;
  sha: string;
  protected: boolean;
}

export interface SearchResult {
  chunkId: string;
  fileId: string;
  path: string;
  language?: string | null;
  content: string;
  startLine: number;
  endLine: number;
  score: number;
}

export interface ChatAnswer {
  chatId: string;
  answer: string;
  citations: Array<{ path: string; startLine: number; endLine: number; score: number }>;
}

export interface DocumentationArtifact {
  id: string;
  type: "README" | "API" | "ARCHITECTURE" | "ONBOARDING";
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArchitectureGraph {
  id: string;
  name: string;
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ source: string; target: string; type: string }>;
  updatedAt: string;
}
