"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { useProfile } from "@/hooks/use-profile";
import { Skeleton } from "@/components/ui/skeleton";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = "Dashboard" }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  const { profile, isLoading } = useProfile();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications - Standby for MVP */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
          {/* Badge for notifications count - to be implemented */}
        </Button>

        {/* User Menu */}
        {isLoading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
          <UserNav
            user={
              profile
                ? {
                    name: profile.full_name,
                    email: profile.email,
                    avatarUrl: profile.avatar_url || undefined,
                  }
                : null
            }
          />
        )}
      </div>
    </header>
  );
}
