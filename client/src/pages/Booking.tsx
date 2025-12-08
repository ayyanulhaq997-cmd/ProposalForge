import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, CreditCard, Shield, AlertCircle, Calendar, CheckCircle2, UserCheck } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { StripePaymentForm } from "@/components/StripePaymentForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@shared/schema";
import { format } from "date-fns";

interface IDVerification {
  id: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function Booking() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: verification, isLoading: verificationLoading } = useQuery<IDVerification | null>({
    queryKey: ['/api/user/verification'],
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const isVerified = verification?.status === 'verified';
  const isPendingVerification = verification?.status === 'pending';
  const isRejectedVerification = verification?.status === 'rejected';
  const hasPaymentVerification = (user as any)?.paymentVerified === true;
  // Use window.location.search to get query params (wouter location doesn't include them)
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');
  const guests = guestsParam ? parseInt(guestsParam) : 1;
  
  // DEBUG: Log what we're getting from URL
  if (typeof window !== 'undefined') {
    console.log('=== BOOKING PAGE DEBUG ===');
    console.log('Full URL:', window.location.href);
    console.log('Search string:', window.location.search);
    console.log('Raw params:', { checkInParam, checkOutParam, guestsParam });
  }

  const [specialRequests, setSpecialRequests] = useState("");
  const [step, setStep] = useState<'selectDate' | 'payment' | 'confirmation'>('selectDate');
  
  // Parse dates from URL params (handle timezone safely)
  const parseDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    
    // Parse YYYY-MM-DD format directly from ISO string
    // This ensures consistency and avoids timezone conversion
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    
    // Validate numbers are in valid ranges
    if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    
    // Create date using UTC to be consistent with ISO format
    const date = new Date(Date.UTC(year, month - 1, day));
    
    return date;
  };

  const checkInDate = parseDate(checkInParam);
  const checkOutDate = parseDate(checkOutParam);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id,
  });
  
  const isCheckInValid = checkInDate !== null && !isNaN(checkInDate.getTime());
  const isCheckOutValid = checkOutDate !== null && !isNaN(checkOutDate.getTime());
  
  // Determine validation state
  let validationMessage = "";
  let isFormValid = false;

  if (!isCheckInValid && !isCheckOutValid) {
    validationMessage = "Select dates to book";
  } else if (isCheckInValid && !isCheckOutValid) {
    validationMessage = "Select checkout date";
  } else if (isCheckInValid && isCheckOutValid && checkInDate && checkOutDate) {
    if (checkOutDate <= checkInDate) {
      validationMessage = "Check-out must be after check-in";
    } else {
      isFormValid = true;
    }
  }

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [bookingData, setBookingData] = useState<any>(null);

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== API REQUEST SENT ===');
      return await apiRequest('POST', '/api/bookings', data);
    },
    onSuccess: async (response) => {
      console.log('=== API RESPONSE SUCCESS ===');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (data.booking?.id) {
        console.log('Booking created:', data.booking.id);
        setBookingId(data.booking.id);
        setBookingData(data.booking);
        setStep('payment');
        console.log('Step changed to: payment');
        toast({
          title: "Success!",
          description: "Booking reserved. Proceed to payment.",
        });
      } else {
        console.log('No booking ID in response');
      }
    },
    onError: (error: Error) => {
      console.log('=== API RESPONSE ERROR ===');
      console.log('Error:', error);
      console.log('Error message:', error.message);
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReserveClick = () => {
    if (!isFormValid || !checkInDate || !checkOutDate) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: isPendingVerification 
          ? "Your ID verification is still pending. Please wait for admin approval."
          : "Please complete ID verification before booking.",
        variant: "destructive",
      });
      return;
    }
    
    // Format dates in local timezone (not UTC) to avoid 1-day offset
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const checkInStr = formatDateLocal(checkInDate);
    const checkOutStr = formatDateLocal(checkOutDate);
    
    console.log('=== BOOKING SUBMISSION ===');
    console.log('Form valid:', isFormValid);
    console.log('Data being sent:', {
      propertyId: property?.id,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      guests,
      specialRequests,
    });
    
    if (property?.id) {
      bookingMutation.mutate({
        propertyId: property.id,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        guests,
        specialRequests,
      });
    }
  };

  // Auto-trigger payment form after booking created
  useEffect(() => {
    if (bookingId && step === 'payment' && !showPaymentForm) {
      setShowPaymentForm(true);
    }
  }, [bookingId, step, showPaymentForm]);

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
            <Button onClick={() => navigate("/search")}>
              Search properties
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pricing if dates are valid
  let nights = 1;
  let price = 0;
  let cleaningFee = 0;
  let serviceFee = 0;
  let tax = 0;
  let total = 0;

  if (isFormValid) {
    nights = Math.ceil((checkOutDate!.getTime() - checkInDate!.getTime()) / (1000 * 60 * 60 * 24));
    price = Number(property?.pricePerNight || 0);
    cleaningFee = Number(property.cleaningFee || 0);
    serviceFee = Number(property.serviceFee || 0);
    const taxRate = Number(property.taxRate || 0.0625);
    const subtotal = price * nights;
    tax = (subtotal + cleaningFee + serviceFee) * taxRate;
    total = subtotal + cleaningFee + serviceFee + tax;
  }


  const handlePaymentSuccess = (paymentId: string) => {
    setStep('confirmation');
    toast({
      title: "Payment successful!",
      description: "Your booking is confirmed.",
    });
    setTimeout(() => {
      navigate("/trips");
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentForm(false);
    toast({
      title: "Payment failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleEditDates = () => {
    // Preserve booking context when editing dates
    const params = new URLSearchParams();
    if (checkInParam) params.set('checkIn', checkInParam);
    if (checkOutParam) params.set('checkOut', checkOutParam);
    params.set('guests', guests.toString());
    navigate(`/property/${id}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Confirm and pay</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Details - Always Visible */}
              <Card data-testid="card-trip-details">
                <CardHeader>
                  <CardTitle>Your trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCheckInValid && isCheckOutValid ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Dates</p>
                          <p className="text-sm text-muted-foreground" data-testid="text-booking-dates">
                            {checkInDate && checkOutDate ? (
                              <>
                                {format(new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate()), 'MMM d')} - {format(new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate()), 'MMM d, yyyy')}
                              </>
                            ) : 'Invalid dates'}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleEditDates}
                          data-testid="button-edit-dates"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Edit dates
                        </Button>
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <div className="py-4">
                      <Alert className="border-warning bg-warning/10">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <AlertDescription className="text-sm">
                          {validationMessage}
                        </AlertDescription>
                      </Alert>
                      <Button 
                        className="w-full mt-4"
                        onClick={handleEditDates}
                        data-testid="button-select-dates"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Select dates
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Guests</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-booking-guests">
                        {guests} guest{guests !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isCheckInValid && isCheckOutValid && (
                      <div className="text-right">
                        <p className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {isFormValid && step === 'selectDate' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special requests (optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any special requests for the host?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={4}
                      data-testid="input-special-requests"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Cancellation Policy */}
              {isFormValid && step === 'selectDate' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Free cancellation before 48 hours of check-in. Cancel before check-in for a 50% refund.
                      Service fees are non-refundable.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stripe Payment Form */}
              {step === 'payment' && isFormValid && (
                <StripePaymentForm
                  bookingId={bookingId}
                  total={total}
                  propertyTitle={property.title}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              {/* Confirmation */}
              {step === 'confirmation' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        Booking Confirmed!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Your booking has been successfully confirmed.</p>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Booking Reference:</span>
                          <span className="text-sm font-mono" data-testid="text-confirmation-id">{bookingId}</span>
                        </div>
                        {bookingData && (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium">Check-in:</span>
                              <span className="text-sm" data-testid="text-confirmation-checkin">{format(new Date(bookingData.checkIn), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Check-out:</span>
                              <span className="text-sm" data-testid="text-confirmation-checkout">{format(new Date(bookingData.checkOut), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Total Paid:</span>
                              <span className="text-sm font-semibold" data-testid="text-confirmation-total">${Number(bookingData.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Status:</span>
                              <span className="text-sm" data-testid="text-confirmation-status">{bookingData.status}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <Separator />
                      <p className="text-xs text-muted-foreground">You will be redirected to your trips page shortly. Confirmation sent to your email.</p>
                    </CardContent>
                  </Card>

                  {/* Booking Activity Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Payment received</p>
                            <p className="text-xs text-muted-foreground">Your payment has been processed successfully</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-600">✓</span>
                          </div>
                          <div>
                            <p className="font-medium">Booking created</p>
                            <p className="text-xs text-muted-foreground">Your booking is pending host confirmation</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-400">→</span>
                          </div>
                          <div>
                            <p className="font-medium">Awaiting confirmation</p>
                            <p className="text-xs text-muted-foreground">Host will review and confirm your booking shortly</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback
                        src={(property?.images as string[])?.[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-2" data-testid="text-property-name">{property?.title}</h3>
                      <p className="text-sm text-muted-foreground">{property?.location}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Booking Flow Steps Indicator */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className={step !== 'selectDate' ? 'text-primary font-semibold' : ''}>
                        ✓ Select Date
                      </span>
                      <div className={`flex-1 h-0.5 mx-2 ${step !== 'selectDate' ? 'bg-primary' : 'bg-muted'}`} />
                      <span className={step === 'payment' || step === 'confirmation' ? 'text-primary font-semibold' : ''}>
                        {step !== 'selectDate' ? '✓' : ''} Payment
                      </span>
                      <div className={`flex-1 h-0.5 mx-2 ${step === 'confirmation' ? 'bg-primary' : 'bg-muted'}`} />
                      <span className={step === 'confirmation' ? 'text-primary font-semibold' : ''}>
                        {step === 'confirmation' ? '✓' : ''} Confirmation
                      </span>
                    </div>
                  </div>

                  {isFormValid && step === 'selectDate' ? (
                    <>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>${price} × {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span>${(price * nights).toFixed(2)}</span>
                        </div>
                        {cleaningFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Cleaning fee</span>
                            <span>${cleaningFee.toFixed(2)}</span>
                          </div>
                        )}
                        {serviceFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Service fee</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Tax (6.25%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total (USD)</span>
                          <span data-testid="text-total">${total.toFixed(2)}</span>
                        </div>
                      </div>

                      {!isAuthenticated ? (
                        <div className="space-y-3">
                          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-900 dark:text-blue-300">
                              Please log in to proceed with your booking
                            </AlertDescription>
                          </Alert>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => navigate("/login")}
                            data-testid="button-login-to-book"
                          >
                            Log in to Book
                          </Button>
                        </div>
                      ) : !isVerified ? (
                        <div className="space-y-3">
                          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-sm text-amber-900 dark:text-amber-300">
                              {isPendingVerification 
                                ? "Your ID verification is pending admin approval. Please wait for confirmation."
                                : isRejectedVerification
                                ? `ID verification was rejected: ${verification?.rejectionReason || 'Please resubmit your documents'}`
                                : "Complete KYC verification to proceed with booking"}
                            </AlertDescription>
                          </Alert>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => navigate("/verify")}
                            data-testid="button-complete-kyc"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            {isPendingVerification ? "Check Verification Status" : "Complete KYC Verification"}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={handleReserveClick}
                            disabled={bookingMutation.isPending}
                            data-testid="button-reserve"
                          >
                            {bookingMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Proceeding to payment...
                              </>
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Proceed to Payment
                              </>
                            )}
                          </Button>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                            <Shield className="h-4 w-4" />
                            <span>No charge yet</span>
                          </div>
                        </>
                      )}
                    </>
                  ) : step === 'payment' && isFormValid ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Enter your payment information below</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-4">
                        {validationMessage}
                      </p>
                      <Button
                        className="w-full"
                        onClick={handleEditDates}
                        data-testid="button-select-dates-sidebar"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Select dates
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
