import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';

interface UserStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageRating: number;
  totalGuests: number;
  totalListings: number;
  monthlyBookings: Array<{ month: string; bookings: number; revenue: number }>;
  upcomingBookings: number;
  cancellationRate: number;
  responseTime: number; // in hours
}

export default function UserStatsPage() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return <div>No data available</div>;

  const StatCard = ({ title, value, icon: Icon, unit }: any) => (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 data-testid="text-stats-heading" className="text-3xl font-bold mb-8">Your Statistics</h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          unit="lifetime bookings"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          unit="after fees"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon={TrendingUp}
          unit="booked nights"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={Users}
          unit="out of 5"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card data-testid="card-upcoming-bookings">
          <CardHeader>
            <CardTitle className="text-sm">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingBookings}</div>
          </CardContent>
        </Card>
        <Card data-testid="card-cancellation-rate">
          <CardHeader>
            <CardTitle className="text-sm">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.cancellationRate}%</div>
          </CardContent>
        </Card>
        <Card data-testid="card-response-time">
          <CardHeader>
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.responseTime}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends - Simple Table */}
      <Card data-testid="card-monthly-trends">
        <CardHeader>
          <CardTitle>Monthly Bookings & Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Month</th>
                  <th className="text-right py-2">Bookings</th>
                  <th className="text-right py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyBookings.map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="py-2">{row.month}</td>
                    <td className="text-right">{row.bookings}</td>
                    <td className="text-right">${row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
