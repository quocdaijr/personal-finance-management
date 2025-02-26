import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  IconButton,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../contexts/ThemeContext';

const TransactionList = ({ transactions, onEdit, onDelete, title = "Recent Transactions" }) => {
  const { theme } = useTheme();

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (description) => {
    return description
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card sx={{
      background: theme.background.paper,
      border: `1px solid ${theme.border.primary}`,
      borderRadius: 3,
      boxShadow: theme.card.shadow
    }}>
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          gutterBottom
          sx={{
            color: theme.text.primary,
            fontWeight: 600,
            mb: 3
          }}
        >
          {title}
        </Typography>

        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No transactions found.
          </Typography>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                {index > 0 && <Divider component="li" sx={{ borderColor: theme.border.primary }} />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2.5,
                    px: 0,
                    '&:hover': {
                      backgroundColor: theme.background.secondary,
                      borderRadius: 2,
                      mx: -1,
                      px: 1
                    }
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      backgroundColor: transaction.type === 'income' ? '#4CAF50' : '#E53935',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getInitials(transaction.description)}
                  </Avatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography
                            component="span"
                            variant="body1"
                            sx={{
                              color: theme.text.primary,
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}
                          >
                            {transaction.description}
                          </Typography>
                        </Box>
                        <Typography
                          component="span"
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: transaction.type === 'income' ? '#4CAF50' : '#E53935',
                            fontSize: '1.1rem'
                          }}
                        >
                          {transaction.formattedAmount()}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Box component="div" sx={{ mt: 1.5 }}>
                        <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: theme.text.secondary,
                              fontSize: '0.875rem'
                            }}
                          >
                            {formatDate(transaction.date)}
                          </Typography>
                          <Chip
                            label={transaction.category}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem',
                              backgroundColor: theme.background.secondary,
                              color: theme.text.secondary,
                              border: `1px solid ${theme.border.primary}`,
                              '& .MuiChip-label': {
                                px: 1.5
                              }
                            }}
                          />
                        </Box>
                        {transaction.tags && transaction.tags.length > 0 && (
                          <Box component="div" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {transaction.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        size="small"
                        onClick={() => onEdit && onEdit(transaction)}
                        sx={{
                          color: theme.text.secondary,
                          '&:hover': {
                            backgroundColor: theme.background.secondary,
                            color: theme.text.primary
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="small"
                        onClick={() => onDelete && onDelete(transaction)}
                        sx={{
                          color: theme.text.secondary,
                          '&:hover': {
                            backgroundColor: '#E53935',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
