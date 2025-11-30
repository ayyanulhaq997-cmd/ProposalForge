import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PropertyCard } from "@/components/PropertyCard";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@shared/schema";

export default function Favorites() {
  const { data: favorites, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/favorites'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
                  Start adding properties to your favorites to see them here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
