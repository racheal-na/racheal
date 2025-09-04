import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Layout/Header';
// In ClientDashboard.js or another component in src/components/Dashboard
import Sidebar from '../Layout/Sidebar';
import Footer from '../Layout/Footer';
import MyCases from './MyCases';
import MyAppointments from './MyAppointments';
import MyDocuments from './MyDocuments';
import ConstitutionAccess from './ConstitutionAccess';

function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('cases');
  const { user } = useAuth();
  const drawerWidth = 240;

  const renderContent = () => {
    switch (activeTab) {
      case 'cases':
        return <MyCases />;
      case 'appointments':
        return <MyAppointments />;
      case 'documents':
        return <MyDocuments />;
      case 'constitutions':
        return <ConstitutionAccess />;
      default:
        return <MyCases />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'cases': return 'My Cases';
      case 'appointments': return 'My Appointments';
      case 'documents': return 'My Documents';
      case 'constitutions': return 'Constitution Access';
      default: return 'Client Portal';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        drawerWidth={drawerWidth} 
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Header title={getTitle()} />
        
        <Container maxWidth="xl" sx={{ mt: 2, flex: 1 }}>
          {renderContent()}
        </Container>
        
        <Footer />
      </Box>
    </Box>
  );
}

export default ClientDashboard;