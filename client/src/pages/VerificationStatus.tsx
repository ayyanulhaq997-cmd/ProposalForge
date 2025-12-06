import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/PublicHeader";
import { IDVerificationUpload, IDVerificationStatus } from "@/components/IDVerificationUpload";
import { Card, CardContent } from "@/components/ui/card";

interface IDVerification {
  id: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function VerificationStatus() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: verification, isLoading } = useQuery<IDVerification | null>({
    queryKey: ['/api/user/verification'],
    enabled: isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Please log in to check verification status</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account Verification</h1>
            <p className="text-muted-foreground mt-2">
              Verify your identity to access all features
            </p>
          </div>

          <div className="space-y-4">
            {verification && <IDVerificationStatus verification={verification} />}
            {!verification || verification.status === 'rejected' ? (
              <IDVerificationUpload />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
