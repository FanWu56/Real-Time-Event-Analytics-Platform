import { Router, Response } from "express"
import { eventSchema } from "../schemas/eventSchema"
import { addEvent, getEvents, getEventsByProject } from "../store/eventStore"
import { apiKeyAuth, AuthenticatedRequest } from "../middleware/apiKeyAuth"
import { rateLimitByApiKey } from "../middleware/rateLimit"
import {
  getAggregatesByProject,
  getAggregatesByProjectAndEventName,
  recordEventAggregate,
} from "../store/aggregateStore";

const router = Router()

// set middleware keyAuth, rateLimit
router.post("/", apiKeyAuth, rateLimitByApiKey, (req: AuthenticatedRequest, res: Response) => {
    const result = eventSchema.safeParse(req.body)

    if (!result.success){
        res.status(400).json({
            error: "Invalid event payload"
        })
        return
    }
    // add ! here to ensure that projectId is string
    const event = addEvent(result.data, req.projectId!)
    const aggregate = recordEventAggregate(event);

    res.status(201).json({
    message: "Event accepted",
    event,
    aggregate

    })
})

router.get("/", (req, res) => {
  const events = getEvents();

  res.json({
    count: events.length,
    events,
  })
})

router.get("/project/:projectId/metrics", (req, res) => {
  const { projectId } = req.params;
  const eventName = req.query.eventName as string | undefined;

  const aggregates = eventName
    ? getAggregatesByProjectAndEventName(projectId, eventName)
    : getAggregatesByProject(projectId);

  res.json({
    projectId,
    eventName: eventName ?? "all",
    count: aggregates.length,
    metrics: aggregates,
  });
});

export default router;

