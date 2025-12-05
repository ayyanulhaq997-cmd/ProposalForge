import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";

function EarningsContent() {
  const { data: stats, isLoading: loadingStats } = useQuery<any>({
    queryKey: ['/api/host/stats'],
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/host/bookings'],
  });

  if (loadingStats || loadingBookings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedBookings = bookings?.filter(b => b.status === 'completed' || b.paymentStatus === 'paid') || [];
  const totalEarnings = completedBookings.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const pendingPayouts = bookings?.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid')
    .reduce((sum, b) => sum + Number(b.total || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" data-testid="text-earnings-title">Earnings Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-earnings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="text-total-earnings">
              ${totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {completedBookings.length} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-payouts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600" data-testid="text-pending-payouts">
              ${pendingPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-this-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-this-month">
              ${stats?.monthlyRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-average-booking">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Avg. per Booking</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-average-booking">
              ${completedBookings.length > 0 ? (totalEarnings / completedBookings.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-earnings">
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {completedBookings.length > 0 ? (
            <div className="space-y-4">
              {completedBookings.slice(0, 10).map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`row-earning-${booking.id}`}
                >
                  <div>
                    <p className="font-medium" data-testid={`text-property-${booking.id}`}>
                      Property ID: {booking.propertyId?.substring(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-dates-${booking.id}`}>
                      {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600" data-testid={`text-amount-${booking.id}`}>
                      ${Number(booking.total).toFixed(2)}
                    </p>
                    <Badge 
                      variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      data-testid={`badge-status-${booking.id}`}
                    >
                      {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-earnings">No earnings yet</p>
              <p className="text-sm text-muted-foreground">Complete your first booking to see earnings here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HostEarnings() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, isHost, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (!isHost && !isAdmin)) {
    navigate("/login");
    return null;
  }

  return (
    <HostDashboardLayout>
      <EarningsContent />
    </HostDashboardLayout>
  );
}
