import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../Layout/Header';
import Sidebar from '../../Layout/Sidebar';
import Footer from '../../Layout/Footer';
import CaseManagement from './CaseManagement';
import AppointmentManagement from './AppointmentManagement';
import DocumentManagement from './DocumentManagement';
import ConstitutionManagement from './ConstitutionManagement';
import ClientManagement from './ClientManagement';
import DashboardOverview from './DashboardOverview';
import './LawyerDashboard.css'; // Import the CSS file

function LawyerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const drawerWidth = 240;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'cases': return <CaseManagement />;
      case 'appointments': return <AppointmentManagement />;
      case 'documents': return <DocumentManagement />;
      case 'constitutions': return <ConstitutionManagement />;
      case 'clients': return <ClientManagement />;
      default: return <DashboardOverview />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Lawyer Dashboard';
      case 'cases': return 'Case Management';
      case 'appointments': return 'Appointment Management';
      case 'documents': return 'Document Management';
      case 'constitutions': return 'Constitution Management';
      case 'clients': return 'Client Management';
      default: return 'Legal Ease Lite';
    }
  };

  return (
    <Box className="lawyer-dashboard-container">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        drawerWidth={drawerWidth} 
      />
      <Box 
        component="main" 
        className="dashboard-main-content"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Container maxWidth="lg" className="content-container">
          <Header title={getTitle()} user={user} />
          <Box className="dashboard-content">
            {renderContent()}
          </Box>
          <Footer />
        </Container>
      </Box>
    </Box>
  );
}

export default LawyerDashboard;