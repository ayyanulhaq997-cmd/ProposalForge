import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import CreatePropertyForm from "@/components/CreatePropertyForm";

export default function NewProperty() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, isHost, isAdmin } = useAuth();

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

  return <CreatePropertyForm onSuccess={() => navigate("/host")} />;
}
