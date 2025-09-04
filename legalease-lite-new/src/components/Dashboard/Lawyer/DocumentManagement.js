import React, { useState, useEffect, useCallback } from 'react';
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
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { casesAPI } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';

function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [caseFilter, setCaseFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    caseId: '',
    file: null
  });

  const { callApi } = useApi();

  const loadAllDocuments = useCallback(async () => {
    try {
      const allDocuments = [];
      const casesResult = await callApi(casesAPI.getAll);
      if (!casesResult.success) return;

      for (const caseItem of casesResult.data.cases) {
        try {
          const docsResult = await callApi(casesAPI.getDocuments, caseItem._id);
          if (docsResult.success) {
            const caseDocuments = docsResult.data.documents?.map(doc => ({
              ...doc,
              caseTitle: caseItem.title,
              caseId: caseItem._id,
              caseNumber: caseItem.caseNumber,
              clientName: caseItem.clientId?.name || 'Unknown Client'
            })) || [];
            allDocuments.push(...caseDocuments);
          }
        } catch (error) {
          console.error(`Error loading documents for case ${caseItem._id}:`, error);
        }
      }

      setDocuments(allDocuments);
    } catch (error) {
      setError('Error loading documents');
    }
  }, [callApi]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const casesResult = await callApi(casesAPI.getAll);
      if (casesResult.success) setCases(casesResult.data.cases || []);

      await loadAllDocuments();
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [callApi, loadAllDocuments]);

  const filterDocuments = useCallback(() => {
    let filtered = documents;

    if (caseFilter !== 'all') filtered = filtered.filter(doc => doc.caseId === caseFilter);
    if (fileTypeFilter !== 'all') filtered = filtered.filter(doc => 
      doc.fileType?.includes(fileTypeFilter) || 
      (fileTypeFilter === 'other' && !['pdf', 'image', 'word'].some(type => doc.fileType?.includes(type)))
    );
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        doc.caseTitle.toLowerCase().includes(term) ||
        doc.clientName.toLowerCase().includes(term)
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, caseFilter, fileTypeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleUploadDocument = async () => {
    if (!uploadFormData.file || !uploadFormData.name || !uploadFormData.caseId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('document', uploadFormData.file);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);

      const result = await casesAPI.addDocument(uploadFormData.caseId, formData);
      
      if (result.status === 200 || result.status === 201) {
        await loadAllDocuments();
        setOpenUploadDialog(false);
        setUploadFormData({ name: '', description: '', caseId: '', file: null });
        setError('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading document');
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      await casesAPI.deleteDocument(selectedDocument.caseId, selectedDocument._id);
      await loadAllDocuments();
      setOpenDeleteDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting document');
    }
  };

  const handleDownload = (document) => {
    try {
      const link = document.createElement('a');
      link.href = document.url;
      link.setAttribute('download', document.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Error downloading file');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFormData({
        ...uploadFormData,
        file,
        name: uploadFormData.name || file.name
      });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('text')) return '📋';
    return '📁';
  };

  const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return '#f44336';
    if (fileType?.includes('word')) return '#1976d2';
    if (fileType?.includes('image')) return '#4caf50';
    if (fileType?.includes('text')) return '#ff9800';
    return '#9e9e9e';
  };

  const getFileTypeCategory = (fileType) => {
    if (fileType?.includes('pdf')) return 'PDF';
    if (fileType?.includes('word')) return 'Word';
    if (fileType?.includes('image')) return 'Image';
    if (fileType?.includes('text')) return 'Text';
    return 'Other';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDocuments = filteredDocuments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading documents...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Document Management
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/admin" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <DescriptionIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Documents
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadAllDocuments}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setOpenUploadDialog(true)}>
            Upload Document
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by name, case, client..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Case</InputLabel>
                <Select value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} label="Filter by Case">
                  <MenuItem value="all">All Cases</MenuItem>
                  {cases.map((caseItem) => (
                    <MenuItem key={caseItem._id} value={caseItem._id}>
                      {caseItem.title} {caseItem.caseNumber && `(#${caseItem.caseNumber})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                          </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)} label="Filter by Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="pdf">PDF Documents</MenuItem>
                  <MenuItem value="word">Word Documents</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="other">Other Files</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary" align="center">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Case</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDocuments.map((document) => (
                <TableRow key={document._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>
                        {getFileIcon(document.fileType)}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle2">{document.name}</Typography>
                        {document.description && (
                          <Typography variant="caption" color="textSecondary">
                            {document.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.caseTitle}</Typography>
                    {document.caseNumber && (
                      <Typography variant="caption" color="textSecondary">
                        #{document.caseNumber}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{document.clientName}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={getFileTypeCategory(document.fileType)}
                      size="small"
                      sx={{ backgroundColor: getFileTypeColor(document.fileType), color: 'white' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{formatFileSize(document.fileSize)}</Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{new Date(document.uploadedAt).toLocaleDateString()}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      by {document.uploadedBy?.name || 'Unknown'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => handleDownload(document)} color="primary">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDocument(document);
                            // Add a details dialog if needed
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDocument(document);
                            setOpenDeleteDialog(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      No documents found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {documents.length === 0 ? 'No documents have been uploaded yet.' : 'Try adjusting your search or filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredDocuments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            disabled={!uploadFormData.file || !uploadFormData.name || !uploadFormData.caseId}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the document "{selectedDocument?.name}"?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This action cannot be undone. The document will be permanently removed from the case.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteDocument} variant="contained" color="error">
            Delete Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for quick upload */}
      <Fab
        color="primary"
        aria-label="upload document"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpenUploadDialog(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default DocumentManagement;

