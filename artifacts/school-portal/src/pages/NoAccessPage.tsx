import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NoAccessPage() {
  return (
    <div>
      <PageHeader title="No Access" description="Your current role does not allow this workspace area." />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold">This route is protected</div>
            <div className="mt-1 max-w-md text-sm text-muted-foreground">
              Switch to a tenant membership with the right role, or ask a school admin to update your access.
            </div>
          </div>
          <Button asChild variant="outline">
            <a href="/">Back to dashboard</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
