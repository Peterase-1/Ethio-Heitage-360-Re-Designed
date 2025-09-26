import React from 'react';
import { Video, Calendar, Users } from 'lucide-react';

const LiveSessionCard = ({ session }) => {
  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
          <Video className="h-6 w-6 text-secondary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{session.title}</h3>
          <p className="text-muted-foreground text-sm">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionCard;
