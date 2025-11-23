import { useQuery } from "@tanstack/react-query";
import { Loader2, Check, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";

export default function HostBookings() {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/host/bookings'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pending = bookings?.filter(b => b.status === 'pending') || [];
  const confirmed = bookings?.filter(b => b.status === 'confirmed') || [];
  const completed = bookings?.filter(b => b.status === 'completed') || [];

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card key={booking.id}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={booking.status === 'pending' ? 'secondary' : booking.status === 'confirmed' ? 'default' : 'outline'}>
                {booking.status}
              </Badge>
              <Badge variant="outline">
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Guest ID: {booking.guestId}</p>
            <p className="text-sm text-muted-foreground mb-2">Property ID: {booking.propertyId}</p>
            <p className="text-sm">
              <span className="font-semibold">
                {format(new Date(booking.checkIn), 'MMM d')}
              </span>
              {' '}-{' '}
              <span className="font-semibold">
                {format(new Date(booking.checkOut), 'MMM d, yyyy')}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold mb-2">
              ${Number(booking.total).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mb-3">{booking.nights} nights</p>
            <div className="flex gap-2">
              {booking.status === 'pending' && (
                <>
                  <Button size="sm" variant="default">
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button size="sm" variant="destructive">
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
