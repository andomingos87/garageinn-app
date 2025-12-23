"use client";

import { useImpersonation } from "@/hooks/use-impersonation";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";

/**
 * Banner shown when admin is impersonating another user.
 * Displays at the top of the page with option to exit impersonation.
 */
export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUserName, exitImpersonation } = useImpersonation();

  if (!isImpersonating) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 py-2 text-sm"
      style={{
        backgroundColor: "hsl(38 92% 50%)",
        color: "hsl(0 0% 10%)",
      }}
    >
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>
          Você está visualizando como{" "}
          <strong>{impersonatedUserName || "outro usuário"}</strong>
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={exitImpersonation}
        className="h-7 px-2 hover:bg-black/10"
      >
        <X className="h-4 w-4 mr-1" />
        Sair do modo visualização
      </Button>
    </div>
  );
}

