const fs = require("node:fs/promises");
const path = require("node:path");

const dataDir = path.join(__dirname, "..", "..", "data");

async function ensureFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "[]", "utf8");
  }
  return filePath;
}

async function readJsonArray(fileName) {
  const filePath = await ensureFile(fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

async function writeJsonArray(fileName, data) {
  const filePath = await ensureFile(fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = {
  readJsonArray,
  writeJsonArray,
  createId,
};
