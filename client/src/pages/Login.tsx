import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { SiGoogle, SiFacebook } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const hasGoogleAuth = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasFacebookAuth = !!import.meta.env.VITE_FACEBOOK_APP_ID;

  const handleGoogleLogin = () => {
    if (!hasGoogleAuth) {
      toast({ 
        title: "Not Configured", 
        description: "Google login is not yet set up. Please use email and password to login.",
        variant: "destructive" 
      });
      return;
    }
    // Redirect to OAuth endpoint
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
    const scope = 'openid profile email';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleFacebookLogin = () => {
    if (!hasFacebookAuth) {
      toast({ 
        title: "Not Configured", 
        description: "Facebook login is not yet set up. Please use email and password to login.",
        variant: "destructive" 
      });
      return;
    }
    // Redirect to OAuth endpoint
    const redirectUri = `${window.location.origin}/api/auth/facebook/callback`;
    const clientId = import.meta.env.VITE_FACEBOOK_APP_ID!;
    const scope = 'public_profile,email';
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/signup" : "/api/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup 
          ? formData
          : { email: formData.email, password: formData.password }
        ),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Invalidate auth cache to refresh user state
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({ 
        title: "Success", 
        description: isSignup 
          ? data.message || "Account created successfully! Welcome to StayHub." 
          : "Welcome back!" 
      });
      setLocation("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? "Create Account" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignup 
              ? "Create a new StayHub account"
              : "Sign in to your StayHub account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    data-testid="input-firstname"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    data-testid="input-lastname"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="input-password"
              />
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    data-testid="checkbox-remember-me"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm p-0 h-auto font-normal"
                  data-testid="button-forgot-password"
                >
                  Forgot password?
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit">
              {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {!isSignup && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  data-testid="button-google-login"
                >
                  <SiGoogle className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Google</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleFacebookLogin}
                  data-testid="button-facebook-login"
                >
                  <SiFacebook className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Facebook</span>
                </Button>
              </div>
            </>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
              data-testid="button-toggle-signup"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
