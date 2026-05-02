import React from "react";
import { GraduationCap, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/domains/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const { signIn, signUp, authError } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [tenantCode, setTenantCode] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const normalizedTenantCode = tenantCode.trim().toUpperCase();
      if (normalizedTenantCode) {
        window.localStorage.setItem("preferredTenantCode", normalizedTenantCode);
      } else {
        window.localStorage.removeItem("preferredTenantCode");
      }

      if (mode === "signup") {
        await signUp(email, password, fullName);
        setMessage("Account created. For testing, use platform-created admins when you need confirmed login without email.");
        setMode("signin");
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[1fr_480px]">
      <section className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold">School SaaS Platform</div>
            <div className="text-sm text-sidebar-foreground/70">Multi-tenant foundation</div>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border px-3 py-1 text-sm text-sidebar-foreground/80">
            <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
            RLS-first tenant isolation
          </div>
          <h1 className="text-4xl font-bold leading-tight">One platform for organizations, schools, campuses, and controlled admin seats.</h1>
          <p className="text-lg text-sidebar-foreground/75">
            Login now resolves your real Supabase profile and memberships. Demo role switching is gone from the access model.
          </p>
        </div>

        <div className="text-sm text-sidebar-foreground/60">Production foundation phase</div>
      </section>

      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-card-border shadow-lg">
          <CardHeader>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary lg:hidden">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {mode === "signin" ? "Use your email, password, and optional org/school code to enter the right tenant." : "Create a profile. Platform access is assigned separately."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantCode">Org or school code</Label>
                <Input id="tenantCode" value={tenantCode} onChange={(event) => setTenantCode(event.target.value)} placeholder="ALBURHAN or AIS" />
                <p className="text-xs text-muted-foreground">Optional for one-school users. Required later when one user belongs to multiple tenants.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
              </div>

              {(message || authError) && (
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {message ?? authError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                <Lock className="mr-2 h-4 w-4" />
                {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <Button variant="ghost" className="mt-4 w-full" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
