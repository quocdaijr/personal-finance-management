import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  Warning,
  Flag,
  Repeat,
  EmojiEvents,
  Info,
  CheckCircle,
  Delete,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  action_url: string;
  created_at: string;
}

const NotificationCenter: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifs, summary] = await Promise.all([
        notificationService.getUnread().catch(() => []),
        notificationService.getSummary().catch(() => ({ unread_count: 0 })),
      ]);
      setNotifications(notifs || []);
      setUnreadCount(summary?.unread_count || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    await notificationService.markAsRead(notification.id).catch(() => {});
    // Navigate if action URL exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    handleClose();
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await notificationService.markAllAsRead().catch(() => {});
    setLoading(false);
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_alert': return <Warning sx={{ color: 'warning.main' }} />;
      case 'goal_reminder': return <Flag sx={{ color: 'info.main' }} />;
      case 'recurring_due': return <Repeat sx={{ color: 'primary.main' }} />;
      case 'achievement': return <EmojiEvents sx={{ color: 'success.main' }} />;
      default: return <Info sx={{ color: 'text.secondary' }} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: theme.text.primary }}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? (
            <NotificationsActive sx={{ color: '#C8EE44' }} />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            background: theme.card.background,
            border: `1px solid ${theme.card.border}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} disabled={loading}>
              {loading ? <CircularProgress size={16} /> : 'Mark all read'}
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">All caught up!</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { background: theme.background.secondary },
                  borderBottom: `1px solid ${theme.border.primary}`,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {notification.title}
                      </Typography>
                      {notification.priority === 'high' && (
                        <Chip label="!" color="error" size="small" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {notification.message.substring(0, 80)}...
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatTime(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;

