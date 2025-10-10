import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsPreferences } from "@/components/settings/preferences";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Configure guardrails, integrations, and feature flags.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
          <CardDescription>Answer-delay, depth preferences, and voice capture flag.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-slate-500">Loading preferences…</p>}>
            <SettingsPreferences />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>OpenAI, Notion, Slack, Calendar — placeholders until you add env vars.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
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
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <span className={`text-xs font-semibold ${enabled ? "text-emerald-600" : "text-amber-600"}`}>
        {enabled ? "Configured" : "Missing"}
      </span>
    </div>
  );
}
