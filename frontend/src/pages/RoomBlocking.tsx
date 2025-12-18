import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";

export default function RoomBlocking() {
  const { propertyId } = useParams();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockingReason, setBlockingReason] = useState("");
  const [seasonalPrice, setSeasonalPrice] = useState("");
  const [mode, setMode] = useState<'block' | 'price'>('block');

  const { data: availability } = useQuery({
    queryKey: [`/api/properties/${propertyId}/availability`],
    enabled: !!propertyId,
  });

  const blockDateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/availability/block`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/availability`] });
      toast({
        title: "Success",
        description: "Date blocked successfully",
      });
      setSelectedDate(null);
      setBlockingReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setPriceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/availability/price`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/availability`] });
      toast({
        title: "Success",
        description: "Seasonal price set successfully",
      });
      setSelectedDate(null);
      setSeasonalPrice("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedDate || !propertyId) return;

    if (mode === 'block') {
      blockDateMutation.mutate({
        propertyId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        isAvailable: false,
        reason: blockingReason,
      });
    } else {
      if (!seasonalPrice) {
        toast({
          title: "Error",
          description: "Please enter a price",
          variant: "destructive",
        });
        return;
      }
      setPriceMutation.mutate({
        propertyId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        price: parseFloat(seasonalPrice),
      });
    }
  };

  const currentMonth = new Date();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDateStatus = (day: Date): string | null => {
    if (!availability) return null;
    const dateStr = format(day, 'yyyy-MM-dd');
    const availEntry = availability.find((a: any) => a.date === dateStr);
    if (!availEntry) return null;
    return availEntry.isAvailable ? 'available' : availEntry.price ? 'priced' : 'blocked';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Room Blocking & Pricing
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-sm p-2">
                  {day}
                </div>
              ))}
              
              {daysInMonth.map(day => {
                const status = getDateStatus(day);
                const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                
                return (
                  <button
                    key={format(day, 'yyyy-MM-dd')}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${
                      status === 'blocked' ? 'bg-red-200 text-red-900' :
                      status === 'priced' ? 'bg-blue-200 text-blue-900' :
                      status === 'available' ? 'bg-green-200 text-green-900' :
                      'bg-gray-100 hover:bg-gray-200'
                    }`}
                    data-testid={`button-date-${format(day, 'yyyy-MM-dd')}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mode === 'block' ? 'default' : 'outline'}
                onClick={() => setMode('block')}
                size="sm"
                data-testid="button-mode-block"
              >
                <Lock className="h-4 w-4 mr-2" />
                Block
              </Button>
              <Button
                variant={mode === 'price' ? 'default' : 'outline'}
                onClick={() => setMode('price')}
                size="sm"
                data-testid="button-mode-price"
              >
                Price
              </Button>
            </div>

            {mode === 'block' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Input
                    id="reason"
                    placeholder="Maintenance, cleaning, etc."
                    value={blockingReason}
                    onChange={(e) => setBlockingReason(e.target.value)}
                    data-testid="input-blocking-reason"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!selectedDate || blockDateMutation.isPending}
                  className="w-full"
                  data-testid="button-block-save"
                >
                  {blockDateMutation.isPending ? 'Saving...' : 'Block Date'}
                </Button>
              </div>
            )}

            {mode === 'price' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 250"
                    value={seasonalPrice}
                    onChange={(e) => setSeasonalPrice(e.target.value)}
                    data-testid="input-seasonal-price"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!selectedDate || !seasonalPrice || setPriceMutation.isPending}
                  className="w-full"
                  data-testid="button-price-save"
                >
                  {setPriceMutation.isPending ? 'Saving...' : 'Set Price'}
                </Button>
              </div>
            )}

            <div className="pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-200"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-200"></div>
                <span>Seasonal Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-200"></div>
                <span>Blocked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
