import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';
import { useUIStore } from '../../store/uiStore';

const Toast: React.FC = () => {
  const { toast, hideToast } = useUIStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideToast();
  };

  if (!toast) {
    return null;
  }

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={toast.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;