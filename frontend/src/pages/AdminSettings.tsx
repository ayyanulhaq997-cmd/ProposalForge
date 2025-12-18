import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Mail, User, CreditCard } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PATCH', '/api/admin/settings/email', { email });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Email updated successfully" });
      setEmail("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      const response = await apiRequest('PATCH', '/api/admin/settings/password', {
        currentPassword,
        newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password updated successfully. Please log in again." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin account credentials</p>
      </div>

      {/* Current Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Admin Email:</span> <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Role:</span> <span className="font-medium">{user?.role}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Update your admin email address for this account
          </p>
          <div>
            <label className="text-sm font-medium">New Email Address</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-admin-email"
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => updateEmailMutation.mutate()}
            disabled={!email || updateEmailMutation.isPending}
            data-testid="button-update-email"
          >
            {updateEmailMutation.isPending ? "Updating..." : "Update Email"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Change your admin password. You'll need to log in again with the new password.
          </p>
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              data-testid="input-current-password"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="input-new-password"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="input-confirm-password"
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => updatePasswordMutation.mutate()}
            disabled={!currentPassword || !newPassword || !confirmPassword || updatePasswordMutation.isPending}
            data-testid="button-update-password"
          >
            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Gateway Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose your preferred payment gateway for processing guest bookings and host payouts.
          </p>
          
          <div className="space-y-3">
            {/* Stripe Option */}
            <div className="flex items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover-elevate cursor-pointer" onClick={() => setPaymentMethod("stripe")}>
              <input
                type="radio"
                id="stripe"
                name="payment-method"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4"
                data-testid="radio-stripe"
              />
              <label htmlFor="stripe" className="ml-3 flex-1 cursor-pointer">
                <p className="font-semibold text-foreground">Stripe</p>
                <p className="text-xs text-muted-foreground">Global payment processing with 3D Secure support</p>
              </label>
              {paymentMethod === "stripe" && <span className="text-green-600 font-medium">Selected</span>}
            </div>

            {/* Square Option */}
            <div className="flex items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover-elevate cursor-pointer" onClick={() => setPaymentMethod("square")}>
              <input
                type="radio"
                id="square"
                name="payment-method"
                value="square"
                checked={paymentMethod === "square"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4"
                data-testid="radio-square"
              />
              <label htmlFor="square" className="ml-3 flex-1 cursor-pointer">
                <p className="font-semibold text-foreground">Square</p>
                <p className="text-xs text-muted-foreground">Flexible payment solutions with point-of-sale integration</p>
              </label>
              {paymentMethod === "square" && <span className="text-green-600 font-medium">Selected</span>}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              Your selection: <span className="font-medium capitalize text-foreground">{paymentMethod}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
