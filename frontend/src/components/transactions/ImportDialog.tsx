import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Download,
  Description,
  Info,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import importService from '../../services/importService';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  total_rows: number;
  imported: number;
  skipped: number;
  errors: string[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const response = await importService.importTransactionsCSV(selectedFile);
      setResult(response.result);
      if (response.result.imported > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Import failed. Please check your file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await importService.downloadTemplate();
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('Please drop a CSV file');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Transactions</DialogTitle>
      <DialogContent>
        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Upload a CSV file with your transactions. Required columns: <strong>date, amount, type</strong>.
            Optional: description, category, account, tags.
          </Typography>
        </Alert>

        {/* Download Template */}
        <Button
          startIcon={<Download />}
          onClick={handleDownloadTemplate}
          sx={{ mb: 3 }}
          size="small"
        >
          Download Template
        </Button>

        {/* Drop Zone */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${theme.border.primary}`,
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            {selectedFile ? selectedFile.name : 'Drag & drop a CSV file here'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            or click to browse (max 5MB)
          </Typography>
        </Box>

        {/* Selected File Info */}
        {selectedFile && !result && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Description sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">{selectedFile.name}</Typography>
            <Chip label={`${(selectedFile.size / 1024).toFixed(1)} KB`} size="small" sx={{ ml: 1 }} />
          </Box>
        )}

        {/* Upload Progress */}
        {uploading && <LinearProgress sx={{ mt: 2 }} />}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Result */}
        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={result.imported > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
              Imported {result.imported} of {result.total_rows} transactions
              {result.skipped > 0 && ` (${result.skipped} skipped)`}
            </Alert>

            {result.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors ({result.errors.length}):
                </Typography>
                <List dense sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                  {result.errors.slice(0, 10).map((err, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={err} primaryTypographyProps={{ variant: 'caption' }} />
                    </ListItem>
                  ))}
                  {result.errors.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={`... and ${result.errors.length - 10} more errors`}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={<CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Import'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;

