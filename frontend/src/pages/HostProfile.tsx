import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, Star, MessageSquare, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User, Property, Review } from "@shared/schema";

interface HostProfileData {
  host: User;
  properties: Property[];
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    totalListings: number;
    totalBookings: number;
  };
}

export default function HostProfile() {
  const [location] = useLocation();
  const hostId = location.split('/').pop() || '';

  const { data, isLoading } = useQuery<HostProfileData>({
    queryKey: ['/api/hosts', hostId],
    enabled: !!hostId,
  });

  if (!hostId || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-10">Host not found</div>;
  }

  const { host, properties, reviews, stats } = data;
  const initials = `${host.firstName?.[0]}${host.lastName?.[0]}`.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Host Info Card */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={host.profileImageUrl || ''} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              {host.isVerified && (
                <Badge data-testid="badge-verified-host" className="bg-green-600">
                  Verified Host
                </Badge>
              )}
            </div>

            <div className="flex-1">
              <h1 data-testid="text-host-name" className="text-3xl font-bold mb-2">
                {host.firstName} {host.lastName}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Average Rating
                  </div>
                </div>
                <div>
                  <div data-testid="text-review-count" className="text-2xl font-bold text-primary">
                    {stats.totalReviews}
                  </div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{stats.responseRate}%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
                <div>
                  <div data-testid="text-listing-count" className="text-2xl font-bold text-primary">
                    {stats.totalListings}
                  </div>
                  <div className="text-sm text-muted-foreground">Listings</div>
                </div>
              </div>

              <Button data-testid="button-contact-host" className="bg-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Host
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Section */}
      <div className="mb-8">
        <h2 data-testid="text-properties-heading" className="text-2xl font-bold mb-4">
          <Home className="inline h-6 w-6 mr-2" />
          Properties ({properties.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <Card key={property.id} data-testid={`card-property-${property.id}`}>
              <CardHeader>
                <CardTitle className="text-lg">{property.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                <p className="text-sm mb-3">{property.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{property.propertyType}</Badge>
                  <span className="font-bold">${Number(property.pricePerNight).toFixed(2)}/night</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 data-testid="text-reviews-heading" className="text-2xl font-bold mb-4">
          <Star className="inline h-6 w-6 mr-2" />
          Reviews ({reviews.length})
        </h2>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">No reviews yet</p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} data-testid={`card-review-${review.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.title}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" data-testid={`star-rating-${i}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                    {review.isVerifiedBooking && (
                      <Badge variant="secondary">Verified</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
