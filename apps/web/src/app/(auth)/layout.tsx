import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, hsl(0 95% 60% / 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(0 95% 60% / 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(0 0% 98%) 0%, hsl(0 0% 96%) 100%)
          `,
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 0%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 0%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo-garageinn.png"
          alt="GarageInn"
          width={180}
          height={48}
          priority
          className="h-12 w-auto"
        />
      </div>

      {/* Auth content */}
      <main className="w-full max-w-md">{children}</main>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GarageInn. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

