import { Construction } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ModulePendingPage(props: { moduleName: string }) {
  return (
    <div>
      <PageHeader title={props.moduleName} description="This module is not enabled in the production foundation yet." />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Construction className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold">Coming after the core school loop is stable</div>
            <div className="mt-1 max-w-xl text-sm text-muted-foreground">
              This screen is intentionally locked so fake demo workflows do not confuse admins, teachers, students, or parents.
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
