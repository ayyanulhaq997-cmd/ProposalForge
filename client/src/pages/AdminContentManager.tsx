import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SiteSettings } from "@shared/schema";

export default function AdminContentManager() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SiteSettings> | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['/api/admin/settings'],
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setUnsavedChanges(false);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const response = await apiRequest('PATCH', '/api/admin/settings', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully. Changes are live!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setUnsavedChanges(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    if (formData) {
      updateSettingsMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Content Manager</h1>
            <p className="text-muted-foreground">Update website content and settings in real-time</p>
          </div>

          {unsavedChanges && (
            <Alert className="mb-6 border-warning bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>You have unsaved changes. Click Save to apply them.</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {/* Site Branding Section */}
            <Card>
              <CardHeader>
                <CardTitle>Site Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={formData?.siteName || ''}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    placeholder="Your website name"
                    data-testid="input-site-name"
                  />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData?.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                  {formData?.logoUrl && (
                    <div className="mt-3 p-3 border rounded-lg bg-muted/30 flex items-center justify-center min-h-[80px]">
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo preview" 
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData?.primaryColor || '#0066FF'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="h-10 w-20"
                      data-testid="input-primary-color"
                    />
                    <Input
                      type="text"
                      value={formData?.primaryColor || '#0066FF'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      placeholder="#0066FF"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="heroImage">Hero Image URL</Label>
                  <Input
                    id="heroImage"
                    value={formData?.heroImage || ''}
                    onChange={(e) => handleChange('heroImage', e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                    data-testid="input-hero-image"
                  />
                  {formData?.heroImage && (
                    <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                      <img 
                        src={formData.heroImage} 
                        alt="Hero preview" 
                        className="w-full h-auto max-h-48 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={formData?.heroTitle || ''}
                    onChange={(e) => handleChange('heroTitle', e.target.value)}
                    placeholder="Find your perfect vacation rental"
                    data-testid="input-hero-title"
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={formData?.heroSubtitle || ''}
                    onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                    placeholder="Discover unique places to stay around the world"
                    rows={3}
                    data-testid="textarea-hero-subtitle"
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aboutText">About Text</Label>
                  <Textarea
                    id="aboutText"
                    value={formData?.aboutText || ''}
                    onChange={(e) => handleChange('aboutText', e.target.value)}
                    placeholder="Write about your platform..."
                    rows={5}
                    data-testid="textarea-about-text"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData?.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="hello@example.com"
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 rounded-l-lg bg-muted text-muted-foreground">+</span>
                    <Input
                      id="contactPhone"
                      value={formData?.contactPhone?.replace(/^\+/, '') || ''}
                      onChange={(e) => handleChange('contactPhone', '+' + e.target.value.replace(/^\+/, ''))}
                      placeholder="1 (555) 000-0000"
                      className="rounded-l-none"
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currency">Currency Code</Label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 rounded-l-lg bg-muted text-muted-foreground">$</span>
                    <Input
                      id="currency"
                      value={formData?.currency || 'USD'}
                      onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                      placeholder="USD"
                      maxLength={3}
                      className="rounded-l-none"
                      data-testid="input-currency"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={Number(formData?.taxRate || 0.0625) * 100}
                    onChange={(e) => handleChange('taxRate', Number(e.target.value) / 100)}
                    placeholder="6.25"
                    data-testid="input-tax-rate"
                  />
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    value={Number(formData?.commissionRate || 0.15) * 100}
                    onChange={(e) => handleChange('commissionRate', Number(e.target.value) / 100)}
                    placeholder="15"
                    data-testid="input-commission-rate"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(settings || null);
                  setUnsavedChanges(false);
                }}
                disabled={!unsavedChanges}
                data-testid="button-discard-changes"
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={!unsavedChanges || updateSettingsMutation.isPending}
                size="lg"
                data-testid="button-save-content"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
