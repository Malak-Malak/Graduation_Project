import React from 'react';
import { Chip, useTheme } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';

const StatusBadge = ({ status, size = 'small', ...props }) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
      case 'success':
      case 'on track':
        return {
          color: 'success',
          icon: <SuccessIcon />,
          label: status,
        };
      case 'pending':
      case 'in progress':
      case 'under review':
        return {
          color: 'warning',
          icon: <PendingIcon />,
          label: status,
        };
      case 'rejected':
      case 'failed':
      case 'behind':
      case 'at risk':
        return {
          color: 'error',
          icon: <ErrorIcon />,
          label: status,
        };
      case 'info':
      case 'draft':
        return {
          color: 'info',
          icon: <InfoIcon />,
          label: status,
        };
      default:
        return {
          color: 'default',
          icon: null,
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      color={config.color}
      sx={{
        borderRadius: 1.5,
        fontWeight: 500,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 16 : 20,
        },
      }}
      {...props}
    />
  );
};

export default StatusBadge;