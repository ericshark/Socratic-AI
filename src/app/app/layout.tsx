import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/server/auth";

const navItems = [
  { href: "/app", label: "Workspace" },
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-white/10 bg-white/5">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/app" className="text-base font-semibold tracking-tight text-white">
            Socratic
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <form action={handleSignOut}>
              <Button variant="ghost" type="submit" className="rounded-full px-4 py-2 text-white/70 hover:text-white">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Signed in as</p>
          <p className="text-base font-medium text-white/80">{session.user.email}</p>
          <p className="text-sm text-white/60">Capture what you know, note what’s missing, and keep decisions moving.</p>
        </div>
        <div className="pb-16">{children}</div>
      </main>
    </div>
  );
}
