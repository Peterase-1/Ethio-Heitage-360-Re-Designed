import React, { useMemo, useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import ProfileStats from './ProfileStats';
import BookingCard from './BookingCard';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { toast } from 'sonner';

export default function UserProfile() {
  const { bookings, tourPackages, addCustomerMessage } = useDashboard();
  const [activeTab, setActiveTab] = useState('overview');
  const [msgForm, setMsgForm] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  // Normalize to start of today to avoid excluding same-day bookings
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const withTourTitle = useMemo(() => (
    bookings.map(b => ({
      ...b,
      tourTitle: tourPackages.find(t => t.id === b.tourPackageId)?.title || 'Unknown Tour',
      location: tourPackages.find(t => t.id === b.tourPackageId)?.location || 'Unknown Location'
    }))
  ), [bookings, tourPackages]);

  const stats = useMemo(() => {
    const upcoming = withTourTitle.filter(b => new Date(b.tourDate) >= todayStart && (b.status === 'confirmed' || b.status === 'pending')).length;
    const pending = withTourTitle.filter(b => b.status === 'pending').length;
    const confirmed = withTourTitle.filter(b => b.status === 'confirmed').length;
    const cancelled = withTourTitle.filter(b => b.status === 'cancelled').length;
    return { upcoming, pending, confirmed, cancelled };
  }, [withTourTitle, todayStart]);

  const recent = withTourTitle
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const upcomingBookings = withTourTitle.filter(b => new Date(b.tourDate) >= todayStart);
  const pastBookings = withTourTitle.filter(b => new Date(b.tourDate) < todayStart);

  const handleSendMessage = async () => {
    if (!msgForm.customerName || !msgForm.customerEmail || !msgForm.message) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    try {
      addCustomerMessage({
        customerName: msgForm.customerName,
        customerEmail: msgForm.customerEmail,
        subject: msgForm.subject || 'General Inquiry',
        message: msgForm.message,
        status: 'unread'
      });
      toast.success('Message sent to the organizer!');
      setMsgForm({ customerName: '', customerEmail: '', subject: '', message: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary p-6 text-primary-foreground shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">Your Travel Profile</h1>
        <p className="opacity-90">Track bookings, view history, and contact organizers.</p>
        <div className="mt-4">
          <ProfileStats stats={stats} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'bookings', label: 'My Bookings' },
            { key: 'history', label: 'Tour History' },
            { key: 'message', label: 'Message Organizer' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          {recent.length === 0 && (
            <div className="p-6 text-center text-muted-foreground border border-border rounded-xl bg-card">No recent bookings yet.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map(b => (
              <BookingCard key={b.id} booking={b} tourTitle={b.tourTitle} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="mt-6 space-y-4">
          {upcomingBookings.length === 0 && (
            <div className="p-6 text-center text-muted-foreground border border-border rounded-xl bg-card">You have no upcoming bookings.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map(b => (
              <BookingCard key={b.id} booking={b} tourTitle={b.tourTitle} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="mt-6 space-y-4">
          {pastBookings.length === 0 && (
            <div className="p-6 text-center text-muted-foreground border border-border rounded-xl bg-card">No past tours yet.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastBookings.map(b => (
              <BookingCard key={b.id} booking={b} tourTitle={b.tourTitle} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'message' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 border border-border rounded-xl p-6 bg-card shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message to the Organizer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="msgName">Your Name *</Label>
                  <Input id="msgName" value={msgForm.customerName} onChange={(e)=>setMsgForm(v=>({...v, customerName: e.target.value}))} placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msgEmail">Email Address *</Label>
                  <Input id="msgEmail" type="email" value={msgForm.customerEmail} onChange={(e)=>setMsgForm(v=>({...v, customerEmail: e.target.value}))} placeholder="Enter your email" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="msgSubject">Subject</Label>
                  <Input id="msgSubject" value={msgForm.subject} onChange={(e)=>setMsgForm(v=>({...v, subject: e.target.value}))} placeholder="e.g., Question about a tour" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="msgMessage">Message *</Label>
                  <Textarea id="msgMessage" rows={5} value={msgForm.message} onChange={(e)=>setMsgForm(v=>({...v, message: e.target.value}))} placeholder="Write your message..." />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSendMessage} disabled={sending} className="bg-primary hover:bg-primary/90">
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
            <div className="border border-border rounded-xl p-6 bg-muted">
              <h4 className="font-semibold text-gray-900 mb-2">Tip</h4>
              <p className="text-sm text-muted-foreground">Include your preferred tour and dates so organizers can assist you faster. You can also message directly from a tour card on the customer page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
