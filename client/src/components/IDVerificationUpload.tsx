import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, CheckCircle, Clock, AlertCircle, Camera, FileUp } from "lucide-react";

interface IDVerification {
  id: string;
  documentType: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export function IDVerificationUpload() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('passport');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: { documentType: string; idFile: File; selfieFile: File }) => {
      const formData = new FormData();
      formData.append('documentType', data.documentType);
      formData.append('idDocument', data.idFile);
      formData.append('selfie', data.selfieFile);

      const response = await fetch('/api/user/verify-id', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "ID verification submitted for review" });
      setIdFile(null);
      setSelfieFile(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to upload verification documents", variant: "destructive" });
    },
  });

  const handleCaptureSelfie = async () => {
    try {
      setIsVideoReady(false);
      setShowSelfieCapture(true);
      
      // Stop any existing stream before starting new one
      if (videoRef.current?.srcObject) {
        const existingStream = videoRef.current.srcObject as MediaStream;
        existingStream?.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        
        const setReady = () => {
          if (!isVideoReady) setIsVideoReady(true);
        };
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        
        videoRef.current.onplaying = setReady;
        videoRef.current.oncanplay = setReady;
        
        // Fallback: set ready after 2 seconds if events don't fire
        setTimeout(() => {
          if (videoRef.current?.srcObject) {
            setIsVideoReady(true);
          }
        }, 2000);
      }
    } catch (err: any) {
      setShowSelfieCapture(false);
      const message = err?.name === 'NotAllowedError' 
        ? "Camera access denied. Please allow camera access in your browser settings."
        : err?.name === 'NotFoundError'
        ? "No camera found. Please connect a camera and try again."
        : "Could not access camera. Please check your camera permissions.";
      toast({ title: "Camera Error", description: message, variant: "destructive" });
    }
  };

  const handleTakeSelfie = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          setSelfieFile(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
          setShowSelfieCapture(false);
          setIsVideoReady(false);
          const stream = videoRef.current?.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
          toast({ title: "Success", description: "Selfie captured" });
        }
      }, 'image/jpeg');
    } else {
      toast({ title: "Please wait", description: "Camera is still loading...", variant: "destructive" });
    }
  };

  const handleUpload = () => {
    if (!idFile) {
      toast({ title: "Error", description: "Please select an ID document", variant: "destructive" });
      return;
    }
    if (!selfieFile) {
      toast({ title: "Error", description: "Please capture or upload a selfie", variant: "destructive" });
      return;
    }

    uploadMutation.mutate({ documentType, idFile, selfieFile });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          ID Verification Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground font-medium">
          Upload government-issued ID and selfie to complete registration
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            ✓ Required: Valid ID + Selfie<br/>
            ✓ Cannot proceed without admin approval<br/>
            ✓ Typical approval: 24-48 hours
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              data-testid="select-document-type"
            >
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="id_card">National ID Card</option>
              <option value="cnic">CNIC (Pakistan)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              <FileUp className="h-4 w-4 inline mr-1" />
              Upload Government ID
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              data-testid="input-id-document"
            />
            {idFile && <p className="text-xs text-green-600 mt-1">✓ {idFile.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              <Camera className="h-4 w-4 inline mr-1" />
              Selfie Verification
            </label>
            {!showSelfieCapture ? (
              <>
                {!selfieFile ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCaptureSelfie}
                      className="flex-1"
                      data-testid="button-capture-selfie"
                    >
                      <Camera className="h-4 w-4 mr-1" /> Capture Selfie
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => setSelfieFile(e.target.files[0]);
                        input.click();
                      }}
                      className="flex-1"
                      data-testid="button-upload-selfie"
                    >
                      <Upload className="h-4 w-4 mr-1" /> Upload Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-green-600">✓ Selfie captured</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelfieFile(null)}
                      className="w-full"
                      data-testid="button-retake-selfie"
                    >
                      Retake
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-md border border-input bg-muted"
                  data-testid="video-selfie"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleTakeSelfie}
                    disabled={!isVideoReady}
                    className="flex-1"
                    data-testid="button-take-photo"
                  >
                    {isVideoReady ? "Take Photo" : "Loading camera..."}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSelfieCapture(false);
                      setIsVideoReady(false);
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(track => track.stop());
                    }}
                    className="flex-1"
                    data-testid="button-cancel-camera"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !idFile || !selfieFile}
            className="w-full"
            data-testid="button-submit-verification"
          >
            {uploadMutation.isPending ? "Uploading..." : "Submit for Verification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IDVerificationStatus({ verification }: { verification?: IDVerification }) {
  if (!verification || !verification.status) {
    return null;
  }

  const statusConfig = {
    pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    verified: { icon: CheckCircle, label: "Verified", color: "bg-green-100 text-green-800" },
    rejected: { icon: AlertCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[verification.status];
  if (!config) {
    return null;
  }
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
