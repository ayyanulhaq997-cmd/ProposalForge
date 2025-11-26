import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Calendar, Users, MapPin, Home, Mountain, Building2, Palmtree, Heart, Loader2, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import heroImage from "@assets/generated_images/luxury_beachfront_hero_image.png";
import type { Property } from "@shared/schema";

export default function Landing() {
  const [searchLocation, setSearchLocation] = useState("");
  const [, navigate] = useLocation();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search'],
  });

  const categories = [
    { name: "Villa", icon: Home, image: "villa" },
    { name: "Apartamento", icon: Building2, image: "apartment" },
    { name: "Casa", icon: Home, image: "house" },
    { name: "Cabaña", icon: Mountain, image: "cabin" },
  ];

  const handleSearch = () => {
    if (searchLocation.trim()) {
      window.location.href = `/search?location=${encodeURIComponent(searchLocation)}`;
    } else {
      window.location.href = "/search";
    }
  };

  const handleChatClick = () => {
    navigate("/messages");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main>
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.button 
            onClick={handleChatClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-full mb-4 text-sm font-medium hover:bg-pink-200 dark:hover:bg-pink-900/50 cursor-pointer transition-colors active-elevate-2"
            data-testid="button-chat-from-hero"
          >
            ✨ Encuentra tu estadía ideal
          </motion.button>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4 tracking-tight" 
            data-testid="text-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="text-pink-400">Experimenta</span>
          </motion.h1>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            el lugar perfecto
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12" 
            data-testid="text-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Descubre alojamientos únicos y vive experiencias inolvidables en los destinos más increíbles
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
          <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-md border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-background rounded-lg border">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Dónde quieres ir?"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    data-testid="input-search-location"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleSearch}
                  className="sm:w-auto w-full bg-pink-500 hover:bg-pink-600 text-white"
                  data-testid="button-search"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">Explora por tipo</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <div key={category.name} data-testid={`link-category-${category.name.toLowerCase()}`}>
                <Card 
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all border"
                  onClick={() => window.location.href = `/search?category=${category.name.toLowerCase()}`}
                >
                  <CardContent className="p-6 text-center">
                    <category.icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Propiedades Destacadas</h2>
          <p className="text-muted-foreground mb-8">Los mejores alojamientos seleccionados para ti</p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.slice(0, 4).map((property) => (
                <div
                  key={property.id}
                  onClick={() => window.location.href = `/property/${property.id}`}
                  className="text-left hover-elevate active-elevate-2 transition-all rounded-lg overflow-hidden cursor-pointer"
                  data-testid={`card-property-${property.id}`}
                >
                  <Card className="overflow-hidden">
                    {/* Property Image */}
                    <div className="relative overflow-hidden bg-muted aspect-video">
                      <img
                        src={`https://picsum.photos/500/300?random=${property.id}`}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 left-3 capitalize bg-black/60">
                        {property.category}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs text-muted-foreground">(127 reseñas)</span>
                      </div>

                      {/* Price */}
                      <div className="text-lg font-bold text-primary">
                        ${Number(property.pricePerNight).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">/night</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-12 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-muted-foreground">
                Browse thousands of verified vacation rentals in your desired location
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book</h3>
              <p className="text-muted-foreground">
                Choose your dates, review the details, and book instantly with secure payment
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy</h3>
              <p className="text-muted-foreground">
                Check in, relax, and make unforgettable memories at your vacation rental
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Join thousands of travelers finding their perfect stays
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => window.location.href = '/login'}
            className="text-lg px-8"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </main>
    </div>
  );
}
