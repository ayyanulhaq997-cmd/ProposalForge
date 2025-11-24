import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  Users,
  Home,
  DollarSign,
  TrendingUp,
  Settings,
  Building2,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  
  // Determine current view from URL
  const currentView = location.split('/').pop() || 'dashboard';
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: recentBookings } = useQuery<any[]>({
    queryKey: ['/api/admin/bookings/recent'],
  });

  const menuItems = [
    { title: "Dashboard", icon: TrendingUp, path: "/admin" },
    { title: "Properties", icon: Home, path: "/admin/properties" },
    { title: "Bookings", icon: Calendar, path: "/admin/bookings" },
    { title: "Users", icon: Users, path: "/admin/users" },
    { title: "Hosts", icon: Building2, path: "/admin/hosts" },
    { title: "Verification", icon: Shield, path: "/admin/verification" },
    { title: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const style = {
    "--sidebar-width": "16rem",
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground mb-6">You must log in as an admin to access the dashboard.</p>
            <Button onClick={() => navigate("/login")} data-testid="button-login">Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You do not have admin permissions to access this dashboard.</p>
            <Button onClick={() => navigate("/")} data-testid="button-home">Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

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
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton onClick={() => navigate(item.path)} data-testid={`link-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button onClick={() => navigate("/")} variant="outline" data-testid="link-public-site">View Public Site</Button>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {/* Show different content based on current view */}
            {(currentView === 'dashboard' || currentView === 'admin') && (
              <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-users">
                    {stats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-properties">
                    {stats?.activeProperties || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingProperties || 0} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-bookings">
                    {stats?.totalBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingBookings || 0} pending confirmation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings && recentBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>Guest Name</TableCell>
                          <TableCell>Property Title</TableCell>
                          <TableCell className="text-sm">
                            {booking.checkIn} - {booking.checkOut}
                          </TableCell>
                          <TableCell>${Number(booking.total || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'pending' && (
                              <Button size="sm" variant="outline">
                                Confirm
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent bookings
                  </p>
                )}
              </CardContent>
            </Card>
              </>
            )}
            
            {/* Other Views */}
            {currentView === 'properties' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Properties Management</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>All Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Properties list coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {currentView === 'users' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Users Management</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Users list coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {currentView === 'hosts' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Hosts Management</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>All Hosts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Hosts list coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {currentView === 'verification' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Verification</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Verification requests coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {currentView === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Settings</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings coming soon</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
