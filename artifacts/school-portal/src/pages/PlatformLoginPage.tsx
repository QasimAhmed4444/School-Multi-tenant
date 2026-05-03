import React from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/domains/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlatformLoginPage() {
  const { signIn, authError } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      window.localStorage.removeItem("preferredTenantCode");
      await signIn(email, password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Platform login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1fr_420px]">
        <section className="hidden flex-col justify-between px-10 py-12 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-semibold">Vertexa School Platform</div>
              <div className="text-sm text-muted-foreground">Platform control plane</div>
            </div>
          </div>

          <div className="max-w-xl space-y-5">
            <div className="inline-flex rounded-full border bg-white px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
              Super Admin Access
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Manage organizations, schools, admin seats, and tenant operations from one secure place.
            </h1>
            <p className="text-lg text-muted-foreground">
              This login is only for platform operators. School admins, teachers, parents, and students use the tenant workspace login.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">No org code required for platform operators.</div>
        </section>

        <section className="flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-card-border bg-white shadow-xl">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Platform Admin Login</CardTitle>
              <CardDescription>Use your super admin email and password. No organization or school code.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-email">Email</Label>
                  <Input id="platform-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="superadmin@vertexa.ai" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-password">Password</Label>
                  <Input id="platform-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
                </div>

                {(message || authError) && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {message ?? authError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  <Lock className="mr-2 h-4 w-4" />
                  {submitting ? "Signing in..." : "Sign in to platform"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
