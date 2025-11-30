import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const images = property.images as string[] || [];
  const mainImage = images[0] || "";
  const price = Number(property.pricePerNight || 0);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if property is favorited
  const { data: favorites } = useQuery<any[]>({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (favorites) {
      setIsFavorite(favorites.some(fav => fav.propertyId === property.id));
    }
  }, [favorites, property.id]);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${property.id}`);
      } else {
        await apiRequest('POST', `/api/favorites/${property.id}`, {});
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please login to save favorites",
        variant: "destructive",
      });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    favoriteMutation.mutate();
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all duration-300 ease-in-out border shadow-sm hover:shadow-2xl hover:-translate-y-1"
      data-testid={`card-property-${property.id}`}
      onClick={() => (window.location.href = `/property/${property.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ImageWithFallback
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          fallbackClassName="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3"
        />

        {/* Favorite Button */}
        <div
          className={`absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center hover-elevate ${isFavorite ? 'bg-primary/90' : 'bg-white/90 dark:bg-black/50'}`}
          onClick={handleFavorite}
          data-testid={`button-favorite-${property.id}`}
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-white text-white' : 'text-muted-foreground'}`} />
        </div>

        {/* Status Badge */}
        {property.status === "active" && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-lg line-clamp-1"
              data-testid={`text-property-title-${property.id}`}
            >
              {property.title}
            </h3>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.location}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{property.guests} guests</span>
            <span>•</span>
            <span>{property.bedrooms} bedrooms</span>
            <span>•</span>
            <span>{property.bathrooms} baths</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-baseline gap-1">
              <span
                className="text-xl font-bold"
                data-testid={`text-price-${property.id}`}
              >
                ${price.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
