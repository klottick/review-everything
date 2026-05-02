import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography as Typ, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import { Add, Category as CategoryIcon } from '@mui/icons-material';
import { categoriesApi, itemsApi, usersApi } from '../api/client';
import { useUser } from '../context/UserContext';
import type { Category, Item } from '../types';

const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#F97316'];

export function Dashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserColor, setNewUserColor] = useState(COLORS[0]);
  const { users, refreshUsers } = useUser();

  const loadData = async () => {
    try {
      const [cats, its] = await Promise.all([
        categoriesApi.getAll(),
        itemsApi.getAll(),
      ]);
      setCategories(cats);
      setItems(its);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;
    await usersApi.create({ name: newUserName, color: newUserColor });
    await refreshUsers();
    setNewUserName('');
    setOpenUserDialog(false);
    loadData();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await categoriesApi.create({ name: newCategoryName, description: newCategoryDesc });
    setNewCategoryName('');
    setNewCategoryDesc('');
    setOpenCategoryDialog(false);
    loadData();
  };

  const getItemCount = (categoryId: number) => items.filter(i => i.category_id === categoryId).length;

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (users.length === 0) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typ variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Welcome to Review Everything</Typ>
            <Typ variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up your profile to get started
            </Typ>
            <Button variant="contained" onClick={() => setOpenUserDialog(true)} size="large">
              Create Profile
            </Button>
          </CardContent>
        </Card>
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
          <DialogTitle>Create Your Profile</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Your Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setNewUserColor(color)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: color,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: newUserColor === color ? '3px solid #333' : 'none',
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateUser} variant="contained" disabled={!newUserName.trim()}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typ variant="h4">Dashboard</Typ>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCategoryDialog(true)}>
          New Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typ variant="h6" color="text.secondary">No categories yet</Typ>
            <Typ variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create your first category to start reviewing
            </Typ>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenCategoryDialog(true)}>
              Create Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
              <Card
                component="button"
                onClick={() => navigate(`/category/${cat.id}`)}
                sx={{
                  width: '100%',
                  height: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typ variant="h6">{cat.name}</Typ>
                  </Box>
                  {cat.description && (
                    <Typ variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {cat.description}
                    </Typ>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typ variant="body2" color="text.secondary">
                      {getItemCount(cat.id)} items
                    </Typ>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}