import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, User, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TRAVEL_GUIDES = [
  {
    id: "1",
    title: "10 Hidden Beaches You Need to Visit This Summer",
    excerpt: "Discover pristine, lesser-known beaches away from the crowds. Perfect for your next beach getaway.",
    category: "Travel Tips",
    date: "2025-11-20",
    author: "Sarah Johnson",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Budget Travel Guide: Europe on $50/Day",
    excerpt: "Complete guide to exploring Europe without breaking the bank. Tips on hostels, local food, and transport.",
    category: "Budget Travel",
    date: "2025-11-18",
    author: "Mike Chen",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Local Guide: Best Street Food in Bangkok",
    excerpt: "Experience authentic Thai cuisine through the bustling street food scene. Must-try vendors and dishes.",
    category: "Food & Culture",
    date: "2025-11-15",
    author: "Priya Patel",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1504674900968-e4355193b2b5?w=600&h=400&fit=crop",
  },
  {
    id: "4",
    title: "Mountain Hiking Safety: Everything You Need to Know",
    excerpt: "Essential tips for safe and enjoyable mountain hiking. Gear, preparation, and emergency protocols.",
    category: "Adventure",
    date: "2025-11-12",
    author: "Alex Rivera",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop",
  },
  {
    id: "5",
    title: "Digital Nomad Guide: Best Coworking Spaces Worldwide",
    excerpt: "Top coworking spaces around the world for remote workers and digital nomads. Stay productive anywhere.",
    category: "Travel Tips",
    date: "2025-11-10",
    author: "Emma Wilson",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">StayHub Travel Guides & Tips</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover travel tips, local guides, and insider advice to make your next trip unforgettable.
            </p>
          </div>

          {/* Featured Article */}
          {TRAVEL_GUIDES.length > 0 && (
            <Card className="mb-12 overflow-hidden hover-elevate border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div 
                  className="aspect-video md:aspect-auto overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
                  }}
                >
                  <img
                    src={TRAVEL_GUIDES[0].image}
                    alt={TRAVEL_GUIDES[0].title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-3 bg-primary/10 text-primary">
                    {TRAVEL_GUIDES[0].category}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-3">{TRAVEL_GUIDES[0].title}</h2>
                  <p className="text-muted-foreground mb-4">{TRAVEL_GUIDES[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {TRAVEL_GUIDES[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(TRAVEL_GUIDES[0].date).toLocaleDateString()}
                    </span>
                    <span>{TRAVEL_GUIDES[0].readTime} min read</span>
                  </div>
                  <Button className="w-fit">
                    Read Article
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAVEL_GUIDES.slice(1).map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover-elevate border cursor-pointer transition-all duration-300"
                data-testid={`card-article-${article.id}`}
              >
                <div 
                  className="aspect-video overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.12) 0%, rgba(233, 30, 99, 0.08) 50%, rgba(233, 30, 99, 0.12) 100%)'
                  }}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Badge className="bg-primary/10 text-primary">{article.category}</Badge>
                  <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author}
                    </span>
                    <span>{article.readTime} min</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Subscribe to Our Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-md border border-input bg-background"
                data-testid="input-email"
              />
              <Button className="px-6">Subscribe</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
