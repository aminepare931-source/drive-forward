import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, Search, TrafficCone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_GROUPS, navForRole } from "./nav";
import { ROLE_LABELS, useSession } from "@/lib/session";
import { db } from "@/mocks/db";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { session } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!session) return null;
  const items = navForRole(session.user.role);
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        if (!groupItems.length) return null;
        return (
          <div key={group}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
              {group}
            </p>
            <ul className="space-y-1">
              {groupItems.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <TrafficCone className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-bold text-sidebar-foreground">DriveHub</p>
        <p className="text-[11px] text-sidebar-foreground/55">Plateforme auto-école</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, logout, switchOrganization } = useSession();
  const [open, setOpen] = useState(false);
  if (!session) return null;

  const data = db();
  const orgs = data.organizations.filter((o) => session.user.organizationIds.includes(o.id));
  const unread = data.notifications.filter(
    (n) => n.organizationId === session.organizationId && !n.read,
  ).length;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <Brand />
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher…" className="pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {orgs.length > 1 ? (
              <Select value={session.organizationId} onValueChange={switchOrganization}>
                <SelectTrigger className="hidden w-52 sm:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="hidden text-sm font-medium text-muted-foreground sm:block">
                {orgs[0]?.name}
              </span>
            )}

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Link to="/notifications">
                <Bell className="size-5" />
                {unread > 0 ? (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-accent/30">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {initials(session.user.firstName, session.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-left text-xs leading-tight sm:block">
                    <span className="block font-semibold text-foreground">
                      {session.user.firstName} {session.user.lastName}
                    </span>
                    <span className="block text-muted-foreground">
                      {ROLE_LABELS[session.user.role]}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
