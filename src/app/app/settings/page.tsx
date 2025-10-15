import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsPreferences } from "@/components/settings/preferences";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-white/65">Configure guardrails and workspace defaults.</p>
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

    </div>
  );
}
