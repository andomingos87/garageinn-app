import { AppShell } from "@/components/layout";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster position="top-right" richColors />
    </>
  );
}
