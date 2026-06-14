import { useState } from "react";
import "./App.css";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import type { Project } from "./types/analytics";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (selectedProject) {
    return (
      <DashboardPage
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return <ProjectsPage onSelectProject={setSelectedProject} />;
}

export default App;