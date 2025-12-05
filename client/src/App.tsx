import { useEffect, useState, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import PropertyDetail from "@/pages/PropertyDetail";
import Booking from "@/pages/Booking";
import Trips from "@/pages/Trips";
import Messages from "@/pages/Messages";
import Favorites from "@/pages/Favorites";
import Login from "@/pages/Login";
import Blog from "@/pages/Blog";
import VerificationStatus from "@/pages/VerificationStatus";
import VerificationRequired from "@/pages/VerificationRequired";

// Lazy load heavy admin/host pages
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminBookings = lazy(() => import("@/pages/AdminBookings"));
const AdminContentManager = lazy(() => import("@/pages/AdminContentManager"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const HostDashboard = lazy(() => import("@/pages/HostDashboard"));
const HostProperties = lazy(() => import("@/pages/HostProperties"));
const HostBookings = lazy(() => import("@/pages/HostBookings"));
const NewProperty = lazy(() => import("@/pages/NewProperty"));
const HostProfile = lazy(() => import("@/pages/HostProfile"));
const HostSettings = lazy(() => import("@/pages/HostSettings"));
const HostEarnings = lazy(() => import("@/pages/HostEarnings"));
const UserStatsPage = lazy(() => import("@/pages/UserStatsPage"));
const StayHistory = lazy(() => import("@/pages/StayHistory"));
const ProfileManagement = lazy(() => import("@/pages/ProfileManagement"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isHost } = useAuth();

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/verify-required" component={VerificationRequired} />

      {/* Landing page for unauthenticated users */}
      <Route path="/landing" component={Landing} />

      {/* Home - shows landing if not authenticated, otherwise shows home */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />

      {/* Property routes - accessible to all */}
      <Route path="/search" component={Search} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/book/:id" component={Booking} />
      <Route path="/blog" component={Blog} />

      {/* User routes */}
      <Route path="/trips" component={Trips} />
      <Route path="/messages" component={Messages} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/verify" component={VerificationStatus} />
      
      {/* Lazy loaded user routes */}
      <Route path="/stats" component={() => <Suspense fallback={<PageLoader />}><UserStatsPage /></Suspense>} />
      <Route path="/stays" component={() => <Suspense fallback={<PageLoader />}><StayHistory /></Suspense>} />
      <Route path="/profile" component={() => <Suspense fallback={<PageLoader />}><ProfileManagement /></Suspense>} />
      <Route path="/host-profile/:hostId" component={() => <Suspense fallback={<PageLoader />}><HostProfile /></Suspense>} />

      {/* Host routes - admins can also access - Lazy loaded */}
      <Route path="/host/properties/new" component={() => <Suspense fallback={<PageLoader />}><NewProperty /></Suspense>} />
      <Route path="/host/properties/:id/edit" component={() => <Suspense fallback={<PageLoader />}><NewProperty /></Suspense>} />
      <Route path="/host/properties" component={() => <Suspense fallback={<PageLoader />}><HostProperties /></Suspense>} />
      <Route path="/host/bookings" component={() => <Suspense fallback={<PageLoader />}><HostBookings /></Suspense>} />
      <Route path="/host/earnings" component={() => <Suspense fallback={<PageLoader />}><HostEarnings /></Suspense>} />
      <Route path="/host/settings" component={() => <Suspense fallback={<PageLoader />}><HostSettings /></Suspense>} />
      <Route path="/host" component={() => <Suspense fallback={<PageLoader />}><HostDashboard /></Suspense>} />

      {/* Admin routes - accessible if authenticated and admin - Lazy loaded */}
      <Route path="/admin" component={() => <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
      <Route path="/admin/settings" component={() => <Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
      <Route path="/admin/bookings" component={() => <Suspense fallback={<PageLoader />}><AdminBookings /></Suspense>} />
      <Route path="/admin/content" component={() => <Suspense fallback={<PageLoader />}><AdminContentManager /></Suspense>} />
      <Route path="/admin/:rest*" component={() => <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
