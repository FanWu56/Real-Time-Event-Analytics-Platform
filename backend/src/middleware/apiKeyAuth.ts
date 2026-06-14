import { NextFunction, Request, Response } from "express";
import { getProjectIdByApiKey } from "../store/apiKeyStore";

export type AuthenticatedRequest = Request & {
  projectId?: string;
  apiKey?: string;
};

export async function apiKeyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      res.status(401).json({
        error: "Missing API key",
      });
      return;
    }

    const projectId = await getProjectIdByApiKey(apiKey);

    if (!projectId) {
      res.status(403).json({
        error: "Invalid API key",
      });
      return;
    }

    req.apiKey = apiKey;
    req.projectId = projectId;

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to authenticate API key",
    });
  }
}