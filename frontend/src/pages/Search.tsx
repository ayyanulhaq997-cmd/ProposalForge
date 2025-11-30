import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@shared/schema";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    guests: searchParams.get('guests') || '',
  });

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const url = `/api/properties/search?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 transition-all duration-300 ease-in-out">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-300">
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="beachfront">Beachfront</SelectItem>
                  <SelectItem value="mountain">Mountain</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="countryside">Countryside</SelectItem>
                  <SelectItem value="tropical">Tropical</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.propertyType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="cabin">Cabin</SelectItem>
                  <SelectItem value="cottage">Cottage</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.minPrice}
                onValueChange={(value) => setFilters(prev => ({ ...prev, minPrice: value }))}
              >
                <SelectTrigger data-testid="select-min-price">
                  <SelectValue placeholder="Min Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Min</SelectItem>
                  <SelectItem value="50">$50</SelectItem>
                  <SelectItem value="100">$100</SelectItem>
                  <SelectItem value="200">$200</SelectItem>
                  <SelectItem value="500">$500</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.maxPrice}
                onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}
              >
                <SelectTrigger data-testid="select-max-price">
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9999">No Max</SelectItem>
                  <SelectItem value="100">$100</SelectItem>
                  <SelectItem value="200">$200</SelectItem>
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="1000">$1000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="hover-elevate active-elevate-2" data-testid="button-more-filters">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <>
              <div className="mb-6 transition-all duration-300">
                <p className="text-lg font-medium transition-all duration-300" data-testid="text-results-count">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300">
                {properties.map((property) => (
                  <div key={property.id} className="transition-all duration-300 ease-in-out">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 transition-all duration-300">
              <p className="text-xl font-medium text-muted-foreground transition-all duration-300">No properties found</p>
              <p className="text-muted-foreground mt-2 transition-all duration-300">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
