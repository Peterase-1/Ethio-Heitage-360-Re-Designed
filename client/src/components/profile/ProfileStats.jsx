import React from 'react';
import { CalendarCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProfileStats({ stats }) {
  const items = [
    {
      key: 'upcoming',
      label: 'Upcoming',
      value: stats.upcoming,
      icon: CalendarCheck,
      classes: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      key: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      classes: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle2,
      classes: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      value: stats.cancelled,
      icon: AlertTriangle,
      classes: 'bg-red-50 text-red-700 border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ key, label, value, icon: Icon, classes }) => (
        <div key={key} className={`border rounded-xl p-4 flex items-center gap-3 ${classes}`}>
          <Icon className="w-5 h-5" />
          <div>
            <div className="text-sm opacity-80">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
