import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/domains/auth/AuthProvider";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  BookOpen,
  FileText,
  Award,
  Calendar,
  Heart,
  Bus,
  MessageSquare,
  BarChart2,
  Settings,
  Bell,
  Search,
  Moon,
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Ops", icon: ShieldCheck },
  { href: "/students", label: "Students", icon: Users },
  { href: "/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/fees", label: "Fees & Finance", icon: Wallet },
  { href: "/academics", label: "Academics", icon: BookOpen },
  { href: "/homework", label: "Homework", icon: FileText },
  { href: "/exams", label: "Exams & Results", icon: Award },
  { href: "/timetable", label: "Timetable", icon: Calendar },
  { href: "/parents", label: "Parents", icon: Heart },
  { href: "/transport", label: "Transport", icon: Bus },
  { href: "/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const { profile, signOut } = useAuth();
  const { memberships, selectedMembership, selectMembership } = useTenant();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const schoolName = selectedMembership?.school?.name ?? selectedMembership?.organization?.name ?? "School Workspace";
  const orgName = selectedMembership?.organization?.name ?? "Organization";

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center px-6 bg-sidebar">
          <div className="flex items-center gap-2">
            <Moon className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">{schoolName}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.label + item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-md" />
                  )}
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80"
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students, teachers..."
                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground border-r pr-4">
              {orgName}
            </div>
            
            {memberships.length > 1 && (
              <select
                className="hidden sm:block h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={selectedMembership?.id ?? ""}
                onChange={(event) => selectMembership(event.target.value)}
              >
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.id}>
                    {membership.school?.name ?? membership.organization?.name}
                  </option>
                ))}
              </select>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-0 gap-2 hover:bg-transparent">
                  <div className="flex flex-col items-end text-sm">
                    <span className="font-semibold">{profile?.full_name ?? profile?.email ?? "User"}</span>
                    <span className="text-xs text-muted-foreground">{schoolName}</span>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">{(profile?.full_name ?? profile?.email ?? "U")[0]}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {memberships.length > 1 && memberships.map((membership) => (
                  <DropdownMenuItem key={membership.id} onClick={() => selectMembership(membership.id)}>
                    {membership.school?.name ?? membership.organization?.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
