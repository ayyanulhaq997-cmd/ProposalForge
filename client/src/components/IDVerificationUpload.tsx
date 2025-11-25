import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface IDVerification {
  id: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export function IDVerificationUpload() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('drivers_license');
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/user/verification', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "ID verification submitted for review" });
      setFile(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload ID", variant: "destructive" });
    },
  });

  const handleUpload = () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);

    uploadMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          ID Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a valid government-issued ID to verify your account
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
              data-testid="select-document-type"
            >
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="id_card">ID Card</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Upload Document</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
              data-testid="input-id-document"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !file}
            className="w-full"
            data-testid="button-submit-id"
          >
            {uploadMutation.isPending ? "Uploading..." : "Submit for Verification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IDVerificationStatus({ verification }: { verification?: IDVerification }) {
  if (!verification) {
    return null;
  }

  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    verified: { icon: CheckCircle, label: "Verified", color: "bg-green-100 text-green-800" },
    rejected: { icon: AlertCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[verification.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Verification Status</span>
          <Badge className={config.color} data-testid={`badge-verification-${verification.status}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <span className="text-muted-foreground">Document Type:</span> {verification.documentType}
        </p>
        {verification.verifiedAt && (
          <p className="text-sm">
            <span className="text-muted-foreground">Verified:</span> {new Date(verification.verifiedAt).toLocaleDateString()}
          </p>
        )}
        {verification.rejectionReason && (
          <p className="text-sm text-destructive">
            <span className="font-medium">Rejection Reason:</span> {verification.rejectionReason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
