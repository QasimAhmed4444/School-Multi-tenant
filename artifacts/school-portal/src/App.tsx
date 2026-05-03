import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/domains/auth/AuthProvider";
import { TenantProvider, useTenant } from "@/domains/tenant/TenantProvider";
import { PrincipalDashboard } from "@/pages/PrincipalDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { TeacherDashboard } from "@/pages/TeacherDashboard";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { ParentDashboard } from "@/pages/ParentDashboard";
import { StudentsPage } from "@/pages/StudentsPage";
import { TeachersPage } from "@/pages/TeachersPage";
import { AttendancePage } from "@/pages/AttendancePage";
import { FeesPage } from "@/pages/FeesPage";
import { AcademicsPage } from "@/pages/AcademicsPage";
import { HomeworkPage } from "@/pages/HomeworkPage";
import { ExamsPage } from "@/pages/ExamsPage";
import { TimetablePage } from "@/pages/TimetablePage";
import { ParentsPage } from "@/pages/ParentsPage";
import { GuardiansPage } from "@/pages/GuardiansPage";
import { TransportPage } from "@/pages/TransportPage";
import { ComplaintsPage } from "@/pages/ComplaintsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PlatformLoginPage } from "@/pages/PlatformLoginPage";
import { PlatformDashboard } from "@/pages/PlatformDashboard";
import { TenantAccessPage } from "@/pages/TenantAccessPage";
import { SchoolWorkspacePage } from "@/pages/SchoolWorkspacePage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { AcademicSetupPage } from "@/pages/AcademicSetupPage";
import { usePermissions } from "@/domains/authz/usePermissions";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function HomeRoute() {
  const { roleKeys } = usePermissions();
  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));
  if (isTeacherOnly) return <TeacherDashboard />;
  return <SchoolWorkspacePage />;
}

function Router() {
  const [location] = useLocation();
  const { loading: authLoading, user } = useAuth();
  const { loading: tenantLoading, isPlatformAdmin, selectedMembership } = useTenant();
  const isPlatformLoginRoute = location === "/admin/login";

  if (authLoading || tenantLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return isPlatformLoginRoute ? <PlatformLoginPage /> : <LoginPage />;
  }

  if (isPlatformAdmin) {
    return <PlatformDashboard />;
  }

  if (!selectedMembership) {
    return <TenantAccessPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/users" component={UserManagementPage} />
        <Route path="/academic-setup" component={AcademicSetupPage} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/principal-dashboard" component={PrincipalDashboard} />
        <Route path="/teacher-dashboard" component={TeacherDashboard} />
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route path="/students" component={StudentsPage} />
        <Route path="/guardians" component={GuardiansPage} />
        <Route path="/teachers" component={TeachersPage} />
        <Route path="/attendance" component={AttendancePage} />
        <Route path="/fees" component={FeesPage} />
        <Route path="/academics" component={AcademicsPage} />
        <Route path="/homework" component={HomeworkPage} />
        <Route path="/exams" component={ExamsPage} />
        <Route path="/timetable" component={TimetablePage} />
        <Route path="/parents" component={ParentsPage} />
        <Route path="/transport" component={TransportPage} />
        <Route path="/complaints" component={ComplaintsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
