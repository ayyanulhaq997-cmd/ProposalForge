import { useLocation, Link } from "wouter";
import {
  Home,
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  Settings,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type UseLocationReturn = [string, (path: string) => void];

const menuItems = [
  { title: "Dashboard", icon: TrendingUp, path: "/host" },
  { title: "My Properties", icon: Home, path: "/host/properties" },
  { title: "Bookings", icon: Calendar, path: "/host/bookings" },
  { title: "Earnings", icon: DollarSign, path: "/host/earnings" },
  { title: "Settings", icon: Settings, path: "/host/settings" },
];

export function HostDashboardLayout({ children }: { children: React.ReactNode }) {
  const [pathname, navigate] = useLocation() as UseLocationReturn;
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/host/stats'],
  });

  const getCurrentTitle = () => {
    const item = menuItems.find(m => m.path === pathname || pathname.startsWith(m.path + '/'));
    return item?.title || "Dashboard";
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Host Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton onClick={() => navigate(item.path)} isActive={isActive} data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-bold">{getCurrentTitle()}</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/")} variant="outline" data-testid="link-view-site">View Site</Button>
              {pathname !== "/host/properties/new" && (
                <Button onClick={() => navigate("/host/properties/new")} data-testid="button-add-property">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
