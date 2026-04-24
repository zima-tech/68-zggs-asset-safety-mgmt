import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const cwd = process.cwd();
const prismaDir = path.join(cwd, "prisma");
const schemaPath = path.join(prismaDir, "schema.prisma");
const dbPath = path.join(prismaDir, "dev.db");

function runPrisma(args, options = {}) {
  execFileSync("npx", ["prisma", ...args], {
    cwd,
    stdio: "inherit",
    ...options,
  });
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(prismaDir, { recursive: true });

  const sql = execFileSync(
    "npx",
    ["prisma", "migrate", "diff", "--from-empty", "--to-schema-datamodel", schemaPath, "--script"],
    { cwd, encoding: "utf8" },
  );
  const sqlPath = path.join(os.tmpdir(), `${path.basename(cwd)}-init.sql`);
  fs.writeFileSync(sqlPath, sql);
  runPrisma(["db", "execute", "--file", sqlPath, "--schema", schemaPath]);
} else {
  runPrisma(["db", "push", "--skip-generate"]);
}
