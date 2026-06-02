import fs from "fs";
import path from "path";
import { pool } from "./pool";

async function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await pool.query(schema);

  console.log("Database initialized");

  await pool.end();
}

initDb().catch((error) => {
  console.error("Failed to initialize database");
  console.error(error);
  process.exit(1);
});