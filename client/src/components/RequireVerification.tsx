import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IDVerification {
  id: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

interface RequireVerificationProps {
  children: React.ReactNode;
}

export function RequireVerification({ children }: RequireVerificationProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: verification, isLoading: verifyLoading } = useQuery<IDVerification | null>({
    queryKey: ['/api/user/verification'],
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  if (authLoading || verifyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - allow component to handle it
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated but not verified
  if (!verification || verification.status !== 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 space-y-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">Account Verification Required</h2>
            <p className="text-muted-foreground">
              {verification?.status === 'pending'
                ? "Your ID verification is pending. Please wait for admin approval."
                : "You must verify your identity before accessing this feature."}
            </p>
            {verification?.status === 'rejected' && verification?.rejectionReason && (
              <div className="bg-destructive/10 border border-destructive rounded p-3">
                <p className="text-sm text-destructive font-medium">
                  Rejection reason: {verification.rejectionReason}
                </p>
              </div>
            )}
            <Button
              onClick={() => setLocation('/verify')}
              className="w-full"
              data-testid="button-complete-verification"
            >
              {verification?.status === 'rejected' ? 'Resubmit ID' : 'Verify Your ID'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verified - show component
  return <>{children}</>;
}
