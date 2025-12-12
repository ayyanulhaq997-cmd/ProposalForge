import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";
import { parseDateString } from "@/lib/utils";

export default function Trips() {
  const [, navigate] = useLocation();
  const { data: upcomingBookings, isLoading: loadingUpcoming } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/upcoming'],
  });

  const { data: pastBookings, isLoading: loadingPast } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/past'],
  });

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const checkIn = parseDateString(booking.checkIn as string);
    const checkOut = parseDateString(booking.checkOut as string);

    return (
      <Card className="hover-elevate transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg" data-testid={`card-booking-${booking.id}`}>
        <CardContent className="p-6 transition-all duration-300">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Property Title</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                </div>
                <Badge variant={
                  booking.status === 'confirmed' ? 'default' :
                  booking.status === 'pending' ? 'secondary' :
                  booking.status === 'cancelled' ? 'destructive' : 'outline'
                }>
                  {booking.status}
                </Badge>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {checkIn && checkOut ? (
                    <span>
                      {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')} ({booking.nights} nights)
                    </span>
                  ) : (
                    <span>Dates not available</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guests} guests</span>
                </div>
                <div className="text-lg font-semibold mt-3">
                  Total: ${Number(booking.total || 0).toFixed(2)}
                </div>
              </div>

              <div className="mt-4 flex gap-2 transition-all duration-300">
                <Button variant="outline" size="sm" onClick={() => navigate(`/property/${booking.propertyId}`)} className="transition-all duration-300">View Property</Button>
                {booking.status === 'confirmed' && (
                  <Button variant="outline" size="sm" className="transition-all duration-300">
                    Contact Host
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">My Trips</h1>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" data-testid="tab-past">
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loadingUpcoming ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming trips</h3>
                    <p className="text-muted-foreground mb-4">
                      Time to dust off your bags and start planning your next adventure!
                    </p>
                    <Button onClick={() => navigate("/search")}>Start searching</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loadingPast ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pastBookings && pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No past trips</h3>
                    <p className="text-muted-foreground">
                      Your trip history will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
