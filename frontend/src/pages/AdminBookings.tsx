import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Loader2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@shared/schema";

export default function AdminBookings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch bookings using the default fetcher
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings/recent"],
  });

  const approveMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking approved successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/bookings/recent"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/reject`, { reason: "Admin rejection" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking rejected",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/bookings/recent"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending_approval") || [];
  const approvedBookings = bookings.filter((b) => b.status === "confirmed") || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin")}
          data-testid="button-back-to-admin"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Booking Approvals</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pending-count">
              {pendingBookings.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-approved-count">
              {approvedBookings.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-approval-rate">
              {bookings.length > 0
                ? Math.round((approvedBookings.length / bookings.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval ({pendingBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Guest Email</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {booking.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm truncate">
                          {(booking as any).guestEmail || 'Guest' || "No email"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{(booking as any).propertyTitle || 'Property' || "Property"}</TableCell>
                      <TableCell className="text-sm">{String(booking.checkIn)}</TableCell>
                      <TableCell className="text-sm">{String(booking.checkOut)}</TableCell>
                      <TableCell className="font-semibold">
                        ${Number(booking.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.paymentMethod === "stripe" ? "default" : "secondary"
                          }
                        >
                          {booking.paymentMethod || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                            onClick={() => approveMutation.mutate(booking.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-approve-${booking.id}`}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            onClick={() => rejectMutation.mutate(booking.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            data-testid={`button-reject-${booking.id}`}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No pending bookings
              </p>
              <p className="text-sm text-muted-foreground">All bookings have been reviewed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Approved */}
      {approvedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Approved ({approvedBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedBookings.slice(0, 5).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm">{(booking as any).guestEmail || 'Guest' || "Guest"}</TableCell>
                    <TableCell className="text-sm">{(booking as any).propertyTitle || 'Property' || "Property"}</TableCell>
                    <TableCell className="text-sm">
                      {String(booking.checkIn)} → {String(booking.checkOut)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${Number(booking.total || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
