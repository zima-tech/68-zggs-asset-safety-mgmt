import fs from "node:fs";
import path from "node:path";

const SQLITE_PREFIX = "file:";
const DEFAULT_SQLITE_PATH = path.join("prisma", "dev.db");

function resolveLocalSqlitePath(rawUrl: string) {
  const filePath = rawUrl.slice(SQLITE_PREFIX.length);

  if (!filePath || filePath === ":memory:") {
    return null;
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  const normalized = filePath.replace(/^\.\//, "");
  const cwdCandidate = path.resolve(process.cwd(), normalized);

  if (fs.existsSync(cwdCandidate)) {
    return cwdCandidate;
  }

  return path.resolve(process.cwd(), "prisma", normalized || "dev.db");
}

function ensureVercelWritableDatabase(sourcePath: string) {
  if (!process.env.VERCEL) {
    return sourcePath;
  }

  const runtimeDir = path.join("/tmp", path.basename(process.cwd()), "prisma");
  const runtimePath = path.join(runtimeDir, path.basename(sourcePath));

  if (!fs.existsSync(runtimePath)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.copyFileSync(sourcePath, runtimePath);
  }

  return runtimePath;
}

export function resolvePrismaDatasourceUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.startsWith(SQLITE_PREFIX)) {
    return databaseUrl;
  }

  const bundledPath =
    resolveLocalSqlitePath(databaseUrl) ?? path.resolve(process.cwd(), DEFAULT_SQLITE_PATH);
  const runtimePath = ensureVercelWritableDatabase(bundledPath);

  return `${SQLITE_PREFIX}${runtimePath}`;
}
