import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Trash2 } from "lucide-react";

export function AdminSeasonalPricing() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    name: "",
    startDate: "",
    endDate: "",
    priceMultiplier: "1.0",
  });

  const { data: properties = [] } = useQuery<any[]>({ queryKey: ["/api/properties"] });
  const { data: seasonalPricing = [] } = useQuery<any[]>({ queryKey: ["/api/admin/seasonal-pricing"] });

  const createMutation = useMutation({
    mutationFn: async (data: any): Promise<any> => {
      return await apiRequest("POST", "/api/admin/seasonal-pricing", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasonal-pricing"] });
      setOpen(false);
      setFormData({ propertyId: "", name: "", startDate: "", endDate: "", priceMultiplier: "1.0" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return await apiRequest("DELETE", `/api/admin/seasonal-pricing/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasonal-pricing"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Seasonal Pricing Rules</CardTitle>
            <CardDescription>Configure price multipliers for different seasons</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {seasonalPricing && seasonalPricing.length > 0 ? (
          seasonalPricing.map((rule: any) => (
            <div key={rule.id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{rule.priceMultiplier}x multiplier</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(rule.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No seasonal pricing rules yet</p>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Seasonal Pricing Rule</DialogTitle>
            <DialogDescription>Create a new pricing rule for a specific season</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Peak"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price Multiplier</label>
              <Input
                type="number"
                step="0.1"
                value={formData.priceMultiplier}
                onChange={(e) => setFormData({ ...formData, priceMultiplier: e.target.value })}
                placeholder="1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">1.0 = normal price, 1.5 = 50% increase</p>
            </div>
            <Button
              onClick={() =>
                createMutation.mutate({
                  ...formData,
                  propertyId: properties?.[0]?.id,
                  priceMultiplier: parseFloat(formData.priceMultiplier),
                })
              }
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
