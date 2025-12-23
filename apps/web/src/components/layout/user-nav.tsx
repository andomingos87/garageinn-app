"use client";

import { LogOut, User, Settings, Loader2 } from "lucide-react";
import { signOut } from "@/app/(app)/actions";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useImpersonation } from "@/hooks/use-impersonation";

interface UserNavProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
}

/**
 * User navigation dropdown component.
 * Shows user info and logout option.
 * Handles impersonation mode by restoring admin session instead of full logout.
 */
export function UserNav({ user }: UserNavProps) {
  const [isPending, startTransition] = useTransition();
  const { isImpersonating, exitImpersonation } = useImpersonation();

  const handleSignOut = () => {
    // If impersonating, restore admin session instead of full logout
    if (isImpersonating) {
      exitImpersonation();
      return;
    }

    startTransition(async () => {
      await signOut();
    });
  };

  // Get initials from name or email
  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full"
          disabled={isPending}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl} alt={user?.name || "Avatar"} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                getInitials()
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Usuário"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className={`cursor-pointer ${
            isImpersonating
              ? "text-warning focus:text-warning focus:bg-warning/10"
              : "text-destructive focus:text-destructive focus:bg-destructive/10"
          }`}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isPending
            ? "Saindo..."
            : isImpersonating
              ? "Sair da visualização"
              : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

