import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StripePaymentFormProps {
  bookingId: string;
  total: number;
  propertyTitle: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function StripePaymentForm({
  bookingId,
  total,
  propertyTitle,
  onSuccess,
  onError,
  disabled = false,
}: StripePaymentFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardErrors, setCardErrors] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  // Format card number input (add spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const validateCardNumber = (num: string): boolean => {
    const cleaned = num.replace(/\s/g, "");
    return cleaned.length >= 13 && cleaned.length <= 19;
  };

  const validateExpiryDate = (date: string): boolean => {
    return /^\d{2}\/\d{2}$/.test(date);
  };

  const validateCVC = (code: string): boolean => {
    return /^\d{3,4}$/.test(code);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardErrors("");

    // Validate inputs
    if (!validateCardNumber(cardNumber)) {
      setCardErrors("Invalid card number. Please enter a valid 13-19 digit card number.");
      return;
    }
    if (!validateExpiryDate(expiryDate)) {
      setCardErrors("Invalid expiry date. Please use MM/YY format.");
      return;
    }
    if (!validateCVC(cvc)) {
      setCardErrors("Invalid CVC. Please enter 3 or 4 digits.");
      return;
    }
    if (!cardholderName.trim()) {
      setCardErrors("Cardholder name is required.");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      // Process payment through Square
      const response = await apiRequest("POST", "/api/process-payment", {
        bookingId,
        amount: Math.round(total * 100), // Convert to cents
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryDate: expiryDate,
        cvc: cvc,
        cardholderName: cardholderName,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Payment processing failed");
      }

      // Payment successful
      setPaymentStatus("success");
      toast({
        title: "Payment successful",
        description: "Your payment has been processed and your booking is confirmed.",
      });
      setTimeout(() => {
        onSuccess(data.transactionId || data.squarePaymentId);
      }, 1500);
    } catch (err: any) {
      setPaymentStatus("error");
      const errorMessage = err.message || "Payment processing failed";
      setCardErrors(errorMessage);
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
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
            <div className="w-12 h-8 bg-gradient-to-r from-green-600 to-green-800 rounded flex items-center justify-center text-white text-xs font-bold">
              SQUARE
            </div>
            <div>
              <p className="font-medium text-sm">Credit or Debit Card</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Cardholder name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
              data-testid="input-cardholder-name"
            />
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card">Card number</Label>
            <Input
              id="card"
              placeholder="Enter your 16-digit card number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              disabled={isProcessing}
              maxLength={19}
              data-testid="input-card-number"
            />
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                disabled={isProcessing}
                maxLength={5}
                data-testid="input-expiry-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="3 or 4 digits"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                disabled={isProcessing}
                maxLength={4}
                data-testid="input-cvc"
              />
            </div>
          </div>

          {/* Card Errors */}
          {cardErrors && (
            <Alert className="border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                {cardErrors}
              </AlertDescription>
            </Alert>
          )}

          {/* Processing Status */}
          {paymentStatus === "processing" && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-sm text-blue-900">
                Processing payment...
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-900">
                Payment successful!
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Secure payment</p>
              <p>Your card information is encrypted and secure. We never store your full card details.</p>
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
              `Pay $${total.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment information is secure and encrypted
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
