import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import CreatePropertyForm from "@/components/CreatePropertyForm";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";

export default function NewProperty() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, isHost, isAdmin } = useAuth();
  const [match, params] = useRoute("/host/properties/:id/edit");
  const propertyId = match ? params?.id : undefined;

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
      <CreatePropertyForm 
        onSuccess={() => navigate("/host/properties")} 
        propertyId={propertyId}
      />
    </HostDashboardLayout>
  );
}
