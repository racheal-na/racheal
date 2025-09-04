import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { casesAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';

function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedCase, setSelectedCase] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    caseId: '',
    file: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const { callApi, loading, error, reset } = useApi();

  useEffect(() => {
    loadMyCasesAndDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedCase, searchTerm]);

  const loadMyCasesAndDocuments = async () => {
    reset();
    const result = await callApi(casesAPI.getAll);
    
    if (result.success) {
      const userCases = result.data.cases || [];
      setCases(userCases);
      
      // Load documents from each case
      const allDocuments = [];
      for (const caseItem of userCases) {
        try {
          const docsResult = await callApi(casesAPI.getDocuments, caseItem._id);
          if (docsResult.success) {
            const caseDocuments = docsResult.data.documents?.map(doc => ({
              ...doc,
              caseTitle: caseItem.title,
              caseId: caseItem._id,
              caseNumber: caseItem.caseNumber
            })) || [];
            allDocuments.push(...caseDocuments);
          }
        } catch (error) {
          console.error(`Error loading documents for case ${caseItem._id}:`, error);
        }
      }
      
      setDocuments(allDocuments);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by selected case
    if (selectedCase !== 'all') {
      filtered = filtered.filter(doc => doc.caseId === selectedCase);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.caseTitle.toLowerCase().includes(term)
      );
    }

    setFilteredDocuments(filtered);
  };

  const handleUploadDocument = async () => {
    if (!uploadFormData.file || !uploadFormData.name || !uploadFormData.caseId) {
      return;
    }

    try {
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('document', uploadFormData.file);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);
      formData.append('caseId', uploadFormData.caseId);

      const result = await casesAPI.addDocument(uploadFormData.caseId, formData);
      
      if (result.status === 200 || result.status === 201) {
        // Reload documents after successful upload
        await loadMyCasesAndDocuments();
        setOpenUploadDialog(false);
        setUploadFormData({
          name: '',
          description: '',
          caseId: '',
          file: null
        });
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };
  const handleDownload = async (document) => {
    try {
      // Create a temporary link for download
      const link = document.createElement('a');
      link.href = document.url;
      link.setAttribute('download', document.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFormData({
        ...uploadFormData,
        file: file,
        name: uploadFormData.name || file.name
      });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('image')) return '🖼️';
    return '📁';
  };

  const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return '#f44336';
    if (fileType?.includes('word')) return '#1976d2';
    if (fileType?.includes('image')) return '#4caf50';
    return '#9e9e9e';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupDocumentsByCase = () => {
    const grouped = {};
    filteredDocuments.forEach(doc => {
      if (!grouped[doc.caseId]) {
        grouped[doc.caseId] = {
          caseTitle: doc.caseTitle,
          caseNumber: doc.caseNumber,
          documents: []
        };
      }
      grouped[doc.caseId].documents.push(doc);
    });
    return grouped;
  };

  if (loading && documents.length === 0) {
    return <LinearProgress />;
  }

  const groupedDocuments = groupDocumentsByCase();

  return (
    <Box>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Documents
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/client" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <FolderIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Documents
            </Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setOpenUploadDialog(true)}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={reset}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Case</InputLabel>
                <Select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  label="Filter by Case"
                >
                  <MenuItem value="all">All Cases</MenuItem>
                  {cases.map((caseItem) => (
                    <MenuItem key={caseItem._id} value={caseItem._id}>
                      {caseItem.title} {caseItem.caseNumber && `(#${caseItem.caseNumber})`}
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or case..."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredDocuments.length} of {documents.length} documents
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {documents.length === 0 
                ? "You don't have any documents yet. Upload your first document to get started."
                : "No documents match your search criteria. Try adjusting your filters."
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {Object.entries(groupedDocuments).map(([caseId, { caseTitle, caseNumber, documents: caseDocs }]) => (
            <Box key={caseId} sx={{ mb: 4 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <FolderIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">
                  {caseTitle}
                </Typography>
                {caseNumber && (
                  <Chip 
                    label={`#${caseNumber}`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 2 }}
                  />
                )}
                <Chip 
                  label={`${caseDocs.length} document${caseDocs.length !== 1 ? 's' : ''}`} 
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Grid container spacing={3}>
                {caseDocs.map((document, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" alignItems="flex-start" mb={2}>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              mr: 2,
                              color: getFileTypeColor(document.fileType)
                            }}
                          >
                            {getFileIcon(document.fileType)}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              noWrap 
                              title={document.name}
                              sx={{ mb: 0.5 }}
                            >
                              {document.name}
                            </Typography>
                            {document.description && (
                              <Typography 
                                variant="body2" 
                                color="textSecondary" 
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {document.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" display="block" color="textSecondary">
                            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            By: {document.uploadedBy?.name || 'Your lawyer'}
                          </Typography>
                          {document.fileSize && (
                            <Typography variant="caption" display="block" color="textSecondary">
                              Size: {formatFileSize(document.fileSize)}
                            </Typography>
                          )}
                          {document.fileType && (
                            <Chip 
                              label={document.fileType.split('/')[1] || document.fileType} 
                              size="small" 
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      </CardContent>
                      
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(document)}
                          fullWidth
                        >
                          Download
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Case *</InputLabel>
            <Select
              value={uploadFormData.caseId}
              onChange={(e) => setUploadFormData({ ...uploadFormData, caseId: e.target.value })}
              label="Select Case *"
            >
              {cases.map((caseItem) => (
                <MenuItem key={caseItem._id} value={caseItem._id}>
                  {caseItem.title} {caseItem.caseNumber && `(#${caseItem.caseNumber})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            label="Document Name *"
            fullWidth
            value={uploadFormData.name}
            onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
          />

          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={uploadFormData.description}
            onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
            placeholder="Brief description of the document..."
          />
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.rtf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="document-upload-file"
            />
            <label htmlFor="document-upload-file">
              <Button variant="outlined" component="span" startIcon={<UploadIcon />} fullWidth>
                Select File
              </Button>
            </label>
            {uploadFormData.file && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Selected:</strong> {uploadFormData.file.name}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Size: {formatFileSize(uploadFormData.file.size)}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Type: {uploadFormData.file.type}
                </Typography>
              </Box>
            )}
          </Box>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" align="center">
                Uploading: {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadDocument} 
            variant="contained" 
            disabled={!uploadFormData.file || !uploadFormData.name || !uploadFormData.caseId}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyDocuments;  