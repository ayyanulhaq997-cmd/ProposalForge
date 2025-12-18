import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus } from "lucide-react";

export function AdminCalendarSync() {
  const [open, setOpen] = useState(false);
  const [iCalUrl, setICalUrl] = useState("");
  const [calendars] = useState([]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Calendar Sync (iCal)</CardTitle>
            <CardDescription>Sync with external calendars like Airbnb, VRBO</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {calendars.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No external calendars connected</p>
            <p className="text-xs text-muted-foreground mt-1">Connect iCal/Airbnb calendars to sync availability</p>
          </div>
        ) : (
          calendars.map((cal: any) => (
            <div key={cal.id} className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Property Calendar</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{cal.iCalUrl}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced: {new Date(cal.lastSyncedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={cal.syncStatus === "synced" ? "default" : "secondary"}>{cal.syncStatus}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calendar Feed</DialogTitle>
            <DialogDescription>Connect an external iCal calendar feed (Airbnb, VRBO, Google Calendar)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">iCal Feed URL</label>
              <Input
                value={iCalUrl}
                onChange={(e) => setICalUrl(e.target.value)}
                placeholder="https://calendar.example.com/ical/..."
              />
              <p className="text-xs text-muted-foreground mt-1">Paste the complete iCal feed URL here</p>
            </div>
            <Button className="w-full">Connect Calendar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
