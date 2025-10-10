export async function exportBriefToNotion(brief: { title: string; markdown: string }) {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Missing NOTION_TOKEN (PLACEHOLDER). Set .env or disable Notion export in settings.");
  }

  // TODO(PLACEHOLDER): Implement Notion page creation logic.
  throw new Error("Notion export not yet implemented. Configure NOTION_TOKEN and implement export logic.");
}
