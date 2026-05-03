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
import { HomeworkAssignmentPage } from "@/pages/HomeworkAssignmentPage";
import { HomeworkPage } from "@/pages/HomeworkPage";
import { OperationsPage } from "@/pages/OperationsPage";
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
import { NoAccessPage } from "@/pages/NoAccessPage";
import { usePermissions } from "@/domains/authz/usePermissions";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function HomeRoute() {
  const { roleKeys } = usePermissions();
  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));
  if (isTeacherOnly) return <TeacherDashboard />;
  return <SchoolWorkspacePage />;
}

function GuardedRoute(props: { permissions: string[]; children: React.ReactNode }) {
  const { hasAnyPermission } = usePermissions();
  if (!hasAnyPermission(props.permissions)) return <NoAccessPage />;
  return <>{props.children}</>;
}

function UsersRoute() {
  return <GuardedRoute permissions={["users.invite"]}><UserManagementPage /></GuardedRoute>;
}

function AcademicSetupRoute() {
  return <GuardedRoute permissions={["academics.manage"]}><AcademicSetupPage /></GuardedRoute>;
}

function StudentsRoute() {
  return <GuardedRoute permissions={["students.read", "students.manage"]}><StudentsPage /></GuardedRoute>;
}

function GuardiansRoute() {
  return <GuardedRoute permissions={["guardians.read", "guardians.manage"]}><GuardiansPage /></GuardedRoute>;
}

function TeachersRoute() {
  return <GuardedRoute permissions={["users.invite"]}><TeachersPage /></GuardedRoute>;
}

function AttendanceRoute() {
  return <GuardedRoute permissions={["attendance.read", "attendance.manage"]}><AttendancePage /></GuardedRoute>;
}

function OperationsRoute() {
  return <GuardedRoute permissions={["attendance.read", "homework.read", "homework.manage"]}><OperationsPage /></GuardedRoute>;
}

function HomeworkRoute() {
  return <GuardedRoute permissions={["homework.read", "homework.manage"]}><HomeworkPage /></GuardedRoute>;
}

function HomeworkAssignmentRoute() {
  return <GuardedRoute permissions={["homework.read", "homework.manage"]}><HomeworkAssignmentPage /></GuardedRoute>;
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
        <Route path="/users" component={UsersRoute} />
        <Route path="/academic-setup" component={AcademicSetupRoute} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/principal-dashboard" component={PrincipalDashboard} />
        <Route path="/teacher-dashboard" component={TeacherDashboard} />
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route path="/students" component={StudentsRoute} />
        <Route path="/guardians" component={GuardiansRoute} />
        <Route path="/teachers" component={TeachersRoute} />
        <Route path="/operations" component={OperationsRoute} />
        <Route path="/attendance" component={AttendanceRoute} />
        <Route path="/fees" component={FeesPage} />
        <Route path="/academics" component={AcademicsPage} />
        <Route path="/homework/:assignmentId" component={HomeworkAssignmentRoute} />
        <Route path="/homework" component={HomeworkRoute} />
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
