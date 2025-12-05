import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Activity,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Properties Management View
function PropertiesView() {
  const { data: properties, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/properties'],
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Properties Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Properties ({properties?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Host ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map(prop => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-semibold">{prop.title}</TableCell>
                    <TableCell>{prop.hostId}</TableCell>
                    <TableCell>{prop.location}</TableCell>
                    <TableCell>${prop.pricePerNight}</TableCell>
                    <TableCell>
                      <Badge variant={prop.isActive ? "default" : "secondary"}>
                        {prop.status || 'active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No properties found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hosts Management View
function HostsView() {
  const { data: hosts, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/hosts'],
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Hosts Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Hosts ({hosts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {hosts && hosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hosts.map(host => (
                  <TableRow key={host.id}>
                    <TableCell>{host.email}</TableCell>
                    <TableCell>{host.firstName} {host.lastName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{host.propertyCount || 0}</Badge>
                    </TableCell>
                    <TableCell>{new Date(host.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No hosts found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Bookings Management View
function BookingsView() {
  const { data: bookings, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/bookings/recent'],
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<any>({});
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({ bookingId, data }: any) => {
      if (editData.dates?.checkIn && editData.dates?.checkOut) {
        await apiRequest('PATCH', `/api/admin/bookings/${bookingId}/reschedule`, {
          checkIn: editData.dates.checkIn,
          checkOut: editData.dates.checkOut,
        });
      }
      if (editData.amount) {
        await apiRequest('PATCH', `/api/admin/bookings/${bookingId}/amount`, {
          total: parseFloat(editData.amount),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings/recent'] });
      setEditingId(null);
      toast({ title: "Success", description: "Booking updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bookings Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      {editingId === booking.id ? (
                        <Input 
                          type="date" 
                          defaultValue={booking.checkIn?.split('T')[0]}
                          onChange={(e) => setEditData({ ...editData, dates: { ...editData.dates, checkIn: e.target.value } })}
                          className="w-32"
                          data-testid="input-checkin"
                        />
                      ) : (
                        new Date(booking.checkIn).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === booking.id ? (
                        <Input 
                          type="date" 
                          defaultValue={booking.checkOut?.split('T')[0]}
                          onChange={(e) => setEditData({ ...editData, dates: { ...editData.dates, checkOut: e.target.value } })}
                          className="w-32"
                          data-testid="input-checkout"
                        />
                      ) : (
                        new Date(booking.checkOut).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === booking.id ? (
                        <Input 
                          type="number" 
                          defaultValue={booking.total}
                          onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                          className="w-24"
                          data-testid="input-amount"
                        />
                      ) : (
                        `$${Number(booking.total || 0).toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === booking.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateMutation.mutate({ bookingId: booking.id, data: editData })} data-testid="button-save-booking">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)} data-testid="button-cancel">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(booking.id); setEditData({}); }} data-testid={`button-edit-${booking.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No bookings found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Activity View
function ActivityView() {
  const { data: logs, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/audit-logs'],
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User & Host Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{log.userId?.substring(0, 8)}</TableCell>
                    <TableCell>{log.entityType}: {log.entityId?.substring(0, 8)}</TableCell>
                    <TableCell className="text-sm">{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{JSON.stringify(log.changes).substring(0, 50)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No activity found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Host Verification View
function HostVerificationView() {
  const { data: hosts, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/host-verification-requests'],
  });
  const { toast } = useToast();

  const verifyHostMutation = useMutation({
    mutationFn: async ({ userId, approved, reason }: any) => {
      await apiRequest('PATCH', `/api/admin/users/${userId}/verify-host`, {
        approved,
        reason: reason || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/host-verification-requests'] });
      toast({ title: "Success", description: "Host verification updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Host Verification Requests</h2>
      <Card>
        <CardHeader>
          <CardTitle>Pending Host Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {hosts && hosts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-mono text-sm">{host.email}</TableCell>
                    <TableCell>{host.firstName} {host.lastName}</TableCell>
                    <TableCell>{new Date(host.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => verifyHostMutation.mutate({ userId: host.id, approved: true })}
                        disabled={verifyHostMutation.isPending}
                        data-testid={`button-approve-host-${host.id}`}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => verifyHostMutation.mutate({ userId: host.id, approved: false, reason: 'Admin review' })}
                        disabled={verifyHostMutation.isPending}
                        data-testid={`button-reject-host-${host.id}`}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No pending host verification requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ID Verification View
function IdVerificationView() {
  const { data: verifications, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/id-verifications'],
  });
  const { toast } = useToast();

  const verifyIdMutation = useMutation({
    mutationFn: async ({ verificationId, status, reason }: any) => {
      await apiRequest('PATCH', `/api/user/verification/${verificationId}`, {
        status,
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/id-verifications'] });
      toast({ title: "Success", description: "ID verification updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-verifications" />;

  const pendingVerifications = verifications?.filter(v => v.status === 'pending') || [];
  const processedVerifications = verifications?.filter(v => v.status !== 'pending') || [];

  const VerificationTable = ({ items, showActions = false }: { items: any[]; showActions?: boolean }) => (
    <Table data-testid="table-verifications">
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Document Type</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Document</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((v) => (
          <TableRow key={v.id} data-testid={`row-verification-${v.id}`}>
            <TableCell className="font-mono text-sm" data-testid={`text-user-${v.id}`}>{v.userId?.substring(0, 8)}</TableCell>
            <TableCell className="capitalize" data-testid={`text-doctype-${v.id}`}>{v.documentType?.replace('_', ' ') || 'ID Document'}</TableCell>
            <TableCell data-testid={`text-date-${v.id}`}>{new Date(v.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Badge 
                variant={v.status === 'verified' ? 'default' : v.status === 'rejected' ? 'destructive' : 'secondary'}
                data-testid={`badge-status-${v.id}`}
              >
                {v.status}
              </Badge>
            </TableCell>
            <TableCell>
              {v.documentUrl ? (
                <a 
                  href={v.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary underline text-sm"
                  data-testid={`link-document-${v.id}`}
                >
                  View Document
                </a>
              ) : (
                <span className="text-muted-foreground text-sm" data-testid={`text-no-document-${v.id}`}>No document</span>
              )}
            </TableCell>
            {showActions && (
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => verifyIdMutation.mutate({ verificationId: v.id, status: 'verified' })}
                  disabled={verifyIdMutation.isPending}
                  data-testid={`button-approve-id-${v.id}`}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => verifyIdMutation.mutate({ verificationId: v.id, status: 'rejected', reason: 'Document unclear or invalid' })}
                  disabled={verifyIdMutation.isPending}
                  data-testid={`button-reject-id-${v.id}`}
                >
                  Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" data-testid="text-id-verification-title">ID Verification Requests</h2>
      
      <Card data-testid="card-pending-verifications">
        <CardHeader>
          <CardTitle>Pending Review ({pendingVerifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingVerifications.length > 0 ? (
            <VerificationTable items={pendingVerifications} showActions={true} />
          ) : (
            <p className="text-muted-foreground" data-testid="text-no-pending">No pending verification requests</p>
          )}
        </CardContent>
      </Card>

      {processedVerifications.length > 0 && (
        <Card data-testid="card-processed-verifications">
          <CardHeader>
            <CardTitle>Previously Processed ({processedVerifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationTable items={processedVerifications} showActions={false} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Payment Verification View
function PaymentVerificationView() {
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users-for-verification'],
  });
  const { toast } = useToast();

  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ userId, verified }: any) => {
      await apiRequest('PATCH', `/api/admin/users/${userId}/verify-payment`, {
        paymentVerified: verified,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users-for-verification'] });
      toast({ title: "Success", description: "Payment verification updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment Method Verification</h2>
      <Card>
        <CardHeader>
          <CardTitle>Users Requiring Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Payment Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>
                      <Badge variant={user.kycVerified ? "default" : "secondary"}>
                        {user.kycStatus || (user.kycVerified ? 'Verified' : 'Pending')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.paymentVerified ? "default" : "outline"}>
                        {user.paymentVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!user.paymentVerified && user.kycVerified ? (
                        <Button
                          size="sm"
                          onClick={() => verifyPaymentMutation.mutate({ userId: user.id, verified: true })}
                          disabled={verifyPaymentMutation.isPending}
                          data-testid={`button-verify-payment-${user.id}`}
                        >
                          Verify Payment
                        </Button>
                      ) : user.paymentVerified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyPaymentMutation.mutate({ userId: user.id, verified: false })}
                          disabled={verifyPaymentMutation.isPending}
                          data-testid={`button-unverify-payment-${user.id}`}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Complete KYC first</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Settings/CMS View
function SettingsView() {
  const [heroTitle, setHeroTitle] = React.useState("Discover Your Perfect Stay");
  const [heroImage, setHeroImage] = React.useState("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200");
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Website Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hero Headline</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              data-testid="input-hero-title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hero Background Image URL</label>
            <input
              type="text"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              data-testid="input-hero-image"
            />
          </div>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <div
              className="w-full h-32 rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
              data-testid="hero-preview"
            />
          </div>
          <Button data-testid="button-save-settings">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}

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
    { title: "Bookings", icon: Calendar, path: "/admin/bookings" },
    { title: "Activity", icon: Activity, path: "/admin/activity" },
    { title: "Properties", icon: Home, path: "/admin/properties" },
    { title: "Users", icon: Users, path: "/admin/users" },
    { title: "Hosts", icon: Building2, path: "/admin/hosts" },
    { title: "ID Verification", icon: Shield, path: "/admin/id-verification" },
    { title: "Payment Verify", icon: DollarSign, path: "/admin/payment-verification" },
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
            {(currentView === 'id-verification') && <IdVerificationView />}
            {(currentView === 'payment-verification') && <PaymentVerificationView />}
            {(currentView === 'hosts') && <HostVerificationView />}
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
            {currentView === 'bookings' && (
              <BookingsView />
            )}

            {currentView === 'activity' && (
              <ActivityView />
            )}
            
            {currentView === 'properties' && (
              <PropertiesView />
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
              <HostsView />
            )}
            
            {currentView === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
