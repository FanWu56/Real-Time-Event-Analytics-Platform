import { pool } from "../db/pool";
import { StoredEvent } from "./eventStore";

export type AnalyticsSummary = {
  totalEvents: number;
  uniqueUsers: number;
  eventTypes: number;
  lastEventAt: string | null;
};

export type TopEvent = {
  eventName: string;
  count: number;
};

export type TimeSeriesPoint = {
  eventName: string;
  windowStart: string;
  windowEnd: string;
  count: number;
};

function mapEventRow(row: any): StoredEvent {
  return {
    id: row.id,
    projectId: row.project_id,
    eventName: row.event_name,
    userId: row.user_id ?? undefined,
    properties: row.properties ?? {},
    timestamp: row.timestamp.toISOString(),
    receivedAt: row.received_at.toISOString(),
  };
}

export async function getAnalyticsSummary(
  projectId: string
): Promise<AnalyticsSummary> {
  const result = await pool.query(
    `
    SELECT
      COUNT(*)::int AS total_events,
      COUNT(DISTINCT user_id)::int AS unique_users,
      COUNT(DISTINCT event_name)::int AS event_types,
      MAX(received_at) AS last_event_at
    FROM events
    WHERE project_id = $1
    `,
    [projectId]
  );

  const row = result.rows[0];

  return {
    totalEvents: Number(row.total_events),
    uniqueUsers: Number(row.unique_users),
    eventTypes: Number(row.event_types),
    lastEventAt: row.last_event_at
      ? row.last_event_at.toISOString()
      : null,
  };
}

export async function getTopEvents(
  projectId: string,
  limit = 10
): Promise<TopEvent[]> {
  const result = await pool.query(
    `
    SELECT
      event_name,
      COUNT(*)::int AS count
    FROM events
    WHERE project_id = $1
    GROUP BY event_name
    ORDER BY count DESC
    LIMIT $2
    `,
    [projectId, limit]
  );

  return result.rows.map((row) => ({
    eventName: row.event_name,
    count: Number(row.count),
  }));
}

export async function getRecentEvents(
  projectId: string,
  limit = 20
): Promise<StoredEvent[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM events
    WHERE project_id = $1
    ORDER BY received_at DESC
    LIMIT $2
    `,
    [projectId, limit]
  );

  return result.rows.map(mapEventRow);
}

export async function getTimeSeries(
  projectId: string,
  eventName?: string
): Promise<TimeSeriesPoint[]> {
  const values: unknown[] = [projectId];

  let query = `
    SELECT
      event_name,
      window_start,
      window_end,
      count
    FROM event_aggregates
    WHERE project_id = $1
  `;

  if (eventName) {
    values.push(eventName);
    query += ` AND event_name = $2 `;
  }

  query += `
    ORDER BY window_start ASC, event_name ASC
  `;

  const result = await pool.query(query, values);

  return result.rows.map((row) => ({
    eventName: row.event_name,
    windowStart: row.window_start.toISOString(),
    windowEnd: row.window_end.toISOString(),
    count: Number(row.count),
  }));
}