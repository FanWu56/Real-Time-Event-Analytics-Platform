import { randomUUID } from "crypto";
import { EventInput } from "../schemas/eventSchema";
import { pool } from "../db/pool";

export type StoredEvent = {
  id: string;
  projectId: string;
  eventName: string;
  userId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
  receivedAt: string;
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

export async function addEvent(
  input: EventInput,
  projectId: string
): Promise<StoredEvent> {
  const now = new Date().toISOString();

  const result = await pool.query(
    `
    INSERT INTO events (
      id,
      project_id,
      event_name,
      user_id,
      properties,
      timestamp,
      received_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      randomUUID(),
      projectId,
      input.eventName,
      input.userId ?? null,
      JSON.stringify(input.properties ?? {}),
      input.timestamp ?? now,
      now,
    ]
  );

  return mapEventRow(result.rows[0]);
}

export async function getEvents(): Promise<StoredEvent[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM events
    ORDER BY received_at DESC
    LIMIT 100
    `
  );

  return result.rows.map(mapEventRow);
}

export async function getEventsByProject(
  projectId: string
): Promise<StoredEvent[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM events
    WHERE project_id = $1
    ORDER BY received_at DESC
    LIMIT 100
    `,
    [projectId]
  );

  return result.rows.map(mapEventRow);
}