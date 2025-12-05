import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Edit, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function PropertiesContent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/host/properties'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/properties/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Property deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/host/stats"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete property",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button onClick={() => navigate("/host/properties/new")} data-testid="button-add-property">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden" data-testid={`card-property-${property.id}`}>
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {Array.isArray(property.images) && property.images.length > 0 && (
                  <img
                    src={String(property.images[0])}
                    alt={property.title}
                    className="w-full md:w-48 h-48 rounded-lg object-cover"
                    data-testid={`img-property-${property.id}`}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold" data-testid={`text-title-${property.id}`}>{property.title}</h2>
                      <p className="text-muted-foreground" data-testid={`text-location-${property.id}`}>{property.location}</p>
                    </div>
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'} data-testid={`badge-status-${property.id}`}>
                      {property.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price/Night</p>
                      <p className="text-lg font-semibold" data-testid={`text-price-${property.id}`}>${Number(property.pricePerNight).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-lg font-semibold capitalize" data-testid={`text-type-${property.id}`}>{property.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="text-lg font-semibold" data-testid={`text-guests-${property.id}`}>{property.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg font-semibold capitalize" data-testid={`text-category-${property.id}`}>{property.category}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4" data-testid={`text-description-${property.id}`}>
                    {property.description}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/property/${property.id}`)}
                      data-testid={`button-view-property-${property.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/host/properties/${property.id}/edit`)}
                      data-testid={`button-edit-property-${property.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-property-${property.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Property</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{property.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(property.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
            <Button onClick={() => navigate("/host/properties/new")} data-testid="button-add-first-property">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function HostProperties() {
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
      <PropertiesContent />
    </HostDashboardLayout>
  );
}
