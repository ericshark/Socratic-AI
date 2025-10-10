import { getProviders } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, signIn } from "@/server/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  const providers = await getProviders();

  async function handleProviderSignIn(providerId: string) {
    "use server";
    await signIn(providerId, { redirectTo: "/app" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <Card className="w-full max-w-md border-white/10 bg-slate-900/80 text-white">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">Welcome to Socratic</CardTitle>
          <CardDescription className="text-white/70">
            Sign in to unlock guided decision flows and team heatmaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers ? (
            Object.values(providers).map((provider) => (
              <form key={provider.id} action={handleProviderSignIn.bind(null, provider.id)}>
                <Button type="submit" className="w-full">
                  Continue with {provider.name}
                </Button>
              </form>
            ))
          ) : (
            <p className="text-sm text-white/70">
              No providers configured. Add Email or Google credentials in Settings → Integrations.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-xs text-white/60">
          <p>
            Need an invite? <Link href="mailto:coach@socratic.local" className="underline">Contact Socratic</Link>
          </p>
          <p>Magic links require EMAIL_SERVER_* env values (placeholder).</p>
        </CardFooter>
      </Card>
    </div>
  );
}
