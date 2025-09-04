import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as CasesIcon,
  CalendarToday as AppointmentsIcon,
  Description as DocumentsIcon,
  Book as ConstitutionIcon,
  People as ClientsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar({ activeTab, onTabChange, drawerWidth }) {
  const { user } = useAuth();

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
    { text: 'Cases', icon: <CasesIcon />, value: 'cases' },
    { text: 'Appointments', icon: <AppointmentsIcon />, value: 'appointments' },
    { text: 'Documents', icon: <DocumentsIcon />, value: 'documents' },
    { text: 'Constitutions', icon: <ConstitutionIcon />, value: 'constitutions' },
    { text: 'Clients', icon: <ClientsIcon />, value: 'clients' },
  ];

  const clientMenuItems = [
    { text: 'My Cases', icon: <CasesIcon />, value: 'cases' },
    { text: 'My Appointments', icon: <AppointmentsIcon />, value: 'appointments' },
    { text: 'My Documents', icon: <DocumentsIcon />, value: 'documents' },
    { text: 'Constitutions', icon: <ConstitutionIcon />, value: 'constitutions' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          Legal Ease Lite
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role === 'admin' ? 'Admin Portal' : 'Client Portal'}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.value}
            selected={activeTab === item.value}
            onClick={() => onTabChange(item.value)}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;