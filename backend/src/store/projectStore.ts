import { randomBytes, randomUUID } from "crypto";
import { pool } from "../db/pool";
import { CreateProjectInput } from "../schemas/projectSchema";

export type Project = {
  id: string;
  name: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  projectId: string;
  apiKey: string;
  createdAt: string;
};

function mapProjectRow(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapApiKeyRow(row: any): ApiKey {
  return {
    id: row.id,
    projectId: row.project_id,
    apiKey: row.api_key,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listProjects(): Promise<Project[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM projects
    ORDER BY created_at DESC
    `
  );

  return result.rows.map(mapProjectRow);
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const result = await pool.query(
    `
    INSERT INTO projects (id, name)
    VALUES ($1, $2)
    RETURNING *
    `,
    [randomUUID(), input.name]
  );

  return mapProjectRow(result.rows[0]);
}

export async function createApiKeyForProject(
  projectId: string
): Promise<ApiKey> {
  const apiKey = `pk_test_${randomBytes(24).toString("hex")}`;

  const result = await pool.query(
    `
    INSERT INTO api_keys (id, project_id, api_key)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [randomUUID(), projectId, apiKey]
  );

  return mapApiKeyRow(result.rows[0]);
}

export async function listApiKeysByProject(
  projectId: string
): Promise<ApiKey[]> {
  const result = await pool.query(
    `
    SELECT *
    FROM api_keys
    WHERE project_id = $1
    ORDER BY created_at DESC
    `,
    [projectId]
  );

  return result.rows.map(mapApiKeyRow);
}

export async function projectExists(projectId: string): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT id
    FROM projects
    WHERE id = $1
    LIMIT 1
    `,
    [projectId]
  );

  return result.rows.length > 0;
}