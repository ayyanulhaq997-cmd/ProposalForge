import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Tv,
  Car,
  Coffee,
  Loader2,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageWithFallback, AvatarWithFallback } from "@/components/ImageWithFallback";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Property, User, Review } from "@shared/schema";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });

  const { data: host } = useQuery<User>({
    queryKey: [`/api/users/${property?.hostId}`],
    enabled: !!property?.hostId,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/properties/${id}/reviews`],
    enabled: !!id,
  });

  const { data: favorites } = useQuery<any[]>({
    queryKey: ['/api/favorites'],
  });

  // Track recently viewed
  useEffect(() => {
    if (property?.id) {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = viewed.filter((p: any) => p.id !== property.id);
      filtered.unshift({ id: property.id, title: property.title, viewedAt: new Date().toISOString() });
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
    }
  }, [property?.id]);

  // Check if favorite
  useEffect(() => {
    if (favorites) {
      setIsFavorite(favorites.some(fav => fav.propertyId === id));
    }
  }, [favorites, id]);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${id}`);
      } else {
        await apiRequest('POST', `/api/favorites/${id}`, {});
      }
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Property not found</h2>
            <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/search")}>Back to Search</Button>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images as string[] || [];
  const amenities = property.amenities as string[] || [];
  const price = Number(property.pricePerNight || 0);
  const cleaningFee = Number(property.cleaningFee || 0);
  const serviceFee = Number(property.serviceFee || 0);
  const taxRate = Number(property.taxRate || 0.0625);

  const calculateBooking = () => {
    if (!dateRange?.from || !dateRange?.to) return null;
    
    // Ensure check-out is after check-in
    if (dateRange.to <= dateRange.from) return null;
    
    // Calculate nights (minimum 1 night required)
    const nights = Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)));
    const subtotal = price * nights;
    const tax = (subtotal + cleaningFee + serviceFee) * taxRate;
    const total = subtotal + cleaningFee + serviceFee + tax;

    return { nights, subtotal, tax, total };
  };

  const booking = calculateBooking();

  const handleBooking = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    if (dateRange.to <= dateRange.from) return;
    
    // Format dates as YYYY-MM-DD with strict validation
    const formatDateForUrl = (date: any): string => {
      if (!date || !(date instanceof Date)) {
        console.error('Invalid date - not a Date object:', date);
        return '';
      }
      
      // Get components directly from the date object
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // Validate year is reasonable
      if (isNaN(year) || year < 1900 || year > 2100) {
        console.error('Invalid year extracted:', year);
        return '';
      }
      
      // Build the date string manually with proper zero-padding
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const formatted = `${year}-${monthStr}-${dayStr}`;
      
      // Final validation - ensure format is correct
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
        console.error('Invalid date format:', formatted);
        return '';
      }
      
      return formatted;
    };
    
    const checkInStr = formatDateForUrl(dateRange.from);
    const checkOutStr = formatDateForUrl(dateRange.to);
    
    if (!checkInStr || !checkOutStr) {
      console.error('Failed to format dates properly', { from: dateRange.from, to: dateRange.to });
      return;
    }
    
    navigate(`/book/${id}?checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guests}`);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 pb-8">
        {/* Images Section - New Layout */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Large Featured Image - Left */}
              <div className="lg:col-span-2">
                <div className="relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity duration-300" onClick={() => setShowAllPhotos(true)} style={{ height: '400px' }}>
                  <ImageWithFallback
                    src={images[0] || ''}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Small Images Grid - Right */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity duration-300" onClick={() => setShowAllPhotos(true)} style={{ height: '190px' }}>
                      <ImageWithFallback
                        src={img}
                        alt={`${property.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
                      />
                    </div>
                  ))}
                  {images.length < 5 && [...Array(4 - Math.min(images.length - 1, 4))].map((_, idx) => (
                    <div 
                      key={`empty-${idx}`} 
                      className="relative rounded-lg overflow-hidden"
                      style={{ 
                        height: '190px',
                        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {images.length > 5 && (
              <Button
                variant="outline"
                className="mt-4 border-primary text-primary hover:bg-primary/5"
                onClick={() => setShowAllPhotos(true)}
                data-testid="button-show-photos"
              >
                Show all {images.length} photos
              </Button>
            )}
          </div>

          {/* Photo Modal - Show all images */}
          {showAllPhotos && (
            <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
              <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                  <DialogTitle>All photos ({images.length})</DialogTitle>
                </DialogHeader>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        {img ? (
                          <img
                            src={img}
                            alt={`${property.title} ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent) {
                                parent.className = 'absolute inset-0';
                                parent.style.background = 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)';
                                parent.innerHTML = '';
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
                            }}
                          />
                        )}
                      </div>
                      ))}
                  </div>
                ) : (
                  <div 
                    className="flex items-center justify-center py-12 rounded-lg min-h-96"
                    style={{
                      background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Location */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-4xl font-bold" data-testid="text-property-title">
                    {property.title}
                  </h1>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`transition-all duration-200 ${isFavorite ? 'bg-primary text-white border-primary' : 'hover:bg-primary hover:text-white hover:border-primary'}`}
                      onClick={() => favoriteMutation.mutate()}
                      data-testid="button-add-favorite"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-white' : ''}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out ${property.title} on StayHub!`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                      }}
                      data-testid="button-share-facebook"
                      title="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out ${property.title} on StayHub!`;
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                      }}
                      data-testid="button-share-twitter"
                      title="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary"
                      onClick={() => {
                        const url = window.location.href;
                        const text = `Check out ${property.title} on StayHub!`;
                        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`, '_blank');
                      }}
                      data-testid="button-share-email"
                      title="Share via Email"
                    >
                      <Mail className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">(127 reviews)</span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{property.location}</span>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Badge className="bg-primary/10 text-primary">{property.propertyType}</Badge>
                  <Badge className="bg-primary/10 text-primary">{property.category}</Badge>
                </div>
              </div>

              <Separator />

              {/* Reviews Section */}
              {reviews && reviews.length > 0 && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      Reviews ({reviews.length})
                    </h2>
                    <div className="space-y-4">
                      {reviews.slice(0, 5).map((review) => (
                        <Card key={review.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm">{review.title || 'Review'}</p>
                                <p className="text-sm text-muted-foreground">Rating: {review.rating}/5</p>
                              </div>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Host Info */}
              {host && (
                <Card className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={host.profileImageUrl || undefined} />
                          <AvatarFallback>{host.firstName?.[0]}{host.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">Hosted by {host.firstName} {host.lastName}</p>
                          <p className="text-sm text-muted-foreground">Superhost • 127 reviews</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        data-testid="button-contact-host"
                        onClick={async () => {
                          if (!host?.id) return;
                          try {
                            const response = await apiRequest('POST', '/api/conversations', {
                              participantId: host.id
                            });
                            const conversation = await response.json();
                            navigate(`/messages?conversationId=${conversation.id}`);
                          } catch (error) {
                            toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">About this place</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              <Separator />

              {/* Amenities */}
              {amenities.length > 0 && (
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Wifi className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl border rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary" data-testid="text-price-per-night">
                      ${price}
                    </span>
                    <span className="text-base font-normal text-muted-foreground">/ noche</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de entrada</label>
                      <input
                        type="date"
                        value={dateRange?.from ? new Date(dateRange.from).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value + 'T00:00:00');
                            setDateRange({ from: date, to: dateRange?.to });
                          }
                        }}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                        data-testid="input-check-in"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de salida</label>
                      <input
                        type="date"
                        value={dateRange?.to ? new Date(dateRange.to).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value + 'T00:00:00');
                            setDateRange({ from: dateRange?.from, to: date });
                          }
                        }}
                        className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                        data-testid="input-check-out"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Huéspedes</label>
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1"
                      data-testid="input-guests"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Método de pago</label>
                    <select className="w-full px-3 py-2 border border-input rounded-md text-sm mt-1" data-testid="select-payment-method">
                      <option>Tarjeta de crédito</option>
                      <option>PayPal</option>
                      <option>Transferencia bancaria</option>
                    </select>
                  </div>

                  {booking && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>${price} × {booking.nights} noche{booking.nights !== 1 ? 's' : ''}</span>
                          <span>${booking.subtotal.toFixed(2)}</span>
                        </div>
                        {cleaningFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Cuota de limpieza</span>
                            <span>${cleaningFee.toFixed(2)}</span>
                          </div>
                        )}
                        {serviceFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Cuota de servicio</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Impuesto (6.25%)</span>
                          <span>${booking.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span data-testid="text-total-price">${booking.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                    disabled={!dateRange?.from || !dateRange?.to || dateRange.to <= dateRange.from}
                    onClick={handleBooking}
                    data-testid="button-reserve"
                  >
                    Reservar Ahora
                  </Button>
                  {dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from && (
                    <p className="text-xs text-destructive text-center">La fecha de salida debe ser posterior a la de entrada</p>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    No se le cobrará aún
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Photo Gallery Dialog */}
      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>All Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${property.title} ${idx + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
