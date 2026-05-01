import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

async function ensureFile(filePath: string) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "[]", "utf8");
  }
}

export async function readJsonArray<T>(filename: string): Promise<T[]> {
  const filePath = path.join(dataDir, filename);
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeJsonArray<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(dataDir, filename);
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
