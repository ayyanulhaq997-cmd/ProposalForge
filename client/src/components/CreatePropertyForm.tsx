import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
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

const insertPropertySchema = createInsertSchema(properties).omit({ 
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
        pricePerNight: String(existingProperty.pricePerNight) || "100",
        cleaningFee: String(existingProperty.cleaningFee) || "30",
        serviceFee: String(existingProperty.serviceFee) || "10",
        taxRate: String(existingProperty.taxRate) || "0.0625",
        minNights: existingProperty.minNights || 1,
        maxNights: existingProperty.maxNights || 30,
        weekendPriceMultiplier: String(existingProperty.weekendPriceMultiplier) || "1.0",
        status: existingProperty.status || "active",
        isActive: existingProperty.isActive !== false,
      });
    }
  }, [existingProperty, form]);

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/properties/${propertyId}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/properties", data);
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
