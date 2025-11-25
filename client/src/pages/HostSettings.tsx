import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Mail, User, LogOut } from "lucide-react";

export default function HostSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingAlerts: true,
    reviewNotifications: true,
    weeklyDigest: false,
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

  const handleDisconnectPayment = () => {
    toast({
      title: "Payment method disconnected",
      description: "Your payment method has been safely removed.",
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Section */}
      <Card>
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
              <p className="font-medium">{user?.firstName || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Last Name</label>
              <p className="font-medium">{user?.lastName || 'N/A'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium">{user?.email || 'N/A'}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm text-muted-foreground">Account Status</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Active Host</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Settings */}
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
                onChange={() => handleNotificationChange(setting.key)}
                className="h-5 w-5 rounded border-gray-300 cursor-pointer"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Security Settings */}
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
            <Button variant="outline" size="sm" onClick={handleChangePassword}>Change</Button>
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

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected Payment Method</p>
                <p className="text-sm text-muted-foreground">Stripe Account</p>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleDisconnectPayment}
          >
            Disconnect Payment Method
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
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
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/5">
              Deactivate Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
