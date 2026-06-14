import { pool } from "../db/pool";

export async function getProjectIdByApiKey(
  apiKey: string
): Promise<string | null> {
  const result = await pool.query(
    `
    SELECT project_id
    FROM api_keys
    WHERE api_key = $1
    LIMIT 1
    `,
    [apiKey]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].project_id;
}