import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SquarePaymentFormProps {
  bookingId: string;
  total: number;
  propertyTitle: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function SquarePaymentForm({
  bookingId,
  total,
  propertyTitle,
  onSuccess,
  onError,
  disabled = false,
}: SquarePaymentFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle"
  );

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      // Request Square source token from backend
      const tokenResponse = await apiRequest("POST", "/api/square/request-token", {
        bookingId,
        amount: Math.round(total * 100), // Convert to cents
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Failed to create payment token');
      }

      const { clientToken } = await tokenResponse.json();

      // Initialize Square Web Payments SDK
      const squareScriptUrl = 'https://web.squarecdn.com/v1/square.js';
      
      // Load Square script if not already loaded
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = squareScriptUrl;
        script.async = true;
        script.onload = () => {
          initializeSquarePayment(clientToken);
        };
        script.onerror = () => {
          throw new Error('Failed to load Square payment SDK');
        };
        document.head.appendChild(script);
      } else {
        initializeSquarePayment(clientToken);
      }
    } catch (err: any) {
      setPaymentStatus("error");
      const errorMessage = err.message || "Payment processing failed";
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const initializeSquarePayment = async (clientToken: string) => {
    try {
      // Initialize Square Web Payments SDK with client token
      const payments = window.Square?.payments(
        import.meta.env.VITE_SQUARE_APPLICATION_ID,
        import.meta.env.VITE_SQUARE_LOCATION_ID
      );

      if (!payments) {
        throw new Error('Failed to initialize Square Payments');
      }

      // Create card payment method
      const cardPaymentMethod = await payments.cardPaymentMethod();

      // Request payment from the Web Payments SDK
      const paymentRequest = payments.paymentRequest({
        amount: Math.round(total * 100),
        currencyCode: 'USD',
      });

      const paymentPromise = await paymentRequest.show();

      // Get the source from the payment method
      const { sourceId } = await cardPaymentMethod.requestCardNonce();

      if (!sourceId) {
        throw new Error('Failed to tokenize card');
      }

      // Send tokenized source to backend for processing
      const paymentResponse = await apiRequest("POST", "/api/square/process-payment", {
        bookingId,
        sourceId,
        amount: Math.round(total * 100),
        currency: 'USD',
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      const paymentData = await paymentResponse.json();

      // Payment processed successfully
      setPaymentStatus("success");
      toast({
        title: "Payment successful",
        description: "Your payment has been processed and your booking is confirmed.",
      });
      setTimeout(() => {
        onSuccess(paymentData.transactionId || "square_" + bookingId);
      }, 1500);
    } catch (err: any) {
      setPaymentStatus("error");
      const errorMessage = err.message || "Payment processing failed";
      onError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Payment Methods */}
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
            <div className="w-12 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded flex items-center justify-center text-white text-xs font-bold">
              SQUARE
            </div>
            <div>
              <p className="font-medium text-sm">Credit or Debit Card</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express, Discover</p>
            </div>
          </div>

          {/* Processing Status */}
          {paymentStatus === "processing" && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-sm text-blue-900">
                Processing payment... Your card will not be charged until payment is confirmed.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-900">
                Payment successful! Transaction confirmed.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "error" && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                Payment failed. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Secure payment (PCI DSS Compliant)</p>
              <p>Square Web Payments SDK tokenizes your card securely. Your card data never touches our servers - only encrypted tokens are transmitted.</p>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="flex justify-between items-center py-3 border-t border-b">
            <span className="font-medium">Total charge</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isProcessing || disabled || paymentStatus === "success"}
            data-testid="button-pay-now"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing payment...
              </>
            ) : paymentStatus === "success" ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Payment complete
              </>
            ) : (
              `Pay $${total.toFixed(2)} with Square`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment information is secure and encrypted. We use Square's PCI-DSS compliant tokenization.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// Add type definition for window.Square
declare global {
  interface Window {
    Square?: any;
  }
}
