import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">404</h1>
            <p className="text-lg font-semibold mb-4">Page Not Found</p>
            <p className="text-sm text-muted-foreground mb-6">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>

            <Button onClick={() => navigate("/")} className="w-full">
              <div className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
