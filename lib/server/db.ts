import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    // Only create the file if it truly does not exist
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      // Check once more before writing to avoid race conditions
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, "[]", "utf8");
    }
  }
}

export async function readJsonArray<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataDir, filename);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // File doesn't exist yet — create it and return empty
    await ensureFile(filePath);
    return [];
  }
}

export async function writeJsonArray<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
