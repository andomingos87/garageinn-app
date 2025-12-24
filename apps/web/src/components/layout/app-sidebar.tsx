"use client";

import {
  Building2,
  CheckSquare,
  Home,
  MessageSquareMore,
  Settings,
  Users,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RequireAdmin } from "@/components/auth/require-permission";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  requireAdmin?: boolean;
}

const menuItems: MenuItem[] = [
  {
    title: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Chamados",
    href: "/chamados",
    icon: MessageSquareMore,
  },
  {
    title: "Checklists",
    href: "/checklists",
    icon: CheckSquare,
  },
  {
    title: "Unidades",
    href: "/unidades",
    icon: Building2,
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: Users,
    requireAdmin: true,
  },
];

const configItems: MenuItem[] = [
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    requireAdmin: true,
  },
];

function MenuItemLink({ 
  item, 
  isActive 
}: { 
  item: MenuItem; 
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const menuItemElement = (
      <MenuItemLink 
        key={item.href} 
        item={item} 
        isActive={isActive(item.href)} 
      />
    );

    if (item.requireAdmin) {
      return (
        <RequireAdmin key={item.href}>
          {menuItemElement}
        </RequireAdmin>
      );
    }

    return menuItemElement;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative h-8 w-32">
            <Image
              src="/logo-garageinn.png"
              alt="GarageInn Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {configItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
