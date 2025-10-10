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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Review Queue</h1>
        <p className="text-sm text-slate-600">Follow-through beats decisions that drift. Schedule check-ins here.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reviews</CardTitle>
          <CardDescription>Export to calendar via Settings → Integrations (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{reminder.decision.title}</p>
              <p className="text-xs text-slate-500">Review on {reminder.reviewAt.toLocaleDateString()}</p>
            </div>
          ))}
          {reminders.length === 0 && <p className="text-xs text-slate-500">No reviews scheduled yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
