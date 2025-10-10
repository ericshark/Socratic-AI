"use client";

import { usePreferencesStore } from "@/store/preferences-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const depthOptions = [
  { value: "quick", label: "Quick" },
  { value: "standard", label: "Standard" },
  { value: "deep", label: "Deep" },
] as const;

export function SettingsPreferences() {
  const answerDelayEnabled = usePreferencesStore((state) => state.answerDelayEnabled);
  const toggleAnswerDelay = usePreferencesStore((state) => state.toggleAnswerDelay);
  const defaultDepth = usePreferencesStore((state) => state.defaultDepth);
  const setDefaultDepth = usePreferencesStore((state) => state.setDefaultDepth);
  const enableVoiceCapture = usePreferencesStore((state) => state.enableVoiceCapture);
  const toggleVoiceCapture = usePreferencesStore((state) => state.toggleVoiceCapture);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
        <div>
          <p className="font-medium text-slate-900">Answer-Delay guard</p>
          <p className="text-xs text-slate-500">
            Prevents reveal until assumptions, alternatives, and risks hit thresholds.
          </p>
        </div>
        <Switch checked={answerDelayEnabled} onCheckedChange={(checked) => toggleAnswerDelay(checked)} />
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">Default depth</p>
        <p className="text-xs text-slate-500">Choose the default flow intensity for new decisions.</p>
        <Tabs defaultValue={defaultDepth} className="mt-3">
          <TabsList>
            {depthOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value} onClick={() => setDefaultDepth(option.value)}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {depthOptions.map((option) => (
            <TabsContent key={option.value} value={option.value}>
              <p className="text-xs text-slate-500">
                {option.value === "quick"
                  ? "6 core prompts to frame a decision quickly."
                  : option.value === "standard"
                    ? "Balanced workflow with guardrails before reveal."
                    : "Expanded questioning with critic and mapper loops."}
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
        <div>
          <p className="font-medium text-slate-900">Voice capture (placeholder)</p>
          <p className="text-xs text-slate-500">
            Record quick notes in the problem pane. Requires browser permission (feature flagged).
          </p>
        </div>
        <Switch checked={enableVoiceCapture} onCheckedChange={(checked) => toggleVoiceCapture(checked)} />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          toggleAnswerDelay(true);
          setDefaultDepth("standard");
          toggleVoiceCapture(false);
        }}
      >
        Reset to defaults
      </Button>
    </div>
  );
}
