import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export function AdminAuditLog() {
  const [search, setSearch] = useState("");
  const { data: auditLogs = [] } = useQuery<any[]>({ queryKey: ["/api/admin/audit-logs"] });

  const filteredLogs: any[] = auditLogs.filter((log: any) =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Track all platform actions and user activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between items-start p-3 border rounded text-sm hover:bg-muted/50 transition">
                <div className="flex-1">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  {log.ipAddress && (
                    <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress}</p>
                  )}
                </div>
                <Badge variant="outline" className="ml-2 flex-shrink-0">
                  {log.entityType || "system"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
