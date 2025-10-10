export async function postDecisionSummary(channelId: string, summary: string) {
  if (!process.env.SLACK_BOT_TOKEN) {
    throw new Error("Missing SLACK_BOT_TOKEN (PLACEHOLDER). Set .env or disable Slack export in settings.");
  }

  // TODO(PLACEHOLDER): Implement Slack API call.
  throw new Error("Slack integration not yet implemented. Configure SLACK_BOT_TOKEN and implement posting logic.");
}
