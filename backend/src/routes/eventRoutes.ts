import { Router, Response } from "express";
import { eventSchema } from "../schemas/eventSchema";
import { addEvent, getEvents, getEventsByProject } from "../store/eventStore";
import { apiKeyAuth, AuthenticatedRequest } from "../middleware/apiKeyAuth";
import { rateLimitByApiKey } from "../middleware/rateLimit";
import {
  getAggregatesByProject,
  getAggregatesByProjectAndEventName,
  recordEventAggregate,
} from "../store/aggregateStore";
import { emitProjectEvent } from "../websocket/liveSocket";

const router = Router();

router.post(
  "/",
  apiKeyAuth,
  rateLimitByApiKey,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = eventSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          error: "Invalid event payload",
          details: result.error.flatten(),
        });
        return;
      }

      const projectId = req.projectId;

      if (!projectId) {
        res.status(500).json({
          error: "Project ID missing after authentication",
        });
        return;
      }

      const event = await addEvent(result.data, projectId);
      const aggregate = await recordEventAggregate(event);
      emitProjectEvent(projectId, event, aggregate);

      res.status(201).json({
        message: "Event accepted",
        event,
        aggregate,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Failed to store event",
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const events = await getEvents();

    res.json({
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch events",
    });
  }
});

router.get("/project/:projectId/metrics", async (req, res) => {
  try {
    const { projectId } = req.params;
    const eventName = req.query.eventName as string | undefined;

    const aggregates = eventName
      ? await getAggregatesByProjectAndEventName(projectId, eventName)
      : await getAggregatesByProject(projectId);

    res.json({
      projectId,
      eventName: eventName ?? "all",
      count: aggregates.length,
      metrics: aggregates,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch metrics",
    });
  }
});

router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const events = await getEventsByProject(projectId);

    res.json({
      projectId,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch project events",
    });
  }
});

export default router;