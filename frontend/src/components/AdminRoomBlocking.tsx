import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2 } from "lucide-react";

export function AdminRoomBlocking() {
  const [open, setOpen] = useState(false);
  const [blockData, setBlockData] = useState({ startDate: "", endDate: "", reason: "" });
  const [blockedDates] = useState([]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Room Blocking</CardTitle>
            <CardDescription>Block dates for maintenance, cleaning, or special events</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Block Dates
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {blockedDates.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No dates blocked</p>
            <p className="text-xs text-muted-foreground mt-1">Block dates when properties are unavailable</p>
          </div>
        ) : (
          blockedDates.map((block: any) => (
            <div key={block.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{block.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" variant="ghost">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
            <DialogDescription>Make dates unavailable for bookings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={blockData.startDate}
                onChange={(e) => setBlockData({ ...blockData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={blockData.endDate}
                onChange={(e) => setBlockData({ ...blockData, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Input
                value={blockData.reason}
                onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                placeholder="e.g., Maintenance, Deep cleaning"
              />
            </div>
            <Button className="w-full">Block Dates</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
