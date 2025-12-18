import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, AlertCircle } from "lucide-react";

export function AdminPushNotifications() {
  const [settings, setSettings] = useState({
    bookingConfirmation: true,
    bookingInquiry: true,
    messages: true,
    cancellation: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Configure notification types and delivery settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded bg-muted/50">
            <p className="font-medium text-sm">Notifications Sent</p>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
          <div className="p-4 border rounded bg-muted/50">
            <p className="font-medium text-sm">Delivery Rate</p>
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Booking Confirmations</p>
              <p className="text-xs text-muted-foreground">When bookings are confirmed</p>
            </div>
            <Switch
              checked={settings.bookingConfirmation}
              onCheckedChange={(checked) => setSettings({ ...settings, bookingConfirmation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Booking Inquiries</p>
              <p className="text-xs text-muted-foreground">When new inquiries arrive</p>
            </div>
            <Switch
              checked={settings.bookingInquiry}
              onCheckedChange={(checked) => setSettings({ ...settings, bookingInquiry: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Chat Messages</p>
              <p className="text-xs text-muted-foreground">New messages from hosts/guests</p>
            </div>
            <Switch
              checked={settings.messages}
              onCheckedChange={(checked) => setSettings({ ...settings, messages: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Cancellations</p>
              <p className="text-xs text-muted-foreground">When bookings are cancelled</p>
            </div>
            <Switch
              checked={settings.cancellation}
              onCheckedChange={(checked) => setSettings({ ...settings, cancellation: checked })}
            />
          </div>
        </div>

        <Button className="w-full mt-4">Save Notification Settings</Button>
      </CardContent>
    </Card>
  );
}
