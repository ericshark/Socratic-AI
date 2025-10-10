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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b bg-white">
        <header className="container-tight flex h-16 items-center justify-between">
          <Link href="/app" className="font-semibold tracking-tight">
            Socratic
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ))}
            <form action={handleSignOut}>
              <Button variant="ghost" type="submit" className="text-sm text-slate-500">
                Sign out
              </Button>
            </form>
          </nav>
        </header>
      </div>
      <main className="container-tight flex flex-1 flex-col gap-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Signed in as</p>
            <p className="text-sm font-medium text-slate-700">{session.user.email}</p>
          </div>
        </div>
        <Separator />
        <div className="pb-16">{children}</div>
      </main>
    </div>
  );
}
