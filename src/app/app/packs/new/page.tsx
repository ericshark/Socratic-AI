import { CreatePackForm } from "@/components/packs/create-pack-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPackPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Custom Question Pack</CardTitle>
          <CardDescription>Design your own Socratic flow. Pro feature placeholder.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePackForm />
        </CardContent>
      </Card>
    </div>
  );
}
