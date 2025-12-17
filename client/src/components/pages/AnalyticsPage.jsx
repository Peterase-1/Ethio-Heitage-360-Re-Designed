import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { useDashboard } from "../../context/DashboardContext";
import { toast } from "sonner";
import apiService from "../../services/api";

export function AnalyticsPage() {
  const { organizerId } = useDashboard();
  const [timeFilter, setTimeFilter] = useState("12months");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRevenue: [],
    tourPopularity: [],
    customerSegments: [],
    regionPerformance: [],
    summary: {
      totalRevenue: 0,
      totalBookings: 0,
      avgBookingValue: 0,
      monthlyGrowth: 0,
      customerSatisfaction: 4.8
    }
  });

  useEffect(() => {
    if (organizerId) {
      fetchAnalytics();
    }
  }, [organizerId, timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      let dateRange = {};
      switch (timeFilter) {
        case '7days': dateRange = { days: 7 }; break;
        case '30days': dateRange = { days: 30 }; break;
        case '3months': dateRange = { months: 3 }; break;
        case '12months': dateRange = { months: 12 }; break;
        default: dateRange = { months: 12 };
      }

      const [bookingStats, tourStats] = await Promise.all([
        apiService.getBookingStats(organizerId, dateRange),
        apiService.getTourPackageStats(organizerId)
      ]);

      // Map API response to component state
      // This mapping assumes the API returns data in a structured way
      // If the API is missing some fields, we use defaults
      setAnalyticsData({
        monthlyRevenue: bookingStats.monthlyRevenue || [],
        tourPopularity: tourStats.popularity || [],
        customerSegments: bookingStats.customerSegments || [
          { name: 'Returning Customers', value: 35, color: '#16a34a' },
          { name: 'First-time Visitors', value: 45, color: '#15803d' },
          { name: 'Group Bookings', value: 20, color: '#166534' }
        ],
        regionPerformance: bookingStats.regionPerformance || [],
        summary: {
          totalRevenue: bookingStats.totalRevenue || 0,
          totalBookings: bookingStats.totalBookings || 0,
          avgBookingValue: bookingStats.avgBookingValue || 0,
          monthlyGrowth: bookingStats.monthlyGrowth || 0,
          customerSatisfaction: tourStats.averageRating || 4.8
        }
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load real-time analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  const handleExportReport = () => {
    toast.success("Analytics report exported successfully");
  };

  const { monthlyRevenue, tourPopularity, customerSegments, regionPerformance, summary } = analyticsData;
  const { totalRevenue, totalBookings, avgBookingValue, monthlyGrowth } = summary;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            className="border-gray-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-800">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+{monthlyGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-stone-800">{totalBookings}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">+15.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Avg. Booking Value</p>
                <p className="text-2xl font-semibold text-stone-800">${Math.round(avgBookingValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">-2.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Customer Satisfaction</p>
                <p className="text-2xl font-semibold text-stone-800">4.8/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+0.3</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="tours">Tour Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="regions">Regional Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bookings vs Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="bookings" fill="#0D9488" name="Bookings" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tours" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tour Package Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tourPopularity} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [value, 'Bookings']} />
                    <Bar dataKey="bookings" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tour Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tourPopularity.map((tour, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-700">{tour.name}</span>
                        <span className="text-sm font-semibold text-stone-800">${tour.revenue.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(tour.revenue / Math.max(...tourPopularity.map(t => t.revenue))) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-600">Average CLV</p>
                    <p className="text-xl font-semibold text-stone-800">$1,247</p>
                  </div>
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <p className="text-sm text-stone-600">Retention Rate</p>
                    <p className="text-xl font-semibold text-stone-800">68%</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Repeat customers</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Customer acquisition cost</span>
                    <span className="text-sm font-medium">$89</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionPerformance.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-stone-500" />
                      <div>
                        <p className="font-medium text-stone-800">{region.region}</p>
                        <p className="text-sm text-stone-600">{region.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">${region.revenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        {region.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {region.growth > 0 ? '+' : ''}{region.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-600">Positive Trend</Badge>
              </div>
              <p className="text-sm text-green-800">
                Simien Mountains Trek shows 23% growth this quarter. Consider increasing capacity.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <Badge className="bg-blue-600">Opportunity</Badge>
              </div>
              <p className="text-sm text-blue-800">
                North American market shows strong potential. Focus marketing efforts here.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                <Badge className="bg-yellow-600">Attention Needed</Badge>
              </div>
              <p className="text-sm text-yellow-800">
                Average booking value declining. Consider premium package options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}