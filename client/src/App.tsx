import { useEffect, useState } from "react";
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
import AdminDashboard from "@/pages/AdminDashboard";
import AdminBookings from "@/pages/AdminBookings";
import AdminContentManager from "@/pages/AdminContentManager";
import HostDashboard from "@/pages/HostDashboard";
import HostProfile from "@/pages/HostProfile";
import UserStatsPage from "@/pages/UserStatsPage";
import StayHistory from "@/pages/StayHistory";
import ProfileManagement from "@/pages/ProfileManagement";
import Login from "@/pages/Login";
import Blog from "@/pages/Blog";

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isHost } = useAuth();

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={Login} />

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
      <Route path="/stats" component={UserStatsPage} />
      <Route path="/stays" component={StayHistory} />
      <Route path="/profile" component={ProfileManagement} />
      <Route path="/host-profile/:hostId" component={HostProfile} />

      {/* Host routes */}
      {isHost && (
        <>
          <Route path="/host" component={HostDashboard} />
          <Route path="/host/:rest*" component={HostDashboard} />
        </>
      )}

      {/* Admin routes - accessible if authenticated and admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/content" component={AdminContentManager} />

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
