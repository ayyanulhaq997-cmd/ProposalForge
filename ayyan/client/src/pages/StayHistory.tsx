import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Booking, Property } from "@shared/schema";

interface StayWithProperty extends Booking {
  property?: Property;
}

export default function StayHistory() {
  const { data: stays, isLoading } = useQuery<StayWithProperty[]>({
    queryKey: ['/api/user/stays'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedStays = stays?.filter(s => s.status === 'completed') || [];
  const upcomingStays = stays?.filter(s => s.status === 'confirmed') || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 data-testid="text-stay-history-heading" className="text-3xl font-bold mb-8">Stay History</h1>

      {/* Upcoming Stays */}
      {upcomingStays.length > 0 && (
        <div className="mb-12">
          <h2 data-testid="text-upcoming-stays" className="text-2xl font-semibold mb-4">Upcoming Stays</h2>
          <div className="space-y-4">
            {upcomingStays.map((stay) => (
              <Card key={stay.id} data-testid={`card-upcoming-stay-${stay.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{stay.property?.title || 'Property'}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {stay.property?.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(stay.checkIn), 'MMM d')} - {format(new Date(stay.checkOut), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{stay.nights} nights</span>
                          <Badge variant="outline">{stay.guests} guests</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${Number(stay.total).toFixed(2)}</div>
                      <Badge className="mt-2 bg-blue-600">Confirmed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Stays */}
      <div>
        <h2 data-testid="text-past-stays" className="text-2xl font-semibold mb-4">
          Past Stays ({completedStays.length})
        </h2>
        {completedStays.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No completed stays yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedStays.map((stay) => (
              <Card key={stay.id} data-testid={`card-past-stay-${stay.id}`} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{stay.property?.title || 'Property'}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {stay.property?.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(stay.checkIn), 'MMM d')} - {format(new Date(stay.checkOut), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {stay.nights} nights at ${Number(stay.pricePerNight).toFixed(2)}/night
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${Number(stay.total).toFixed(2)}</div>
                      <Badge variant="secondary" className="mt-2">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
