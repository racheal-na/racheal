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
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { constitutionsAPI } from '../../../services/api';

function ConstitutionManagement() {
  const [constitutions, setConstitutions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    file: null
  });

  useEffect(() => {
    loadConstitutions();
  }, []);

  const loadConstitutions = async () => {
    try {
      setLoading(true);
      const response = await constitutionsAPI.getAll();
      setConstitutions(response.data.constitutions || []);
    } catch (error) {
      setError('Error loading constitutions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleUploadConstitution = async () => {
    if (!formData.file || !formData.title || !formData.category) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('file', formData.file);

      await constitutionsAPI.create(uploadFormData);
      
      setOpenDialog(false);
      setFormData({ title: '', description: '', category: '', file: null });
      loadConstitutions();
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading constitution');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (constitution) => {
    try {
      const response = await constitutionsAPI.download(constitution._id);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', constitution.fileName || 'constitution.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Update download count
      await constitutionsAPI.download(constitution._id);
    } catch (error) {
      setError('Error downloading file');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this constitution?')) {
      return;
    }

    try {
      await constitutionsAPI.delete(id);
      loadConstitutions();
    } catch (error) {
      setError('Error deleting constitution');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Constitution Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Upload Constitution
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        {constitutions.map((constitution) => (
          <Grid item xs={12} md={6} lg={4} key={constitution._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {constitution.title}
                </Typography>
                <Chip 
                  label={constitution.category} 
                  size="small" 
                  color="primary"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" paragraph>
                  {constitution.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Uploaded: {new Date(constitution.uploadedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Downloads: {constitution.downloadCount}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(constitution)}
                  fullWidth
                >
                  Download
                </Button>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(constitution._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Constitution</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title *"
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
            label="Category *"
            fullWidth
            variant="outlined"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <MenuItem value="Criminal">Criminal</MenuItem>
            <MenuItem value="Civil">Civil</MenuItem>
            <MenuItem value="Family">Family</MenuItem>
            <MenuItem value="Corporate">Corporate</MenuItem>
            <MenuItem value="General">General</MenuItem>
          </TextField>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="constitution-file"
            />
            <label htmlFor="constitution-file">
              <Button variant="outlined" component="span">
                Select PDF File
              </Button>
            </label>
            {formData.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {formData.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadConstitution} 
            variant="contained" 
            disabled={uploading || !formData.file}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConstitutionManagement;