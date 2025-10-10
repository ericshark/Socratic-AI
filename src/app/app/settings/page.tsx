import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsPreferences } from "@/components/settings/preferences";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-white/65">Configure guardrails, integrations, and feature flags.</p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Defaults</CardTitle>
          <CardDescription className="text-sm text-white/70">
            Answer-delay, depth preferences, and voice capture flag.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-white/60">Loading preferences…</p>}>
            <SettingsPreferences />
          </Suspense>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Integrations</CardTitle>
          <CardDescription className="text-sm text-white/70">
            OpenAI, Notion, Slack, Calendar — placeholders until you add env vars.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/70">
          <IntegrationStatus
            envKey="OPENAI_API_KEY"
            label="OpenAI"
            description="Used for live Question Engine. Mock adapter otherwise."
          />
          <IntegrationStatus
            envKey="NOTION_TOKEN"
            label="Notion"
            description="Required for exporting briefs."
          />
          <IntegrationStatus
            envKey="SLACK_BOT_TOKEN"
            label="Slack"
            description="Share decision summaries in a channel."
          />
          <IntegrationStatus
            envKey="EMAIL_SERVER_HOST"
            label="Email Magic Links"
            description="Configure SMTP to enable passwordless login."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationStatus({
  envKey,
  label,
  description,
}: {
  envKey: string;
  label: string;
  description: string;
}) {
  const enabled = Boolean(process.env[envKey]);
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-white/55">{description}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
          enabled ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"
        }`}
      >
        {enabled ? "Configured" : "Missing"}
      </span>
    </div>
  );
}
