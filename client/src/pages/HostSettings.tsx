import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, CreditCard, User, Loader2 } from "lucide-react";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import { useLocation } from "wouter";

function SettingsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingAlerts: true,
    reviewNotifications: true,
    weeklyDigest: false,
  });

  const { data: userData, isLoading } = useQuery<any>({
    queryKey: ['/api/user/profile'],
  });

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Feature coming soon",
      description: "Password change feature will be available soon.",
    });
  };

  const handleSetupPayment = () => {
    toast({
      title: "Feature coming soon",
      description: "Stripe Connect integration for hosts is coming soon.",
    });
  };

  const handleDisconnectPayment = () => {
    toast({
      title: "Payment method disconnected",
      description: "Your payment method has been safely removed.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPaymentConnected = userData?.profile?.paymentVerified || false;
  const isKycVerified = userData?.profile?.kycVerified || false;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold" data-testid="text-host-settings-title">Host Settings</h1>

      <Card data-testid="card-profile-information">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">First Name</label>
              <p className="font-medium" data-testid="text-firstname">{user?.firstName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <p className="font-medium" data-testid="text-lastname">{user?.lastName || 'N/A'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium" data-testid="text-email">{user?.email || 'N/A'}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-muted-foreground">Account Status</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" data-testid="badge-host-status">Active Host</Badge>
                {isKycVerified && <Badge variant="outline" data-testid="badge-kyc-verified">ID Verified</Badge>}
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-edit-profile">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive email updates about your bookings',
            },
            {
              key: 'bookingAlerts',
              label: 'Booking Alerts',
              description: 'Get notified when you receive new bookings',
            },
            {
              key: 'reviewNotifications',
              label: 'Review Notifications',
              description: 'Be notified when guests leave reviews',
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Receive a summary of your activity each week',
            },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{setting.label}</p>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                onChange={() => handleNotificationChange(setting.key as keyof typeof notificationSettings)}
                className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                data-testid={`checkbox-${setting.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your password regularly</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangePassword} data-testid="button-change-password">
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add extra security to your account</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">Login History</p>
              <p className="text-sm text-muted-foreground">View recent login activity</p>
            </div>
            <Button variant="outline" size="sm" disabled>View</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card data-testid="card-payout-method">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payout Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPaymentConnected ? (
            <>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Account</p>
                    <p className="text-sm text-muted-foreground">Receive payouts for your bookings</p>
                  </div>
                  <Badge variant="default" data-testid="badge-payment-connected">Connected</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleDisconnectPayment}
                data-testid="button-disconnect-payment"
              >
                Disconnect Payment Method
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 border rounded-lg border-dashed">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">No Payment Method Connected</p>
                    <p className="text-sm text-muted-foreground">Set up a payout method to receive earnings</p>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
              </div>
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleSetupPayment}
                data-testid="button-setup-payment"
              >
                Set Up Payment Method
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
            <p className="font-medium text-destructive mb-2">Deactivate Account</p>
            <p className="text-sm text-muted-foreground mb-4">
              Temporarily suspend your host account. You can reactivate it later.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive border-destructive hover:bg-destructive/5"
              data-testid="button-deactivate"
            >
              Deactivate Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HostSettings() {
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

  return (
    <HostDashboardLayout>
      <SettingsContent />
    </HostDashboardLayout>
  );
}
