
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { casesAPI } from '../../../services/api';

function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    clientId: ''
  });

  useEffect(() => {
    loadCases();
    loadClients();
  }, []);

  const loadCases = async () => {
    try {
      const response = await casesAPI.getAll();
      setCases(response.data.cases || []);
    } catch (error) {
      setError('Error loading cases');
    }
  };

  const loadClients = async () => {
    try {
      // Mock clients data - replace with actual API call
      const mockClients = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { _id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
      ];
      setClients(mockClients);
    } catch (error) {
      setError('Error loading clients');
    }
  };

  const handleCreateCase = async () => {
    try {
      setLoading(true);
      await casesAPI.create(formData);
      setOpenDialog(false);
      setFormData({ title: '', description: '', category: '', clientId: '' });
      loadCases(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating case');
    }
    setLoading(false);
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Case Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Case
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {cases.map((caseItem) => (
          <Grid item xs={12} md={6} lg={4} key={caseItem._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {caseItem.title}
                  </Typography>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
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
                  Client: {caseItem.clientId?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Documents: {caseItem.documents?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>


<Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Case</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Case Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Category"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <MenuItem value="Criminal">Criminal</MenuItem>
            <MenuItem value="Civil">Civil</MenuItem>
            <MenuItem value="Family">Family</MenuItem>
            <MenuItem value="Corporate">Corporate</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            select
            label="Client"
            fullWidth
            variant="outlined"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          >
            {clients.map((client) => (
              <MenuItem key={client._id} value={client._id}>
                {client.name} ({client.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCase} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CaseManagement;