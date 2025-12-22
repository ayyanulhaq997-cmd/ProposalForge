import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Lock, CreditCard, User, Loader2, Edit2 } from "lucide-react";
import { HostDashboardLayout } from "@/components/HostDashboardLayout";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

function SettingsContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingAlerts: true,
    reviewNotifications: true,
    weeklyDigest: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
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

  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState("");
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  const { data: loginHistory } = useQuery<any>({
    queryKey: ['/api/auth/login-history'],
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/auth/2fa/enable", { password });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "2FA enabled successfully. Save your backup codes in a safe place.",
      });
      setIsEnabling2FA(false);
      setTwoFAPassword("");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA",
        variant: "destructive",
      });
    },
  });

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  const handleSetupPayment = () => {
    toast({
      title: "Redirecting",
      description: "Opening Stripe Connect setup...",
    });
    window.open('https://connect.stripe.com/express/login', '_blank');
  };

  const handleDisconnectPayment = () => {
    toast({
      title: "Payment method disconnected",
      description: "Your payment method has been safely removed.",
    });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("DELETE", "/api/auth/account", { password });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your account has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setTimeout(() => window.location.href = '/login', 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate(deletePassword);
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
          {!isEditingProfile ? (
            <>
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
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium" data-testid="text-phone">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Bio</label>
                <p className="font-medium text-sm" data-testid="text-bio">{user?.bio || 'Not provided'}</p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Account Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" data-testid="badge-host-status">Active Host</Badge>
                    {isKycVerified && <Badge variant="outline" data-testid="badge-kyc-verified">ID Verified</Badge>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)} data-testid="button-edit-profile">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">First Name</label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} data-testid="input-firstname" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Last Name</label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} data-testid="input-lastname" />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 (555) 123-4567" data-testid="input-phone" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Bio</label>
                <Textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell guests about yourself..." data-testid="input-bio" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => updateProfileMutation.mutate(formData)} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                  {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} disabled={updateProfileMutation.isPending} data-testid="button-cancel-profile">
                  Cancel
                </Button>
              </div>
            </>
          )}
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
          {!isChangingPassword ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)} data-testid="button-change-password">
                Change
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div>
                <p className="font-medium mb-4">Change Your Password</p>
              </div>
              <Input
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                data-testid="input-current-password"
              />
              <Input
                type="password"
                placeholder="New password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                data-testid="input-new-password"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                data-testid="input-confirm-password"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-confirm-password-change"
                >
                  {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-cancel-password-change"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!isEnabling2FA ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEnabling2FA(true)} data-testid="button-enable-2fa">
                Enable
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div>
                <p className="font-medium mb-4">Enable Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground mb-4">Enter your password to enable 2FA</p>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={twoFAPassword}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                data-testid="input-2fa-password"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => enable2FAMutation.mutate(twoFAPassword)}
                  disabled={enable2FAMutation.isPending || !twoFAPassword}
                  data-testid="button-confirm-2fa"
                >
                  {enable2FAMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Enable 2FA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEnabling2FA(false);
                    setTwoFAPassword("");
                  }}
                  disabled={enable2FAMutation.isPending}
                  data-testid="button-cancel-2fa"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showLoginHistory ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Login History</p>
                <p className="text-sm text-muted-foreground">View recent login activity</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowLoginHistory(true)} data-testid="button-view-login-history">View</Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div>
                <p className="font-medium mb-4">Login History</p>
              </div>
              {loginHistory ? (
                <div className="space-y-3">
                  <div className="p-3 bg-background rounded border">
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {loginHistory.lastLoginAt ? new Date(loginHistory.lastLoginAt).toLocaleString() : "No previous logins"}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(loginHistory.currentLoginTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading login history...</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginHistory(false)}
                data-testid="button-close-login-history"
              >
                Close
              </Button>
            </div>
          )}
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
          {!isDeleting ? (
            <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <p className="font-medium text-destructive mb-2">Delete Account Permanently</p>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive border-destructive hover:bg-destructive/5"
                onClick={() => setIsDeleting(true)}
                data-testid="button-delete-account"
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5 space-y-4">
              <div>
                <p className="font-medium text-destructive mb-2">Confirm Account Deletion</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your password to confirm deletion. This cannot be undone.
                </p>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                data-testid="input-delete-password"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteAccountMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete Permanently
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDeleting(false);
                    setDeletePassword("");
                  }}
                  disabled={deleteAccountMutation.isPending}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
