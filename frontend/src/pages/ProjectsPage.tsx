import { FormEvent, useEffect, useState } from "react";
import { createProject, fetchProjects } from "../api/projects";
import { ApiKey, Project } from "../types/analytics";

type ProjectsPageProps = {
  onSelectProject: (project: Project) => void;
};

export function ProjectsPage({ onSelectProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [latestApiKey, setLatestApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(event: FormEvent) {
    event.preventDefault();

    const trimmedName = projectName.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const result = await createProject(trimmedName);

      setProjects((currentProjects) => [
        result.project,
        ...currentProjects,
      ]);

      setLatestApiKey(result.apiKey);
      setProjectName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Event Analytics Platform</p>
          <h1>Projects</h1>
          <p className="muted">
            Create a project, generate an API key, and start sending events.
          </p>
        </div>

        <button className="secondary-button" onClick={loadProjects}>
          Refresh
        </button>
      </div>

      <form className="card create-form" onSubmit={handleCreateProject}>
        <div>
          <h2>Create Project</h2>
          <p className="muted">Each project has its own API keys and events.</p>
        </div>

        <div className="form-row">
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="My Website"
          />

          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {latestApiKey && (
        <div className="card success-card">
          <h2>New API Key</h2>
          <p className="muted">
            Save this key. You can use it to send events to the backend.
          </p>

          <code>{latestApiKey.apiKey}</code>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        <div className="section-header">
          <h2>Project List</h2>
          <span>{projects.length} projects</span>
        </div>

        {isLoading ? (
          <p className="muted">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="muted">No projects yet. Create your first project.</p>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <button
                key={project.id}
                className="project-item"
                onClick={() => onSelectProject(project)}
              >
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.id}</p>
                </div>

                <span>Open Dashboard →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}