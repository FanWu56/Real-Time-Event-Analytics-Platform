import { Router } from "express";
import {
  getAnalyticsSummary,
  getRecentEvents,
  getTimeSeries,
  getTopEvents,
} from "../store/analyticsStore";
import { projectExists } from "../store/projectStore";

const router = Router();

router.get("/:projectId/analytics/summary", async (req, res) => {
  try {
    const { projectId } = req.params;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const summary = await getAnalyticsSummary(projectId);

    res.json({
      projectId,
      summary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch analytics summary",
    });
  }
});

router.get("/:projectId/analytics/top-events", async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const events = await getTopEvents(projectId, limit);

    res.json({
      projectId,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch top events",
    });
  }
});

router.get("/:projectId/analytics/recent-events", async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const events = await getRecentEvents(projectId, limit);

    res.json({
      projectId,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch recent events",
    });
  }
});

router.get("/:projectId/analytics/timeseries", async (req, res) => {
  try {
    const { projectId } = req.params;
    const eventName = req.query.eventName as string | undefined;

    const exists = await projectExists(projectId);

    if (!exists) {
      res.status(404).json({
        error: "Project not found",
      });
      return;
    }

    const points = await getTimeSeries(projectId, eventName);

    res.json({
      projectId,
      eventName: eventName ?? "all",
      count: points.length,
      points,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch time series",
    });
  }
});

export default router;