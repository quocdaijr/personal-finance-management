import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle edit
  const handleEdit = () => {
    handleClose();
    onEdit(budget);
  };
  
  // Handle delete
  const handleDelete = () => {
    handleClose();
    onDelete(budget);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Calculate percentage spent
  const percentageSpent = budget.getPercentageSpent();
  
  // Get progress color based on percentage
  const getProgressColor = () => {
    if (percentageSpent >= 100) return 'error';
    if (percentageSpent >= 80) return 'warning';
    return 'primary';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {budget.name}
          </Typography>
          
          <IconButton
            aria-label="budget-menu"
            aria-controls="budget-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            id="budget-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'budget-menu-button',
            }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {budget.category}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Spent
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Budget
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" component="div">
            {formatCurrency(budget.spent)}
          </Typography>
          <Typography variant="h6" component="div">
            {formatCurrency(budget.amount)}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={Math.min(100, percentageSpent)} 
          color={getProgressColor()}
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            color={percentageSpent >= 100 ? 'error.main' : 'text.secondary'}
          >
            {percentageSpent}% used
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(budget.getRemainingAmount())} left
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Period: {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
