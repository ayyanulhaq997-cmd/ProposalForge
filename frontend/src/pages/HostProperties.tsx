import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Edit, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@shared/schema";

export default function HostProperties() {
  const [, navigate] = useLocation();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/host/properties'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button onClick={() => navigate("/host/properties/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {Array.isArray(property.images) && property.images.length > 0 && (
                  <img
                    src={String(property.images[0])}
                    alt={property.title}
                    className="w-full md:w-48 h-48 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{property.title}</h2>
                      <p className="text-muted-foreground">{property.location}</p>
                    </div>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price/Night</p>
                      <p className="text-lg font-semibold">${Number(property.pricePerNight).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-semibold capitalize">{property.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="text-lg font-semibold">{property.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg font-semibold capitalize">{property.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {property.description}
                  </p>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/host/properties/${property.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No properties yet</p>
            <Button onClick={() => navigate("/host/properties/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
