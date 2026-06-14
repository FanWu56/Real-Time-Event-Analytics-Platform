import { StoredEvent } from "./eventStore";
import { pool } from "../db/pool";

export type TimeWindowAggregate = {
  projectId: string;
  eventName: string;
  windowStart: string;
  windowEnd: string;
  count: number;
};

const WINDOW_MS = 60 * 1000;

function getMinuteWindow(dateString: string) {
  const date = new Date(dateString);

  const windowStartMs = Math.floor(date.getTime() / WINDOW_MS) * WINDOW_MS;
  const windowEndMs = windowStartMs + WINDOW_MS;

  return {
    windowStart: new Date(windowStartMs).toISOString(),
    windowEnd: new Date(windowEndMs).toISOString(),
  };
}

function mapAggregateRow(row: any): TimeWindowAggregate {
  return {
    projectId: row.project_id,
    eventName: row.event_name,
    windowStart: row.window_start.toISOString(),
    windowEnd: row.window_end.toISOString(),
    count: Number(row.count),
  };
}

export async function recordEventAggregate(
  event: StoredEvent
): Promise<TimeWindowAggregate> {
  const { windowStart, windowEnd } = getMinuteWindow(event.timestamp);

  const result = await pool.query(
    `
    INSERT INTO event_aggregates (
      project_id,
      event_name,
      window_start,
      window_end,
      count
    )
    VALUES ($1, $2, $3, $4, 1)
    ON CONFLICT (project_id, event_name, window_start)
    DO UPDATE SET
      count = event_aggregates.count + 1,
      updated_at = NOW()
    RETURNING *
    `,
    [event.projectId, event.eventName, windowStart, windowEnd]
  );

  return mapAggregateRow(result.rows[0]);
}

export async function getAggregatesByProject(
  projectId: string
): Promise<TimeWindowAggregate[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM event_aggregates
    WHERE project_id = $1
    ORDER BY window_start ASC, event_name ASC
    `,
    [projectId]
  );

  return result.rows.map(mapAggregateRow);
}

export async function getAggregatesByProjectAndEventName(
  projectId: string,
  eventName: string
): Promise<TimeWindowAggregate[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM event_aggregates
    WHERE project_id = $1
      AND event_name = $2
    ORDER BY window_start ASC
    `,
    [projectId, eventName]
  );

  return result.rows.map(mapAggregateRow);
}