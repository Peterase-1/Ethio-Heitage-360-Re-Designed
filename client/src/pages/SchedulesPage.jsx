import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Plus,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDashboard } from "../../context/DashboardContext";
import { toast } from "sonner";

function AddEventModal({ open, onClose, onAdd, tourPackages }) {
  const [form, setForm] = useState({
    tourDate: "",
    guests: 1,
    tourPackageId: "",
    totalAmount: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({
      tourDate: "",
      guests: 1,
      tourPackageId: "",
      totalAmount: 0,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4 w-96"
      >
        <h2 className="text-lg font-semibold mb-2">Add New Event</h2>
        <div>
          <label className="block text-sm mb-1">Date</label>
          <input
            type="date"
            name="tourDate"
            value={form.tourDate}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Guests</label>
          <input
            type="number"
            name="guests"
            value={form.guests}
            min={1}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tour Package</label>
          <select
            name="tourPackageId"
            value={form.tourPackageId}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          >
            <option value="">Select a package</option>
            {tourPackages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            value={form.totalAmount}
            min={0}
            onChange={handleChange}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add</Button>
        </div>
      </form>
    </div>
  );
}

export function SchedulesPage() {
  const { bookings, tourPackages, addBooking } = useDashboard();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week'
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Helpers for month view
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Helpers for week view
  const getStartOfWeek = (date) => {
    const day = date.getDay(); // Sunday = 0
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const getWeekDates = (startOfWeek) => {
    return Array.from(
      { length: 7 },
      (_, i) =>
        new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate() + i
        )
    );
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return bookings.filter(
      (booking) =>
        booking.tourDate.startsWith(dateString) &&
        (booking.status === "confirmed" || booking.status === "pending")
    );
  };

  // Navigation by month or week depending on viewMode
  const navigateDate = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      } else {
        newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      }
      return newDate;
    });
  };

  // Event handlers
  const handleTourClick = (bookingId) => {
    toast.info(`Tour details for booking ${bookingId} would open here`);
  };

  const handleAddEvent = () => setShowAddEventModal(true);

  const handleEventAdd = (eventData) => {
    addBooking(eventData);
    toast.success("Event added!");
  };

  // Render calendar for month view
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty slots for days before first of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="p-2 h-24 border border-gray-200 bg-gray-50"
        ></div>
      );
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayBookings = getBookingsForDate(cellDate);
      const isToday = cellDate.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`p-2 h-24 border border-gray-200 hover:bg-gray-50 transition-colors ${
            isToday ? "bg-green-50 border-green-300" : "bg-white"
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? "text-green-700" : "text-gray-800"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayBookings.slice(0, 2).map((booking) => {
              const tour = tourPackages.find(
                (t) => t.id === booking.tourPackageId
              );
              return (
                <div
                  key={booking.id}
                  onClick={() => handleTourClick(booking.id)}
                  className="bg-green-100 text-green-800 text-xs p-1 rounded cursor-pointer hover:bg-green-200 transition-colors truncate"
                >
                  {tour?.title || "Unknown Tour"}
                </div>
              );
            })}
            {dayBookings.length > 2 && (
              <div className="text-xs text-gray-600">
                +{dayBookings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Render calendar for week view
  const renderWeekCalendar = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDates = getWeekDates(startOfWeek);

    return (
      <>
        {/* Week header */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
            const date = weekDates[idx];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div
                key={day}
                className={`p-2 text-sm font-medium text-center ${
                  isToday ? "text-green-700" : "text-gray-600"
                }`}
              >
                <div>{day}</div>
                <div className="text-xs">{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {weekDates.map((date) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`p-2 h-24 border border-gray-200 hover:bg-gray-50 transition-colors ${
                  isToday ? "bg-green-50 border-green-300" : "bg-white"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday ? "text-green-700" : "text-gray-800"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => {
                    const tour = tourPackages.find(
                      (t) => t.id === booking.tourPackageId
                    );
                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleTourClick(booking.id)}
                        className="bg-green-100 text-green-800 text-xs p-1 rounded cursor-pointer hover:bg-green-200 transition-colors truncate"
                      >
                        {tour?.title || "Unknown Tour"}
                      </div>
                    );
                  })}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-gray-600">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Upcoming tours sorted and filtered
  const upcomingTours = bookings
    .filter(
      (booking) =>
        new Date(booking.tourDate) >= new Date() &&
        booking.status === "confirmed"
    )
    .sort(
      (a, b) => new Date(a.tourDate).getTime() - new Date(b.tourDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Schedules</h1>
          <p className="text-gray-600">View and manage your tour schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={viewMode}
            onValueChange={(value) => setViewMode(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddEvent}
            className="bg-primary hover:bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {viewMode === "month"
                    ? currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })
                    : `Week of ${getStartOfWeek(
                        currentDate
                      ).toLocaleDateString()}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev")}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next")}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "month" && (
                <>
                  <div className="grid grid-cols-7 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="p-2 text-sm font-medium text-gray-600 text-center"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                    {renderCalendar()}
                  </div>
                </>
              )}
              {viewMode === "week" && renderWeekCalendar()}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tours */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTours.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No upcoming tours scheduled
                </p>
              ) : (
                upcomingTours.map((booking) => {
                  const tour = tourPackages.find(
                    (t) => t.id === booking.tourPackageId
                  );
                  const tourDate = new Date(booking.tourDate);

                  return (
                    <div
                      key={booking.id}
                      onClick={() => handleTourClick(booking.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {tour?.title || "Unknown Tour"}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CalendarIcon className="w-3 h-3" />
                          {tourDate.toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="w-3 h-3" />
                          {booking.guests} guests
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {tour?.location}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Tours</span>
                <span className="font-medium">{upcomingTours.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Guests</span>
                <span className="font-medium">
                  {upcomingTours.reduce(
                    (sum, booking) => sum + booking.guests,
                    0
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  $
                  {upcomingTours.reduce(
                    (sum, booking) => sum + booking.totalAmount,
                    0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        open={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onAdd={handleEventAdd}
        tourPackages={tourPackages}
      />
    </div>
  );
}