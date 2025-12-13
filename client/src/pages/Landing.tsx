import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Calendar as CalendarIcon, Users, MapPin, Home, Mountain, Building2, Palmtree, Heart, Loader2, Star, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import heroImage from "@assets/stock_images/luxury_resort_pool_v_f8b91ec8.jpg";
import type { Property } from "@shared/schema";

export default function Landing() {
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState("");
  const [showAnimations, setShowAnimations] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, navigate] = useLocation();
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search'],
  });

  // Defer animations until after initial paint
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimations(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { name: "Villa", icon: Home, image: "villa" },
    { name: "Apartamento", icon: Building2, image: "apartment" },
    { name: "Casa", icon: Home, image: "house" },
    { name: "Cabaña", icon: Mountain, image: "cabin" },
  ];

  // Filter properties based on search criteria
  const filteredProperties = properties?.filter((prop) => {
    const matchesLocation = !searchLocation.trim() || 
      prop.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      prop.title.toLowerCase().includes(searchLocation.toLowerCase());
    
    return matchesLocation;
  }) || [];

  const handleSearch = () => {
    setHasSearched(true);
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
        <img 
          src={heroImage}
          alt="Luxury beachfront vacation rental"
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {showAnimations ? (
            <>
          <motion.button 
            onClick={handleChatClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-full mb-4 text-sm font-medium hover:bg-pink-200 dark:hover:bg-pink-900/50 cursor-pointer transition-colors active-elevate-2"
            data-testid="button-chat-from-hero"
          >
            <Sparkles className="h-4 w-4" />
            Encuentra tu estadía ideal
          </motion.button>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4 tracking-tight" 
            data-testid="text-hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <span className="text-pink-400">Experimenta</span>
          </motion.h1>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            el lugar perfecto
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12" 
            data-testid="text-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            Descubre alojamientos únicos y vive experiencias inolvidables en los destinos más increíbles
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-white/98 dark:bg-slate-900/95 backdrop-blur-md border-0 shadow-2xl">
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                  {/* Location */}
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <MapPin className="h-5 w-5 text-pink-500 flex-shrink-0" />
                    <Input
                      placeholder="Buscar un lugar"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      data-testid="input-search-location"
                    />
                  </div>
                  
                  {/* Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        type="button"
                        className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-left"
                        data-testid="input-check-in"
                      >
                        <CalendarIcon className="h-5 w-5 text-pink-500 flex-shrink-0" />
                        <span className={checkIn ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
                          {checkIn ? format(checkIn, "dd/MM/yyyy") : "Fecha"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {/* Guests */}
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <Users className="h-5 w-5 text-pink-500 flex-shrink-0" />
                    <Input
                      type="number"
                      placeholder="Huéspedes"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      min="1"
                      className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      data-testid="input-guests"
                    />
                  </div>
                  
                  {/* Search Button */}
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 rounded-lg"
                    data-testid="button-search"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
            </>
          ) : (
            <div className="opacity-0">
              <div className="h-10 mb-4" />
              <div className="h-16 mb-4" />
              <div className="h-16 mb-8" />
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => window.location.href = `/search?category=${category.name.toLowerCase()}`}
                data-testid={`link-category-${category.name.toLowerCase()}`}
                className="px-6 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium text-sm sm:text-base hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors hover-elevate"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            {hasSearched ? "Resultados de Búsqueda" : "Propiedades Destacadas"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {hasSearched 
              ? filteredProperties.length === 0 
                ? "No se encontraron propiedades que coincidan con tu búsqueda"
                : `Se encontraron ${filteredProperties.length} propiedades`
              : "Los mejores alojamientos seleccionados para ti"}
          </p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasSearched ? (
            filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProperties.map((property) => (
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
            ) : null
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
                      
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-xs text-muted-foreground">(127 reseñas)</span>
                      </div>

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
