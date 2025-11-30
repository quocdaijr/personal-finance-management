import React, { useState, useEffect } from 'react';
import {
  Box,
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
  MenuItem,
  LinearProgress,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

import { PageLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import goalService from '../services/goalService';
import GoalForm from '../components/goals/GoalForm';
import ContributeDialog from '../components/goals/ContributeDialog';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '../utils/formatters';

interface Goal {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  category: string;
  icon: string;
  color: string;
  targetDate: string | null;
  startDate: string;
  isCompleted: boolean;
  progressPercent: number;
  remainingAmount: number;
  daysRemaining: number | null;
  priority: number;
}

interface GoalSummary {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  totalTargetAmount: number;
  totalSavedAmount: number;
  overallProgress: number;
}

const Goals: React.FC = () => {
  const { theme } = useTheme();
  const { preferences } = useUserPreferences();

  // State for data
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary>({
    totalGoals: 0,
    completedGoals: 0,
    inProgressGoals: 0,
    totalTargetAmount: 0,
    totalSavedAmount: 0,
    overallProgress: 0,
  });

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchGoalsData();
  }, []);

  const fetchGoalsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedGoals, fetchedSummary] = await Promise.all([
        goalService.getAll(),
        goalService.getSummary(),
      ]);
      setGoals(fetchedGoals || []);
      setSummary(fetchedSummary || {
        totalGoals: 0,
        completedGoals: 0,
        inProgressGoals: 0,
        totalTargetAmount: 0,
        totalSavedAmount: 0,
        overallProgress: 0,
      });
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, preferences.currency);
  };

  const formatDate = (date: Date | string | number) => {
    return formatDateUtil(date, preferences.dateFormat);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalFormOpen(true);
  };

  const handleDeleteDialogOpen = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;
    try {
      await goalService.delete(goalToDelete.id);
      setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
      setSnackbar({ open: true, message: 'Goal deleted successfully', severity: 'success' });
      fetchGoalsData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete goal', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleContribute = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributeDialogOpen(true);
  };

  const handleContributeSubmit = async (amount: number, description: string) => {
    if (!selectedGoal) return;
    try {
      await goalService.contribute(selectedGoal.id, amount, description);
      setSnackbar({ open: true, message: 'Contribution added successfully', severity: 'success' });
      fetchGoalsData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add contribution', severity: 'error' });
    } finally {
      setContributeDialogOpen(false);
      setSelectedGoal(null);
    }
  };

  const handleSaveGoal = async (goalData: any) => {
    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, goalData);
        setSnackbar({ open: true, message: 'Goal updated successfully', severity: 'success' });
      } else {
        await goalService.create(goalData);
        setSnackbar({ open: true, message: 'Goal created successfully', severity: 'success' });
      }
      setGoalFormOpen(false);
      fetchGoalsData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save goal', severity: 'error' });
    }
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'completed') return goal.isCompleted;
    if (filter === 'active') return !goal.isCompleted;
    return true;
  });

  const getPriorityColor = (priority: number) => {
    if (priority === 2) return 'error';
    if (priority === 1) return 'warning';
    return 'default';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 2) return 'High';
    if (priority === 1) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <PageLayout maxWidth="xl" showSearch={false} customTitle="Financial Goals">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="xl" showSearch={false} customTitle="Financial Goals">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchGoalsData}>
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="xl" showSearch={false} customTitle="Financial Goals">
      {/* Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddGoal}
          sx={{ borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Create Goal
        </Button>
      </Box>

      {/* Summary Cards */}
      <Paper sx={{ p: 3, mb: 4, background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total Goals</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{summary.totalGoals || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Completed</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {summary.completedGoals || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">In Progress</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {summary.inProgressGoals || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Target Total</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(summary.totalTargetAmount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total Saved</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatCurrency(summary.totalSavedAmount || 0)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Overall Progress</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {summary.overallProgress?.toFixed(1) || '0.0'}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {filteredGoals.length} Goal{filteredGoals.length !== 1 ? 's' : ''}
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value)} size="small">
            <MenuItem value="all">All Goals</MenuItem>
            <MenuItem value="active">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FlagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {goals.length === 0 ? 'No goals yet' : 'No goals match the filter'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {goals.length === 0 ? 'Create your first savings goal to start tracking your progress.' : 'Try changing the filter.'}
          </Typography>
          {goals.length === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddGoal}>
              Create Goal
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredGoals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {goal.isCompleted && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    size="small"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: goal.color || '#C8EE44',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.2rem',
                      }}
                    >
                      {goal.icon || '🎯'}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{goal.name}</Typography>
                      <Chip label={goal.category || 'General'} size="small" sx={{ mr: 1 }} />
                      <Chip label={getPriorityLabel(goal.priority)} size="small" color={getPriorityColor(goal.priority) as any} />
                    </Box>
                  </Box>
                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Progress</Typography>
                      <Typography variant="body2" fontWeight={600}>{goal.progressPercent?.toFixed(1) || '0.0'}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(goal.progressPercent || 0, 100)}
                      sx={{ height: 8, borderRadius: 4, backgroundColor: theme.border.primary }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Saved</Typography>
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        {formatCurrency(goal.currentAmount || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">Target</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(goal.targetAmount || 0)}
                      </Typography>
                    </Box>
                  </Box>
                  {goal.daysRemaining !== null && !goal.isCompleted && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, color: 'text.secondary' }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">
                        {goal.daysRemaining > 0 ? `${goal.daysRemaining} days remaining` : 'Due today'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  {!goal.isCompleted && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<TrendingUpIcon />}
                      onClick={() => handleContribute(goal)}
                    >
                      Contribute
                    </Button>
                  )}
                  <Box>
                    <IconButton size="small" onClick={() => handleEditGoal(goal)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteDialogOpen(goal)}><DeleteIcon /></IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Goal Form Dialog */}
      <GoalForm
        open={goalFormOpen}
        onClose={() => setGoalFormOpen(false)}
        onSave={handleSaveGoal}
        goal={editingGoal}
        isEditing={!!editingGoal}
      />

      {/* Contribute Dialog */}
      <ContributeDialog
        open={contributeDialogOpen}
        onClose={() => setContributeDialogOpen(false)}
        onSubmit={handleContributeSubmit}
        goal={selectedGoal}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{goalToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Goals;

