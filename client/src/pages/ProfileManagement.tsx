import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Upload, Check, Mail, Phone, Shield, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { UserProfile, IdVerification, User as UserType } from "@shared/schema";

interface ProfileData {
  profile: UserProfile | null;
  verification: IdVerification | null;
  user?: UserType | null;
}

export default function ProfileManagement() {
  const { toast } = useToast();
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency, setEmergency] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  const { data, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/user/profile'],
  });

  useEffect(() => {
    if (data?.profile && !hasLoadedInitialData) {
      setBio(data.profile.bio || "");
      setPhone(data.profile.phoneNumber || "");
      setEmergency(data.profile.emergencyContact || "");
      setEmergencyPhone(data.profile.emergencyPhone || "");
      setHasLoadedInitialData(true);
    }
  }, [data, hasLoadedInitialData]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PATCH', '/api/user/profile', {
        bio,
        phoneNumber: phone,
        emergencyContact: emergency,
        emergencyPhone,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({ title: 'Profile updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    },
  });

  const uploadIdMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', 'drivers_license');
      
      const response = await fetch('/api/user/verify-id', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({ title: 'ID submitted for verification' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { profile, verification, user } = data || {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 data-testid="text-profile-heading" className="text-3xl font-bold mb-8">Profile Management</h1>

      {/* Account Info with KYC Status */}
      <Card data-testid="card-account-info" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="flex-1">
                  <p data-testid="text-user-name" className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p data-testid="text-user-role" className="text-sm text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  {user.kycVerified ? (
                    <Badge data-testid="badge-kyc-verified" className="bg-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      KYC Verified
                    </Badge>
                  ) : (
                    <Badge data-testid="badge-kyc-pending" variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      KYC Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-user-email">{user.email || 'No email set'}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span data-testid="text-user-phone">{phone}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card data-testid="card-personal-info" className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea
              data-testid="input-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              data-testid="input-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
            <Input
              data-testid="input-emergency"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              placeholder="Contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
            <Input
              data-testid="input-emergency-phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />
          </div>

          <Button
            data-testid="button-save-profile"
            onClick={() => updateProfileMutation.mutate()}
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* ID Verification */}
      <Card data-testid="card-id-verification">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            ID Verification
            {verification?.status === 'verified' && (
              <Badge className="bg-green-600">Verified</Badge>
            )}
            {verification?.status === 'pending' && (
              <Badge variant="outline">Pending Review</Badge>
            )}
            {verification?.status === 'rejected' && (
              <Badge variant="destructive">Rejected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verification?.status === 'rejected' && verification?.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                <strong>Rejection Reason:</strong> {verification.rejectionReason}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Upload ID Document</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate">
              <input
                data-testid="input-id-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    uploadIdMutation.mutate(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="id-upload"
              />
              <label htmlFor="id-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We accept passports, driver's licenses, and national ID cards. Documents are encrypted and securely stored.
            </p>
          </div>

          {verification && verification.createdAt && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm">
              <p>Submitted: {new Date(verification.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
