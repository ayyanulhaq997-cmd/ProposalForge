import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function SearchBar() {
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.append("location", location);
    if (guests) params.append("guests", guests);
    
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-background rounded-lg border">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Where to?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-location"
            />
          </div>

          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-background rounded-lg border">
            <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Input
              type="number"
              placeholder="Guests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              min="1"
              className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              data-testid="input-guests"
            />
          </div>

          <Button onClick={handleSearch} className="md:w-auto" data-testid="button-search-submit">
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
