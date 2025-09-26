import React from 'react';
import { Brain, Clock, Trophy, Users } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{quiz.title}</h3>
          <p className="text-muted-foreground text-sm">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
