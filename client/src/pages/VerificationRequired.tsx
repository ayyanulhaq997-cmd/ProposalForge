import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { PublicHeader } from "@/components/PublicHeader";
import { IDVerificationUpload, IDVerificationStatus } from "@/components/IDVerificationUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerificationRequired() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const { data: verification, isLoading } = useQuery({
    queryKey: ['/api/user/verification'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Verified - redirect to home
  if (verification?.status === 'verified') {
    useEffect(() => {
      setLocation('/');
    }, []);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Verify Your Identity</h1>
            <p className="text-muted-foreground mt-2">
              Complete account verification to start booking and hosting
            </p>
          </div>

          {/* Status Card */}
          {verification && (
            <div className="space-y-4">
              {verification.status === 'pending' && (
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      Verification Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Your ID has been submitted. An admin will review and verify within 24 hours.
                    </p>
                  </CardContent>
                </Card>
              )}

              {verification.status === 'rejected' && (
                <Card className="border-destructive bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive">Verification Rejected</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">
                      {verification.rejectionReason || 'Your verification was rejected.'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please resubmit with a clear, valid document.
                    </p>
                  </CardContent>
                </Card>
              )}

              <IDVerificationStatus verification={verification} />
            </div>
          )}

          {/* Upload Section */}
          {!verification || verification.status === 'rejected' ? (
            <IDVerificationUpload />
          ) : null}

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm text-blue-900 dark:text-blue-300">
                Why We Need ID Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <p>
                ✓ Security: We verify the identity of all users
              </p>
              <p>
                ✓ Trust: Guests and hosts know they're dealing with real people
              </p>
              <p>
                ✓ Compliance: Legal requirement for rental platforms
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
