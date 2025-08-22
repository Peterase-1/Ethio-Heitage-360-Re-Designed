import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  SvgIcon, 
  LinearProgress,
  Tooltip,
  IconButton,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  People as PeopleIcon,
  Museum as MuseumIcon,
  ArtTrack as ArtifactsIcon,
  EventNote as EventsIcon,
  ArrowUpward,
  ArrowDownward,
  InfoOutlined,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const StyledCard = styled(Card)(({ theme, color = 'primary' }) => ({
  height: '100%',
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'visible',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  borderLeft: `4px solid ${theme.palette[color].main}`,
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
}));

const IconWrapper = styled('div')(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette[color].main, 0.1),
  color: theme.palette[color].main,
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 28,
  },
}));

const TrendIndicator = styled('span', {
  shouldForwardProp: (prop) => prop !== 'trend',
})(({ theme, trend = 'up' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 600,
  fontSize: '0.875rem',
  '& svg': {
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, color = 'primary' }) => ({
  height: 4,
  borderRadius: 2,
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette[color].main,
  },
}));

const iconMap = {
  users: PeopleIcon,
  museums: MuseumIcon,
  artifacts: ArtifactsIcon,
  events: EventsIcon,
};

const AnalyticsCard = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  trendValue,
  progress,
  subtitle,
  tooltip = '',
  onRefresh,
  loading = false,
}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(loading);
  // Determine how to render the icon:
  // - If a React element is passed (e.g., <Heart />), use it as-is
  // - If a string key is passed (e.g., 'users'), map to a Material icon
  // - If a component is passed, render it
  const resolvedIcon = React.useMemo(() => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = iconMap[icon] || icon;
    if (typeof IconComponent === 'string') {
      return (
        <SvgIcon color={color}>
          {IconComponent}
        </SvgIcon>
      );
    }
    if (IconComponent) {
      return <IconComponent />;
    }
    return null;
  }, [icon, color]);

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

  return (
    <StyledCard color={color} elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <IconWrapper color={color}>
            {resolvedIcon}
          </IconWrapper>
          <Box display="flex" gap={1}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {tooltip && (
              <Tooltip title={tooltip}>
                <IconButton size="small">
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box mt={1}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {isLoading ? '...' : value}
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend !== undefined && (
              <TrendIndicator trend={trend}>
                {trend === 'up' ? <ArrowUpward /> : <ArrowDownward />}
                {trendValue}
              </TrendIndicator>
            )}
          </Box>
          
          {progress !== undefined && (
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" fontWeight="medium">
                  {progress}%
                </Typography>
              </Box>
              <ProgressBar 
                variant="determinate" 
                value={progress} 
                color={color}
              />
            </Box>
          )}

          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default AnalyticsCard;