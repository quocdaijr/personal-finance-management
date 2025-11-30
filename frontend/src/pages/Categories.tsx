import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { PageLayout } from '../components/layout';
import { useTheme } from '../contexts/ThemeContext';
import categoryService from '../services/categoryService';

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  is_system: boolean;
  children?: Category[];
}

const ICONS = ['💰', '💵', '💳', '🏠', '🚗', '🍔', '🛍️', '🎬', '📱', '🏥', '📚', '✈️', '💅', '🎁', '💻', '📈', '🎵', '⚽', '🐕', '👶'];
const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6', '#84CC16', '#F472B6'];

const Categories: React.FC = () => {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'expense', icon: '📝', color: '#6B7280' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use default categories on error
      setCategories([
        { id: 1, name: 'Salary', type: 'income', icon: '💰', color: '#10B981', is_system: true },
        { id: 2, name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#F59E0B', is_system: true },
        { id: 3, name: 'Transportation', type: 'expense', icon: '🚗', color: '#3B82F6', is_system: true },
        { id: 4, name: 'Shopping', type: 'expense', icon: '🛍️', color: '#EC4899', is_system: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, type: category.type, icon: category.icon, color: category.color });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', type: tabValue === 0 ? 'expense' : 'income', icon: '📝', color: '#6B7280' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        await categoryService.create(formData);
        setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || 'Failed to save category', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      setSnackbar({ open: true, message: 'Category deleted', severity: 'success' });
      fetchCategories();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.message || 'Failed to delete category', severity: 'error' });
    }
  };

  const filteredCategories = categories.filter(cat => 
    tabValue === 0 ? cat.type === 'expense' || cat.type === 'both' : cat.type === 'income' || cat.type === 'both'
  );

  if (loading) {
    return (
      <PageLayout maxWidth="lg" showSearch={false} customTitle="Categories">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="lg" showSearch={false} customTitle="Categories">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Manage Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Category
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab icon={<TrendingDown />} label="Expense Categories" iconPosition="start" />
        <Tab icon={<TrendingUp />} label="Income Categories" iconPosition="start" />
      </Tabs>

      {/* Categories Grid */}
      <Grid container spacing={2}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card sx={{ background: theme.card.background, border: `1px solid ${theme.card.border}` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      backgroundColor: category.color + '20',
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>{category.name}</Typography>
                    {category.is_system && (
                      <Chip label="System" size="small" sx={{ mt: 0.5, height: 20, fontSize: 10 }} />
                    )}
                  </Box>
                </Box>
                {!category.is_system && (
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(category.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredCategories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">No categories found</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mt: 2 }}>
            Create your first category
          </Button>
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            disabled={editingCategory?.is_system}
          />

          <FormControl fullWidth margin="normal" disabled={editingCategory?.is_system}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Icon</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ICONS.map((icon) => (
              <Box
                key={icon}
                onClick={() => setFormData({ ...formData, icon })}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 20,
                  border: formData.icon === icon ? `2px solid ${theme.text.primary}` : `1px solid ${theme.border.primary}`,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                {icon}
              </Box>
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Color</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: formData.color === color ? '3px solid white' : 'none',
                  boxShadow: formData.color === color ? `0 0 0 2px ${color}` : 'none',
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name}>
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default Categories;

