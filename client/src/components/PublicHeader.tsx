import { Link, useLocation } from "wouter";
import { Menu, User, Heart, MessageSquare, Home, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function PublicHeader() {
  const { user, isAuthenticated, isAdmin, isHost } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response: any = await apiRequest('GET', '/api/logout');
      
      // Invalidate auth cache so app knows user is logged out
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Show success message
      toast({
        title: "Logged out",
        description: response?.message || "You have been successfully logged out",
      });
      
      // Redirect to homepage after a brief delay to show toast
      setTimeout(() => navigate("/"), 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate rounded-md px-3 py-2 active-elevate-2" data-testid="link-home">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline font-semibold text-sm text-foreground">StayHub</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/search")} className={isActive("/search") ? "text-primary" : ""} data-testid="link-search">
              <SearchIcon className="h-4 w-4 mr-1.5" />
              Explore
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className={isActive("/blog") ? "text-primary" : ""} data-testid="link-blog">
              Blog
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {isAuthenticated && !isHost && !isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/trips")} className="hidden sm:inline-flex" data-testid="link-trips-header">
                My Trips
              </Button>
            )}

            {isHost && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/host")} data-testid="link-host-dashboard">
                Host Panel
              </Button>
            )}

            <ThemeToggle />

            {!isAuthenticated ? (
              <Button onClick={() => navigate("/login")} data-testid="button-login">Sign in</Button>
            ) : (
              <>
                {!isHost && !isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} data-testid="link-messages">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-10 gap-2 hover-elevate active-elevate-2"
                      data-testid="button-user-menu"
                    >
                      <Menu className="h-4 w-4" />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                        <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium" data-testid="text-user-name">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    
                {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="link-admin-dashboard">Admin Dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {isHost && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/host")} data-testid="link-host-panel">Host Panel</DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={() => navigate("/trips")} data-testid="link-trips">My Trips</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")} data-testid="link-favorites">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")} data-testid="link-messages-menu">Messages</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
