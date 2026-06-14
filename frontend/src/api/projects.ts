import { apiClient } from "./client";
import { ApiKey, Project } from "../types/analytics";

export async function fetchProjects(): Promise<Project[]> {
  const response = await apiClient.get("/api/projects");
  return response.data.projects;
}

export async function createProject(name: string): Promise<{
  project: Project;
  apiKey: ApiKey;
}> {
  const response = await apiClient.post("/api/projects", { name });
  return {
    project: response.data.project,
    apiKey: response.data.apiKey,
  };
}

export async function fetchProjectApiKeys(
  projectId: string
): Promise<ApiKey[]> {
  const response = await apiClient.get(`/api/projects/${projectId}/api-keys`);
  return response.data.apiKeys;
}