import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function Header({ title, onNotificationsClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null); // For notifications
  const { user, logout } = useAuth();

  // Example notifications (replace with your data)
  const notifications = [
    { id: 1, message: "New case assigned to you." },
    { id: 2, message: "Document uploaded by client." },
    { id: 3, message: "Upcoming appointment tomorrow." },
    { id: 4, message: "System update scheduled." }
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  // Notification menu handlers
  const handleNotifMenu = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {/* Notification Icon */}
        <IconButton color="inherit" onClick={handleNotifMenu}>
          <Badge badgeContent={notifications.length} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
        >
          <List sx={{ minWidth: 250 }}>
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText primary="No new notifications" />
              </ListItem>
            )}
            {notifications.map((notif) => (
              <div key={notif.id}>
                <ListItem>
                  <ListItemText primary={notif.message} />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Menu>

        {/* User Avatar and Menu */}
        <IconButton color="inherit" onClick={handleMenu}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;