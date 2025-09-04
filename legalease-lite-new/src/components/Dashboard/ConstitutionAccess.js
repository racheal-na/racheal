import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { constitutionsAPI } from '../../services/api';

function ConstitutionAccess() {
  const [constitutions, setConstitutions] = useState([]);
  const [filteredConstitutions, setFilteredConstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedConstitution, setSelectedConstitution] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Available categories
  const categories = ['All', 'Criminal', 'Civil', 'Family', 'Corporate', 'General'];

  useEffect(() => {
    loadConstitutions();
  }, []);

  // Fix: Add filterConstitutions to dependency array as recommended by eslint
  useEffect(() => {
    filterConstitutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constitutions, searchTerm, categoryFilter]);

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

  const filterConstitutions = () => {
    let filtered = constitutions;

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(constitution => 
        constitution.category === categoryFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(constitution =>
        constitution.title.toLowerCase().includes(term) ||
        constitution.description.toLowerCase().includes(term) ||
        constitution.category.toLowerCase().includes(term)
      );
    }

    setFilteredConstitutions(filtered);
  };

  const handleDownload = async (constitution) => {
    try {
      setDownloading(true);
      const response = await constitutionsAPI.download(constitution._id);
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', constitution.fileName || `${constitution.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Update download count locally
      setConstitutions(prev => prev.map(item =>
        item._id === constitution._id
          ? { ...item, downloadCount: (item.downloadCount || 0) + 1 }
          : item
      ));
    } catch (error) {
      setError('Error downloading file');
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = (constitution) => {
    setSelectedConstitution(constitution);
    setPreviewOpen(true);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Criminal': return 'error';
      case 'Civil': return 'primary';
      case 'Family': return 'secondary';
      case 'Corporate': return 'success';
      case 'General': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Constitution Access
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        Access and download legal constitutions and reference documents for your cases.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}


      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search constitutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Showing {filteredConstitutions.length} of {constitutions.length} constitutions
      </Typography>

      {/* Constitutions Grid */}
      {filteredConstitutions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="textSecondary">
              {constitutions.length === 0 
                ? 'No constitutions available yet.' 
                : 'No constitutions match your search criteria.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredConstitutions.map((constitution) => (
            <Grid item xs={12} md={6} lg={4} key={constitution._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <DescriptionIcon 
                      color="primary" 
                      sx={{ mr: 1, mt: 0.5 }} 
                    />
                    <Typography variant="h6" gutterBottom sx={{ flex: 1 }}>
                      {constitution.title}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={constitution.category} 
                    size="small" 
                    color={getCategoryColor(constitution.category)}
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" paragraph sx={{ minHeight: 60 }}>
                    {constitution.description || 'No description available.'}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 2 
                  }}>
                    <Typography variant="caption" color="textSecondary">
                      Uploaded: {new Date(constitution.uploadedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {constitution.downloadCount || 0} downloads


                  </Typography>
                  </Box>
                </CardContent>
                
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(constitution)}
                    disabled={downloading}
                    fullWidth
                  >
                    Download
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => handlePreview(constitution)}
                    fullWidth
                  >
                    Preview
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Constitution Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedConstitution?.title}
        </DialogTitle>
        <DialogContent>
          {selectedConstitution && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip 
                  label={selectedConstitution.category} 
                  color={getCategoryColor(selectedConstitution.category)}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Uploaded: {new Date(selectedConstitution.uploadedAt).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                {selectedConstitution.description || 'No description available.'}
              </Typography>
              
              <Box sx={{ 
                backgroundColor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  PDF Document
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Click download to access the full document
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              handleDownload(selectedConstitution);
              setPreviewOpen(false);
            }}
            disabled={downloading}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Guide */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <CategoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Constitution Categories Guide
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Chip label="Criminal" size="small" color="error" sx={{ mr: 1 }} />
                <Typography variant="body2">Criminal law and procedures</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Chip label="Civil" size="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">Civil law and disputes</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Chip label="Family" size="small" color="secondary" sx={{ mr: 1 }} />
        <Typography variant="body2">Family and marital law</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center">
                <Chip label="Corporate" size="small" color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">Business and corporate law</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ConstitutionAccess;