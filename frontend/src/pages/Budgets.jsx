import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Import components
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetForm from '../components/budgets/BudgetForm';
import { PageLayout } from '../components/layout';

// Import services
import budgetService from '../services/budgetService';

// Import contexts
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

// Import utilities
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '../utils/formatters';

const Budgets = () => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  // State for data
  const [budgets, setBudgets] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallProgress: 0,
    totalBudgets: 0,
    budgetsNearLimit: 0,
    budgetsOverLimit: 0
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filter, setFilter] = useState('all');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchBudgetsData();
  }, []);
  
  // Fetch budgets data
  const fetchBudgetsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data in parallel
      const [fetchedBudgets, summary] = await Promise.all([
        budgetService.getAll(),
        budgetService.getSummary()
      ]);
      
      // Update state with fetched data
      setBudgets(fetchedBudgets);
      setBudgetSummary(summary);
    } catch (err) {
      console.error('Error fetching budgets data:', err);
      setError('Failed to load budgets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency using user preferences
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  // Format date using user preferences
  const formatDate = (date) => {
    return formatDateUtil(date, preferences.dateFormat);
  };
  
  // Handle budget form open
  const handleAddBudget = () => {
    setEditingBudget(null);
    setBudgetFormOpen(true);
  };
  
  // Handle budget edit
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetFormOpen(true);
  };
  
  // Handle budget delete dialog open
  const handleDeleteDialogOpen = (budget) => {
    setBudgetToDelete(budget);
    setDeleteDialogOpen(true);
  };
  
  // Handle budget delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setBudgetToDelete(null);
  };
  
  // Handle budget delete confirmation
  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    
    try {
      await budgetService.delete(budgetToDelete.id);
      
      // Update budgets list
      setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Budget deleted successfully',
        severity: 'success'
      });
      
      // Refresh budgets data to update summary
      fetchBudgetsData();
    } catch (err) {
      console.error('Error deleting budget:', err);
      
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to delete budget',
        severity: 'error'
      });
    } finally {
      handleDeleteDialogClose();
    }
  };
  
  // Handle budget save
  const handleSaveBudget = async (budgetData) => {
    try {
      if (editingBudget) {
        // Update existing budget
        const updatedBudget = await budgetService.update(editingBudget.id, budgetData);
        
        // Update budgets list
        setBudgets(prev => prev.map(b => 
          b.id === editingBudget.id ? updatedBudget : b
        ));
        
        setSnackbar({
          open: true,
          message: 'Budget updated successfully',
          severity: 'success'
        });
      } else {
        // Create new budget
        const newBudget = await budgetService.create(budgetData);
        
        // Add to budgets list
        setBudgets(prev => [...prev, newBudget]);
        
        setSnackbar({
          open: true,
          message: 'Budget created successfully',
          severity: 'success'
        });
      }
      
      // Close form
      setBudgetFormOpen(false);
      
      // Refresh budgets data to update summary
      fetchBudgetsData();
    } catch (err) {
      console.error('Error saving budget:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save budget',
        severity: 'error'
      });
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  // Filter budgets based on current filter
  const filteredBudgets = budgets.filter(budget => {
    const percentSpent = budget.getPercentageSpent();
    
    switch (filter) {
      case 'over':
        return percentSpent >= 100;
      case 'near':
        return percentSpent >= 80 && percentSpent < 100;
      case 'under':
        return percentSpent < 80;
      default:
        return true;
    }
  });

  // Show loading state
  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout maxWidth="xl" showSearch={false}>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={fetchBudgetsData}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      maxWidth="xl"
      showSearch={false}
    >
      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBudget}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Create Budget
        </Button>
      </Box>
      
      {/* Budget summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Budgeted
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(budgetSummary.totalBudgeted)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Spent
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(budgetSummary.totalSpent)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Remaining
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: budgetSummary.totalRemaining >= 0 ? 'success.main' : 'error.main'
              }}
            >
              {formatCurrency(budgetSummary.totalRemaining)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {budgetSummary.overallProgress}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredBudgets.length} Budget{filteredBudgets.length !== 1 ? 's' : ''}
        </Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-label">Filter</InputLabel>
          <Select
            labelId="filter-label"
            id="filter"
            value={filter}
            label="Filter"
            onChange={handleFilterChange}
            size="small"
          >
            <MenuItem value="all">All Budgets</MenuItem>
            <MenuItem value="over">Over Budget</MenuItem>
            <MenuItem value="near">Near Limit (80%+)</MenuItem>
            <MenuItem value="under">Under Budget</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Budgets grid */}
      {budgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No budgets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first budget to start tracking your spending.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ mt: 2 }} 
            onClick={handleAddBudget}
          >
            Create Budget
          </Button>
        </Paper>
      ) : filteredBudgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No budgets match the current filter
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try changing the filter to see more budgets.
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => setFilter('all')}
          >
            Show All Budgets
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBudgets.map(budget => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <BudgetCard 
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteDialogOpen}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Budget form dialog */}
      <BudgetForm 
        open={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        onSave={handleSaveBudget}
        budget={editingBudget}
        isEditing={!!editingBudget}
      />
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Budget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the budget "{budgetToDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Budgets;
