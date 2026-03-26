import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, "..", "..");

function parseEnvFile(content) {
  const parsed = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function applyEnvFile(filePath, { override = false } = {}) {
  if (!fs.existsSync(filePath)) return;

  const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (!override && process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
}

applyEnvFile(path.join(rootDir, ".env"), { override: false });
applyEnvFile(path.join(rootDir, ".env.local"), { override: true });

export function getScriptsRootDir() {
  return rootDir;
}
