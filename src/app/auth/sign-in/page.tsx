import { redirect } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { auth, authProviders, signIn } from "@/server/auth";

const highlights = [
  {
    title: "Map the decision",
    description: "Capture assumptions, options, evidence, and risks in one view.",
  },
  {
    title: "Shared workspace",
    description: "Invite teammates to review and add perspective in real time.",
  },
  {
    title: "Stay accountable",
    description: "Schedule follow-ups so every call gets revisited on time.",
  },
];

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  const providers = authProviders;

  async function handleProviderSignIn(providerId: string, formData: FormData) {
    "use server";
    const provider = providers.find((item) => item.id === providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    if (provider.type === "email" || provider.type === "credentials") {
      const email = formData.get("email");
      if (!email || typeof email !== "string") {
        throw new Error("Email is required");
      }

      await signIn(providerId, { redirectTo: "/app", email: email.trim().toLowerCase() });
      return;
    }

    await signIn(providerId, { redirectTo: "/app" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-20 -z-10 size-96 rounded-full bg-gradient-to-br from-primary/35 via-sky-500/30 to-transparent blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-gradient-to-tr from-rose-500/25 via-primary/25 to-transparent blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-xl space-y-8">
          <Badge>Beta Access</Badge>
          <div className="space-y-5">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Intentional decisions start with better questions.
            </h1>
            <p className="text-lg text-white/70">
              Join Socratic to capture the thinking behind your calls, highlight the unknowns, and keep momentum between working sessions.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-sm font-semibold text-white/80">{item.title}</p>
                <p className="mt-2 text-xs text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="w-full max-w-lg border-white/15 bg-card/80">
          <CardHeader className="space-y-4 p-8 pb-4 text-left">
            <CardTitle className="text-2xl font-semibold text-white">Sign in to Socratic</CardTitle>
            <CardDescription className="text-base text-white/65">
              Choose your workspace provider. We’ll guide you straight into your open decisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-4">
            {providers.length > 0 ? (
              providers.map((provider) => (
                <div key={provider.id} className="space-y-2">
                  <form action={handleProviderSignIn.bind(null, provider.id)} className="space-y-3">
                    {provider.type === "email" || provider.type === "credentials" ? (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50" htmlFor={`email-${provider.id}`}>
                          Work email
                        </label>
                        <Input
                          id={`email-${provider.id}`}
                          name="email"
                          type="email"
                          placeholder="you@team.com"
                          required
                          className="bg-white/10 text-white placeholder:text-white/50"
                        />
                      </div>
                    ) : null}
                    {provider.defaults?.email ? (
                      <input type="hidden" name="email" value={provider.defaults.email} />
                    ) : null}
                    <Button type="submit" size="lg" className="w-full">
                      Continue with {provider.name}
                    </Button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/70">
                No providers configured. Add authentication credentials in Settings → Integrations.
              </p>
            )}

            <Separator className="opacity-70" />
            <div className="text-xs text-white/60">
              Need an invite? {" "}
              <Link href="mailto:coach@socratic.local" className="font-semibold text-white hover:text-white">
                Contact the Socratic team
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
