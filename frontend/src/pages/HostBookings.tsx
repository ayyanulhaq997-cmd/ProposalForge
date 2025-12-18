import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { parseDateString } from "@/lib/utils";
import type { Booking } from "@shared/schema";

function BookingsContent() {
  const { toast } = useToast();
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/host/bookings'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/host/bookings"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update booking",
        variant: "destructive"
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pending = bookings?.filter(b => b.status === 'pending_approval' || b.status === 'pending') || [];
  const confirmed = bookings?.filter(b => b.status === 'confirmed') || [];
  const completed = bookings?.filter(b => b.status === 'completed') || [];

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant={booking.status === 'pending_approval' || booking.status === 'pending' ? 'secondary' : booking.status === 'confirmed' ? 'default' : 'outline'}
                data-testid={`badge-booking-status-${booking.id}`}
              >
                {booking.status}
              </Badge>
              <Badge variant="outline" data-testid={`badge-payment-status-${booking.id}`}>
                {booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed' ? 'Paid' : 'Pending Payment'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1" data-testid={`text-guest-${booking.id}`}>Guest ID: {booking.guestId || 'Guest'}</p>
            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-property-${booking.id}`}>Property ID: {booking.propertyId}</p>
            {booking.specialRequests && (
              <div className="mb-3 p-3 bg-muted/50 rounded-md border" data-testid={`section-special-requests-${booking.id}`}>
                <p className="text-xs font-medium text-muted-foreground mb-1">Special Requests:</p>
                <p className="text-sm" data-testid={`text-special-requests-${booking.id}`}>{booking.specialRequests}</p>
              </div>
            )}
            <p className="text-sm" data-testid={`text-dates-${booking.id}`}>
              <span className="font-semibold">
                {parseDateString(booking.checkIn as string) ? format(parseDateString(booking.checkIn as string)!, 'MMM d') : 'N/A'}
              </span>
              {' '}-{' '}
              <span className="font-semibold">
                {parseDateString(booking.checkOut as string) ? format(parseDateString(booking.checkOut as string)!, 'MMM d, yyyy') : 'N/A'}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold mb-2" data-testid={`text-total-${booking.id}`}>
              ${Number(booking.total).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mb-3" data-testid={`text-nights-${booking.id}`}>{booking.nights} nights</p>
            <div className="flex gap-2">
              {(booking.status === 'pending_approval' || booking.status === 'pending') && (
                <>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-confirm-booking-${booking.id}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-decline-booking-${booking.id}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Bookings Management</h1>
      </div>

      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Pending Confirmations ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Check className="h-6 w-6 text-green-600" />
            Confirmed Bookings ({confirmed.length})
          </h2>
          <div className="space-y-4">
            {confirmed.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Check className="h-6 w-6 text-muted-foreground" />
            Completed Bookings ({completed.length})
          </h2>
          <div className="space-y-4">
            {completed.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        </div>
      )}

      {!pending.length && !confirmed.length && !completed.length && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HostBookings() {
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
      <BookingsContent />
    </HostDashboardLayout>
  );
}
