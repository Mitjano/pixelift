import fs from "fs/promises";
import path from "path";

const VIEWS_FILE = path.join(process.cwd(), "data", "blog-views.json");

interface BlogViews {
  [slug: string]: number;
}

async function ensureViewsFile(): Promise<BlogViews> {
  try {
    const content = await fs.readFile(VIEWS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    // File doesn't exist, create it
    await fs.writeFile(VIEWS_FILE, JSON.stringify({}, null, 2));
    return {};
  }
}

export async function incrementViews(slug: string): Promise<number> {
  const views = await ensureViewsFile();
  views[slug] = (views[slug] || 0) + 1;
  await fs.writeFile(VIEWS_FILE, JSON.stringify(views, null, 2));
  return views[slug];
}

export async function getViews(slug: string): Promise<number> {
  const views = await ensureViewsFile();
  return views[slug] || 0;
}

export async function getAllViews(): Promise<BlogViews> {
  return ensureViewsFile();
}
