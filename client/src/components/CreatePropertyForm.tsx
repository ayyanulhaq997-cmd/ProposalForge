import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Upload, X, ImageIcon } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createInsertSchema } from "drizzle-zod";
import { properties, Property } from "@shared/schema";
import { z } from "zod";

// Create schema with coercion for number fields (HTML inputs return strings)
// Decimal fields (pricePerNight, cleaningFee, etc.) are stored as strings in Drizzle
const insertPropertySchema = createInsertSchema(properties, {
  guests: z.coerce.number().int().min(1),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  minNights: z.coerce.number().int().min(1),
  maxNights: z.coerce.number().int().min(1),
  pricePerNight: z.coerce.string().min(1, "Price is required"),
  cleaningFee: z.coerce.string().optional(),
  serviceFee: z.coerce.string().optional(),
  taxRate: z.coerce.string().optional(),
  weekendPriceMultiplier: z.coerce.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  hostId: true 
});

interface CreatePropertyFormProps {
  onSuccess?: () => void;
  propertyId?: string;
}

export default function CreatePropertyForm({ onSuccess, propertyId }: CreatePropertyFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = !!propertyId;
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existingProperty, isLoading: loadingProperty } = useQuery<Property>({
    queryKey: ['/api/properties', propertyId],
    enabled: isEditing,
  });

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "villa",
      category: "luxury",
      location: "",
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      amenities: [],
      pricePerNight: "100",
      cleaningFee: "30",
      serviceFee: "10",
      taxRate: "0.0625",
      minNights: 1,
      maxNights: 30,
      weekendPriceMultiplier: "1.0",
      status: "active",
      isActive: true,
    },
  });

  useEffect(() => {
    if (existingProperty) {
      form.reset({
        title: existingProperty.title || "",
        description: existingProperty.description || "",
        propertyType: existingProperty.propertyType || "villa",
        category: existingProperty.category || "luxury",
        location: existingProperty.location || "",
        guests: existingProperty.guests || 4,
        bedrooms: existingProperty.bedrooms || 2,
        beds: existingProperty.beds || 2,
        bathrooms: existingProperty.bathrooms || 1,
        amenities: [],
        pricePerNight: existingProperty.pricePerNight != null ? String(existingProperty.pricePerNight) : "100",
        cleaningFee: existingProperty.cleaningFee != null ? String(existingProperty.cleaningFee) : "30",
        serviceFee: existingProperty.serviceFee != null ? String(existingProperty.serviceFee) : "10",
        taxRate: existingProperty.taxRate != null ? String(existingProperty.taxRate) : "0.0625",
        minNights: existingProperty.minNights || 1,
        maxNights: existingProperty.maxNights || 30,
        weekendPriceMultiplier: existingProperty.weekendPriceMultiplier != null ? String(existingProperty.weekendPriceMultiplier) : "1.0",
        status: existingProperty.status || "active",
        isActive: existingProperty.isActive !== false,
      });
      // Load existing images when editing
      if (existingProperty.images && Array.isArray(existingProperty.images)) {
        setUploadedImages(existingProperty.images as string[]);
      }
    }
  }, [existingProperty, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        newImages.push(base64);
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) added successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload one or more images",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      // Include uploaded images in the property data
      const propertyData = { ...data, images: uploadedImages };
      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/properties/${propertyId}`, propertyData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/properties", propertyData);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: isEditing ? "Property updated successfully" : "Property created successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/host/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/host/stats"] });
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ["/api/properties", propertyId] });
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} property`,
        variant: "destructive"
      });
    },
  });

  if (isEditing && loadingProperty) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/host/properties")}
          data-testid="button-back"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? "Edit Property" : "Create New Property"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing ? "Update your property details" : "Add a new property to your portfolio"}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createPropertyMutation.mutate(data))} className="space-y-6">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Luxury Beachfront Villa" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your property..." {...field} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Malibu, California" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border rounded-md" data-testid="select-type">
                        <option value="villa">Villa</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="cabin">Cabin</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Night ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cleaningFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cleaning Fee ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} data-testid="input-cleaning" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guests</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-guests" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-bedrooms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beds</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-beds" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-bathrooms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <FormLabel>Property Photos</FormLabel>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                    data-testid="input-images"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Upload photos of your property
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImages}
                      data-testid="button-upload-images"
                    >
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Images
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4" data-testid="image-preview-grid">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                          data-testid={`image-preview-${index}`}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/host/properties")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPropertyMutation.isPending}
                  data-testid="button-submit-property"
                >
                  {createPropertyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? "Update Property" : "Create Property"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
