import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Users,
  Landmark,
  Palette,
  Calendar,
  ArrowUp,
  ArrowDown,
  Info,
  RefreshCcw
} from 'lucide-react';
import { cn } from '../ui/utils';

// Icon mapping using Lucide icons
const iconMap = {
  users: Users,
  museums: Landmark,
  artifacts: Palette,
  events: Calendar,
};

const AnalyticsCard = ({
  title,
  value,
  icon,
  color = 'primary', // Note: color handling will change with Tailwind
  trend,
  trendValue,
  progress,
  subtitle,
  tooltip = '',
  onRefresh,
  loading = false,
}) => {
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsLoading(true);
      try {
        await onRefresh();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Resolve icon component
  const IconComponent = iconMap[icon] || icon;

  // Helper to map color prop to Tailwind classes (simplified)
  // You might need a more robust mapping if 'color' can be arbitrary values
  const getColorClasses = (c) => {
    switch (c) {
      case 'primary': return 'text-primary bg-primary/10 border-l-primary';
      case 'secondary': return 'text-secondary bg-secondary/10 border-l-secondary';
      case 'success': return 'text-green-500 bg-green-500/10 border-l-green-500';
      case 'error': return 'text-destructive bg-destructive/10 border-l-destructive';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-l-yellow-500';
      default: return 'text-primary bg-primary/10 border-l-primary';
    }
  };

  const getIconColorClass = (c) => {
    switch (c) {
      case 'primary': return 'text-primary bg-primary/10';
      case 'secondary': return 'text-secondary bg-secondary/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'error': return 'text-destructive bg-destructive/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-primary bg-primary/10';
    }
  }

  const getBorderColorClass = (c) => {
    switch (c) {
      case 'primary': return 'border-l-primary';
      case 'secondary': return 'border-l-secondary';
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-destructive';
      case 'warning': return 'border-l-yellow-500';
      default: return 'border-l-primary';
    }
  }


  return (
    <Card className={cn(
      "h-full relative overflow-visible transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border-l-4",
      getBorderColorClass(color)
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full mb-4",
            getIconColorClass(color)
          )}>
            {React.isValidElement(icon) ? icon : (IconComponent && <IconComponent className="h-7 w-7" />)}
          </div>

          <div className="flex gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh"
              >
                <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            )}
            {tooltip && (
              <Button variant="ghost" size="icon" className="h-8 w-8" title={tooltip}>
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-1">
          <div className="text-3xl font-bold text-foreground">
            {isLoading ? '...' : value}
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground font-medium">
              {title}
            </span>
            {trend !== undefined && (
              <span className={cn(
                "inline-flex items-center font-semibold text-sm",
                trend === 'up' ? "text-green-500" : "text-destructive"
              )}>
                {trend === 'up' ? <ArrowUp className="w-4 h-4 mr-0.5" /> : <ArrowDown className="w-4 h-4 mr-0.5" />}
                {trendValue}
              </span>
            )}
          </div>

          {progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {subtitle && (
            <span className="text-xs text-muted-foreground block mt-2">
              {subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;