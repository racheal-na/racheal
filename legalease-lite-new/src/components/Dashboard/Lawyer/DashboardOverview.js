import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';
import {
  Folder as CasesIcon,
  CalendarToday as AppointmentsIcon,
  Description as DocumentsIcon,
  People as ClientsIcon
} from '@mui/icons-material';
import { casesAPI, appointmentsAPI } from '../../../services/api';

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalCases: 0,
    totalAppointments: 0,
    totalDocuments: 0,
    totalClients: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [casesRes, appointmentsRes] = await Promise.all([
        casesAPI.getAll(),
        appointmentsAPI.getAll()
      ]);

      // Mock data for documents and clients (replace with actual API calls)
      setStats({
        totalCases: casesRes.data.total ||  casesRes.data.cases?.length || 0,
        totalAppointments: appointmentsRes.data.total ||  appointmentsRes.data.appointments?.length || 0,
        totalDocuments: 24, // Mock data
        totalClients: 8, // Mock data
        loading: false
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return <LinearProgress />;
  }

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: <CasesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1a237e'
    },
    {
      title: 'Upcoming Appointments',
      value: stats.totalAppointments,
      icon: <AppointmentsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#ff6f00'
    },
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: <DocumentsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32'
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: <ClientsIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#0288d1'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography color="textSecondary">
                • New case "Smith vs. Johnson" created
              </Typography>
              <Typography color="textSecondary">
                • Appointment scheduled for tomorrow
              </Typography>
              <Typography color="textSecondary">
                • Document uploaded to case #123
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography color="textSecondary">
                • Create new case
              </Typography>
              <Typography color="textSecondary">
                • Schedule appointment
              </Typography>
              <Typography color="textSecondary">
                • Upload document
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardOverview;