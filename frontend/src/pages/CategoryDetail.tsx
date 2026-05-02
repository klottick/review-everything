import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography as Typ, Card, CardContent, Grid, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tab, Tabs } from '@mui/material';
import { Add, Delete, ArrowBack, Google, Search, Star } from '@mui/icons-material';
import { categoriesApi, metricsApi, itemsApi, googleApi } from '../api/client';
import type { Category, Item, PlaceSearchResult } from '../types';

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMetricDialog, setOpenMetricDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [tab, setTab] = useState(0);
  
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricType, setNewMetricType] = useState('star');
  const [newMetricMin, setNewMetricMin] = useState<number | null>(null);
  const [newMetricMax, setNewMetricMax] = useState<number | null>(null);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemWhatIGot, setNewItemWhatIGot] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [googleUrlInput, setGoogleUrlInput] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [cat, its] = await Promise.all([
        categoriesApi.getOne(Number(id)),
        itemsApi.getAll(Number(id)),
      ]);
      setCategory(cat || null);
      setItems(its);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateMetric = async () => {
    if (!newMetricName.trim() || !id) return;
    
    let minValue = 1, maxValue = 5;
    if (newMetricType === 'range') {
      if (newMetricMin !== null) minValue = newMetricMin;
      if (newMetricMax !== null) maxValue = newMetricMax;
    }
    
    await metricsApi.create({
      category_id: Number(id),
      name: newMetricName,
      metric_type: newMetricType,
      min_value: minValue,
      max_value: maxValue,
    });
    setNewMetricName('');
    setNewMetricType('star');
    setNewMetricMin(null);
    setNewMetricMax(null);
    setOpenMetricDialog(false);
    loadData();
  };

  const handleSearchGoogle = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await googleApi.search(searchQuery);
      setSearchResults(result.results);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setSearching(false);
    }
  };

  const handleGoogleUrlSubmit = async () => {
    if (!googleUrlInput.trim()) return;
    setSearching(true);
    try {
      const place = await googleApi.getFromUrl(googleUrlInput);
      setSelectedPlace(place);
    } catch (e) {
      console.error('Failed to get place', e);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim() || !id) return;
    await itemsApi.create({
      category_id: Number(id),
      name: newItemName,
      what_i_got: newItemWhatIGot || undefined,
      external_id: selectedPlace?.place_id || undefined,
      reference: selectedPlace?.reference || undefined,
      address: selectedPlace?.address || undefined,
      google_rating: selectedPlace?.rating || undefined,
      url: selectedPlace?.url || undefined,
    });
    setNewItemName('');
    setNewItemWhatIGot('');
    setSelectedPlace(null);
    setSearchResults([]);
    setGoogleUrlInput('');
    setOpenItemDialog(false);
    loadData();
  };

  const handleDeleteMetric = async (metricId: number) => {
    await metricsApi.delete(metricId);
    loadData();
  };

  const handleDeleteItem = async (itemId: number) => {
    await itemsApi.delete(itemId);
    loadData();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!category) {
    return <Typ>Category not found</Typ>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typ variant="h4" sx={{ flexGrow: 1 }}>{category.name}</Typ>
        <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenMetricDialog(true)} sx={{ mr: 1 }}>
          Add Metric
        </Button>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenItemDialog(true)}>
          Add Item
        </Button>
      </Box>

      {category.description && (
        <Typ variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {category.description}
        </Typ>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Items" />
        <Tab label="Metrics" />
      </Tabs>

      {tab === 0 && (
        <>
          {items.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typ variant="h6" color="text.secondary">No items yet</Typ>
                <Typ variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your first item to start reviewing
                </Typ>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenItemDialog(true)}>
                  Add Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Card}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>What I Got</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Avg Score</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typ 
                          component="a"
                          onClick={() => navigate(`/item/${item.id}`)}
                          sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                          {item.name}
                        </Typ>
                      </TableCell>
                      <TableCell>{item.what_i_got || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>{item.address || '-'}</TableCell>
                      <TableCell>
                        {item.google_rating ? (
                          <Chip icon={<Star sx={{ fontSize: 14 }} />} label={item.google_rating} size="small" />
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                        {item.url ? (
                          <IconButton size="small" component="a" href={item.url} target="_blank" onClick={(e) => e.stopPropagation()}>
                            <Google />
                          </IconButton>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {item.average_scores ? (
                          <Typ variant="body2">
                            {(Object.values(item.average_scores).reduce((a, b) => a + b, 0) / Object.keys(item.average_scores).length).toFixed(1)}
                          </Typ>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleDeleteItem(item.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          {category.metrics.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typ variant="body2" color="text.secondary">No metrics defined yet</Typ>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpenMetricDialog(true)}>
                    Add Metric
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            category.metrics.map((metric) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={metric.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typ sx={{ fontWeight: 600 }}>{metric.name}</Typ>
                        <Typ variant="body2" color="text.secondary">
                          {metric.metric_type === 'range' ? 'Range' : `${metric.metric_type} (${metric.min_value}-${metric.max_value})`}
                        </Typ>
                        {metric.options && (
                          <Typ variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Options: {Object.values(metric.options).join(', ')}
                          </Typ>
                        )}
                      </Box>
                      <IconButton onClick={() => handleDeleteMetric(metric.id)}>
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Metric Dialog */}
      <Dialog open={openMetricDialog} onClose={() => setOpenMetricDialog(false)}>
        <DialogTitle>Add Metric</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Metric Name"
            value={newMetricName}
            onChange={(e) => setNewMetricName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typ variant="body2" sx={{ mb: 1 }}>Type</Typ>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['star', 'boolean', 'number', 'range'].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => setNewMetricType(type)}
                  color={newMetricType === type ? 'primary' : 'default'}
                  variant={newMetricType === type ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
          {newMetricType === 'range' && (
            <>
              <TextField
                fullWidth
                label="Min Value"
                type="number"
                value={newMetricMin ?? ''}
                onChange={(e) => setNewMetricMin(Number(e.target.value))}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="Max Value"
                type="number"
                value={newMetricMax ?? ''}
                onChange={(e) => setNewMetricMax(Number(e.target.value))}
                helperText="e.g., 10-20 for $10-$20 range"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMetricDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateMetric} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Item to {category.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typ variant="body2" sx={{ mb: 1 }}>Paste Google Maps Link</Typ>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="https://www.google.com/maps/place/..."
                value={googleUrlInput}
                onChange={(e) => setGoogleUrlInput(e.target.value)}
              />
              <Button onClick={handleGoogleUrlSubmit} variant="outlined" disabled={searching}>
                <Search />
              </Button>
            </Box>
          </Box>
          
          <Typ variant="body2" sx={{ mb: 1 }}>Or Search</Typ>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for a place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchGoogle()}
            />
            <Button onClick={handleSearchGoogle} variant="outlined" disabled={searching}>
              <Search />
            </Button>
          </Box>
          
          {searching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress /></Box>
          ) : searchResults.length > 0 ? (
            <Box sx={{ maxHeight: 150, overflow: 'auto', mb: 2 }}>
              {searchResults.map((place) => (
                <Box
                  key={place.place_id}
                  onClick={() => { setSelectedPlace(place); setGoogleUrlInput(place.url || ''); }}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedPlace?.place_id === place.place_id ? 'primary.main' : '#e0e0e0',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <Typ sx={{ fontWeight: 500 }}>{place.name}</Typ>
                  <Typ variant="body2" color="text.secondary">{place.address}</Typ>
                </Box>
              ))}
            </Box>
          ) : null}

          <TextField
            fullWidth
            label="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="What I Got / Ordered"
            value={newItemWhatIGot}
            onChange={(e) => setNewItemWhatIGot(e.target.value)}
            placeholder="e.g., Burger and fries, Pad Thai, etc."
            helperText={selectedPlace ? `Selected: ${selectedPlace.name}` : "Or enter manually"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateItem} variant="contained" disabled={!newItemName.trim()}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}