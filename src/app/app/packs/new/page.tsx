import { CreatePackForm } from "@/components/packs/create-pack-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPackPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <Card className="border-white/15 bg-card/85">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl text-white">Custom question pack</CardTitle>
          <CardDescription className="text-white/70">
            Design your own Socratic flow. Pro feature placeholder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CreatePackForm />
        </CardContent>
      </Card>
    </div>
  );
}
