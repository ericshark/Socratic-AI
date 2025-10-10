import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

export default async function ReviewsPage() {
  const session = await auth();
  const reminders = await prisma.reviewReminder.findMany({
    where: {
      decision: {
        userId: session?.user?.id,
      },
    },
    orderBy: { reviewAt: "asc" },
    include: {
      decision: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Review Queue</h1>
        <p className="text-sm text-white/65">Follow-through beats decisions that drift. Schedule check-ins here.</p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Upcoming Reviews</CardTitle>
          <CardDescription className="text-sm text-white/70">
            Export to calendar via Settings → Integrations (placeholder).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/70">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="font-medium text-white">{reminder.decision.title}</p>
              <p className="text-xs text-white/50">Review on {reminder.reviewAt.toLocaleDateString()}</p>
            </div>
          ))}
          {reminders.length === 0 && <p className="text-xs text-white/50">No reviews scheduled yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
