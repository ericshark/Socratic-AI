import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth, signOut } from "@/server/auth";

const navItems = [
  { href: "/app", label: "Decisions" },
  { href: "/app/packs", label: "Question Packs" },
  { href: "/app/teams", label: "Teams" },
  { href: "/app/reviews", label: "Reviews" },
  { href: "/app/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-hero-grid opacity-80" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_55%)]" aria-hidden />

      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-white/10 backdrop-blur-2xl">
          <div className="container-tight flex h-16 items-center justify-between">
            <Link href="/app" className="text-lg font-semibold tracking-tight text-white">
              Socratic
            </Link>
            <nav className="flex items-center gap-3 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <form action={handleSignOut}>
                <Button variant="ghost" type="submit" className="rounded-full border border-white/10 px-4 py-2 text-white/70 hover:border-white/30 hover:text-white">
                  Sign out
                </Button>
              </form>
            </nav>
          </div>
        </header>

        <main className="container-tight flex flex-1 flex-col gap-8 py-10">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Signed in</p>
              <p className="text-base font-medium text-white/80">{session.user.email}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>Stay curious. Ask sharper questions.</span>
            </div>
          </div>
          <Separator className="opacity-60" />
          <div className="pb-16">{children}</div>
        </main>
      </div>
    </div>
  );
}
