import { useAuth } from '../../hooks/useAuth';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Museum as MuseumIcon,
  ArtTrack as ArtifactsIcon,
  Settings as SettingsIcon,
  BarChart as AnalyticsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  EventNote as EventsIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin-dashboard',
    subItems: []
  },
  { 
    text: 'Users', 
    icon: <PeopleIcon />, 
    path: '/admin-dashboard/users',
    subItems: [
      { text: 'All Users', path: '/admin-dashboard/users' },
      { text: 'Admins', path: '/admin-dashboard/users/admins' },
      { text: 'Museum Staff', path: '/admin-dashboard/users/staff' },
    ]
  },
  { 
    text: 'Museums', 
    icon: <MuseumIcon />, 
    path: '/admin-dashboard/museums',
    subItems: [
      { text: 'All Museums', path: '/admin-dashboard/museums' },
      { text: 'Add New', path: '/admin-dashboard/museums/new' },
    ]
  },
  { 
    text: 'Artifacts', 
    icon: <ArtifactsIcon />, 
    path: '/admin-dashboard/artifacts',
    subItems: [
      { text: 'All Artifacts', path: '/admin-dashboard/artifacts' },
      { text: 'Pending Approval', path: '/admin-dashboard/artifacts/pending' },
      { text: 'Add New', path: '/admin-dashboard/artifacts/new' },
    ]
  },
  { 
    text: 'Events', 
    icon: <EventsIcon />, 
    path: '/admin-dashboard/events',
    subItems: []
  },
  { 
    text: 'Analytics', 
    icon: <AnalyticsIcon />, 
    path: '/admin-dashboard/analytics',
    subItems: []
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/admin-dashboard/settings',
    subItems: [
      { text: 'General', path: '/admin-dashboard/settings/general' },
      { text: 'Security', path: '/admin-dashboard/settings/security' },
      { text: 'Appearance', path: '/admin-dashboard/settings/appearance' },
    ]
  },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openSubMenus, setOpenSubMenus] = useState({});

  // Initialize submenu states
  useEffect(() => {
    const initialOpenState = {};
    menuItems.forEach((item, index) => {
      if (item.subItems && item.subItems.length > 0) {
        // Check if any subitem matches the current path
        const isActive = item.subItems.some(subItem => 
          location.pathname.startsWith(subItem.path)
        );
        initialOpenState[item.path] = isActive;
      }
    });
    setOpenSubMenus(initialOpenState);
  }, [location.pathname]);

  const handleSubMenuToggle = (path) => {
    setOpenSubMenus(prevState => ({
      ...prevState,
      [path]: !prevState[path]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" noWrap component="div">
            Admin Panel
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={onClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map((item) => (
          <div key={item.path}>
            <ListItem 
              disablePadding 
              onClick={() => {
                if (item.subItems && item.subItems.length > 0) {
                  handleSubMenuToggle(item.path);
                } else {
                  handleNavigation(item.path);
                }
              }}
              sx={{
                backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemButton>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && item.subItems.length > 0 && (
                  openSubMenus[item.path] ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>
            
            {item.subItems && item.subItems.length > 0 && (
              <Collapse in={openSubMenus[item.path] || false} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItemButton
                      key={subItem.path}
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{
                        pl: 6,
                        backgroundColor: location.pathname === subItem.path 
                          ? theme.palette.action.selected 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding onClick={logout}>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      open={open}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;