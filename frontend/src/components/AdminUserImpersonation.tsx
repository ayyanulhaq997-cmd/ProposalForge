import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, LogIn, LogOut } from "lucide-react";

export function AdminUserImpersonation() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const { data: impersonationStatus = null } = useQuery<any | null>({ queryKey: ["/api/admin/impersonation-status"] });

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string): Promise<any> => {
      return await apiRequest("POST", `/api/admin/impersonate/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonation-status"] });
      setOpen(false);
    },
  });

  const endImpersonationMutation = useMutation({
    mutationFn: async (userId: string): Promise<any> => {
      return await apiRequest("POST", `/api/admin/end-impersonation/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonation-status"] });
    },
  });

  const filteredUsers: any[] = users.filter((user: any) =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Impersonation</CardTitle>
        <CardDescription>Support users by logging in as them (for assistance only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {impersonationStatus ? (
          <div className="p-4 border rounded bg-yellow-50 dark:bg-yellow-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Currently Impersonating</p>
                <p className="text-sm mt-1">{impersonationStatus.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Started: {new Date(impersonationStatus.impersonatedAt).toLocaleString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => endImpersonationMutation.mutate(impersonationStatus.id)}
                disabled={endImpersonationMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Stop Impersonating
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded bg-muted/50 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Not currently impersonating any user</p>
          </div>
        )}

        <Button className="w-full" onClick={() => setOpen(true)}>
          <LogIn className="h-4 w-4 mr-2" />
          Start Impersonation
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>Select a user to impersonate for support purposes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search users by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
              ) : (
                filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition"
                  >
                    <div>
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => impersonateMutation.mutate(user.id)}
                      disabled={impersonateMutation.isPending}
                    >
                      Impersonate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
