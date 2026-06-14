import { Router } from "express";
import { createProjectSchema } from "../schemas/projectSchema";
import {
  createApiKeyForProject,
  createProject,
  listApiKeysByProject,
  listProjects,
  projectExists,
} from "../store/projectStore";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const projects = await listProjects();

    res.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch projects",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Invalid project payload",
        details: result.error.flatten(),
      });
      return;
    }

    const project = await createProject(result.data);
    const apiKey = await createApiKeyForProject(project.id);

    res.status(201).json({
      message: "Project created",
      project,
      apiKey,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create project",
    });
  }
});

router.get("/:projectId/api-keys", async (req, res) => {
  try {
    const { projectId } = req.params;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const apiKeys = await listApiKeysByProject(projectId);

    res.json({
      projectId,
      count: apiKeys.length,
      apiKeys,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch API keys",
    });
  }
});

router.post("/:projectId/api-keys", async (req, res) => {
  try {
    const { projectId } = req.params;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const apiKey = await createApiKeyForProject(projectId);

    res.status(201).json({
      message: "API key created",
      apiKey,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create API key",
    });
  }
});

export default router;