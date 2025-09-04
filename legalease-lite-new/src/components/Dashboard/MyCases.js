import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { casesAPI } from '../../services/api';

function MyCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyCases();
  }, []);

  const loadMyCases = async () => {
    try {
      const response = await casesAPI.getAll();
      setCases(response.data.cases || []);
    } catch (error) {
      setError('Error loading cases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'primary';
      case 'Closed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading your cases...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Cases
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {cases.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="textSecondary">
              You don't have any cases yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cases.map((caseItem) => (
            <Grid item xs={12} md={6} key={caseItem._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {caseItem.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {caseItem.category} • <Chip 
                      label={caseItem.status} 
                      size="small" 
                      color={getStatusColor(caseItem.status)} 
                    />
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {caseItem.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Lawyer: {caseItem.adminId?.name || 'Not assigned'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Documents: {caseItem.documents?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MyCases;