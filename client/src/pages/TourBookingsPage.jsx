import { useState } from "react";
import { Eye, Mail, Calendar, Users, DollarSign, Filter, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useDashboard } from "../../context/DashboardContext";
import { toast } from "sonner";

export function TourBookingsPage() {
  const { bookings, tourPackages, updateBookingStatus } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = bookings.filter(booking => {
    const tour = tourPackages.find(t => t.id === booking.tourPackageId);
    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      booking.customerName.toLowerCase().includes(lowerSearch) ||
      booking.customerEmail.toLowerCase().includes(lowerSearch) ||
      tour?.title.toLowerCase().includes(lowerSearch);

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update booking status");
    }
  };

  const handleViewDetails = (bookingId) => {
    toast.info(`Detailed view for booking ${bookingId} would open here`);
  };

  const handleContactCustomer = (email) => {
    toast.info(`Email composer would open for ${email}`);
  };

  const handleExport = () => {
    toast.info("Export functionality would be implemented here");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "completed":
        return "bg-blue-600";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tour Bookings</h1>
          <p className="text-gray-600">Manage customer bookings and reservations</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length, color: "bg-blue-100 text-blue-800" },
          { label: "Pending", value: bookings.filter(b => b.status === "pending").length, color: "bg-yellow-100 text-yellow-800" },
          { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, color: "bg-green-100 text-green-800" },
          { label: "Completed", value: bookings.filter(b => b.status === "completed").length, color: "bg-green-100 text-green-800" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}>
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search bookings"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Bookings will appear here once customers make reservations"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const tour = tourPackages.find(t => t.id === booking.tourPackageId);
                  const tourDate = formatDate(booking.tourDate);
                  const statusColor = getStatusColor(booking.status);

                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tour?.title || "Unknown Tour"}</p>
                          <p className="text-sm text-gray-600">{tour?.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>{tourDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-600" />
                          {booking.guests}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          {booking.totalAmount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColor}`}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking.id)} aria-label="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleContactCustomer(booking.customerEmail)} aria-label="Contact Customer">
                            <Mail className="w-4 h-4" />
                          </Button>

                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, "confirmed")}
                                className="bg-green-600 hover:bg-green-700"
                                aria-label="Confirm Booking"
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, "cancelled")}
                                aria-label="Cancel Booking"
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {booking.status === "confirmed" && new Date(booking.tourDate) < new Date() && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, "completed")}
                              className="bg-blue-600 hover:bg-blue-700"
                              aria-label="Mark as Completed"
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}