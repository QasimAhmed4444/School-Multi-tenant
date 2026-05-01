import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/components/RoleContext";
import { Layout } from "@/components/Layout";
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
import { TransportPage } from "@/pages/TransportPage";
import { ComplaintsPage } from "@/pages/ComplaintsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={PrincipalDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/teacher-dashboard" component={TeacherDashboard} />
        <Route path="/student-dashboard" component={StudentDashboard} />
        <Route path="/parent-dashboard" component={ParentDashboard} />
        <Route path="/students" component={StudentsPage} />
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
        <RoleProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
