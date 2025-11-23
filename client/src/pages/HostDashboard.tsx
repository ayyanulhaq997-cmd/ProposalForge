import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TrendingUp, Plus, Edit, Trash2, Loader2, Star, DollarSign, Zap, Calendar, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import type { Property } from "@shared/schema";

function DashboardHome() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/host/stats'],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/host/properties'],
  });

  const { data: bookings } = useQuery<any[]>({
    queryKey: ['/api/host/bookings'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus propiedades y reservas</p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate("/host/properties/new")}
          data-testid="button-new-property"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propiedad
        </Button>
      </div>

      {/* Stats Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Propiedades</CardTitle>
            <Home className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-properties">
              {stats?.totalProperties || 0}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground" data-testid="text-monthly-earnings">
              €{stats?.monthlyEarnings?.toFixed(0) || '0'}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +24% vs mes anterior
            </p>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Calificación Promedio</CardTitle>
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground" data-testid="text-rating">
              {stats?.averageRating || 4.8}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +0.3 vs mes anterior
            </p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Ocupación</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground" data-testid="text-occupancy">
              {stats?.occupancyRate || 85}%
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Propiedades</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate("/host/properties")}
            data-testid="link-view-all-properties"
          >
            Gestionar
          </Button>
        </div>

        {properties && properties.length > 0 ? (
          <div className="space-y-4">
            {properties.slice(0, 4).map((property) => {
              const image = (property.images as string[])?.[0];
              return (
                <Card key={property.id} className="border rounded-lg hover-elevate overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Image */}
                      {image && (
                        <img
                          src={image}
                          alt={property.title}
                          className="w-28 h-28 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      {/* Property Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
                        <p className="text-sm text-muted-foreground">{property.location}</p>

                        {/* Rating and Price */}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            4.8 (127 reseñas)
                          </Badge>
                          <Badge variant="outline">Precio: €{Number(property.pricePerNight).toFixed(0)}/noche</Badge>
                          <Badge variant="outline">Tipo: {property.propertyType || 'Villa'}</Badge>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(property.amenities as string[])?.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                          {((property.amenities as string[])?.length || 0) > 3 && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              +{(property.amenities as string[]).length - 3} más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => navigate(`/host/properties/${property.id}/edit`)}
                          data-testid={`button-edit-property-${property.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-property-${property.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No hay propiedades aún</p>
              <Button 
                onClick={() => navigate("/host/properties/new")}
                data-testid="button-add-first-property"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar tu primera propiedad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bookings Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Reservas</h2>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => {
              const property = properties?.find(p => p.id === booking.propertyId);
              return (
                <Card key={booking.id} className="border rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                          {property?.title?.[0] || 'P'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{property?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.checkInDate} - {booking.checkOutDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">€{booking.totalPrice || 1250}</p>
                        <Badge variant="outline" className="text-xs">
                          {booking.status || 'Confirmada'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/host/bookings")}
              data-testid="link-view-all-bookings"
            >
              Ver todas las reservas
            </Button>
          </div>
        ) : (
          <Card className="border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No hay reservas en este momento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function HostDashboard() {
  return (
    <HostDashboardLayout>
      <DashboardHome />
    </HostDashboardLayout>
  );
}
