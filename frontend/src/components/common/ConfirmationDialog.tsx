import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  Close,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { ConfirmationDialogProps } from '../../types/transaction';

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning',
}) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <Error sx={{ color: '#E53935', fontSize: 48 }} />;
      case 'warning':
        return <Warning sx={{ color: '#FBC02D', fontSize: 48 }} />;
      case 'info':
        return <Info sx={{ color: '#2196F3', fontSize: 48 }} />;
      default:
        return <Warning sx={{ color: '#FBC02D', fontSize: 48 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.card.background,
          border: `1px solid ${theme.card.border}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onCancel}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 2,
          }}
        >
          {getIcon()}
          <Typography
            variant="body1"
            sx={{
              color: theme.text.primary,
              mt: 2,
              lineHeight: 1.6,
            }}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 2,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: theme.border.primary,
            color: theme.text.secondary,
            '&:hover': {
              borderColor: theme.text.secondary,
              backgroundColor: theme.background.secondary,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
          sx={{
            fontWeight: 600,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
