import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography as Typ, Card, CardContent, Grid, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Rating, Slider, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { Add, ArrowBack, Star, Google } from '@mui/icons-material';
import { itemsApi, reviewsApi, metricsApi, usersApi } from '../api/client';
import { useUser } from '../context/UserContext';
import type { Item, Metric, Review, User } from '../types';

const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#F97316'];

function getUserDisplay(users: User[], userId: number) {
  const user = users.find(u => u.id === userId);
  return { color: user?.color || COLORS[userId % COLORS.length], name: user?.name || `User ${userId}` };
}

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [item, setItem] = useState<Item | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [userAlreadyReviewed, setUserAlreadyReviewed] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [itemData, metricsData, reviewsData, usersData] = await Promise.all([
        itemsApi.getOne(Number(id)),
        metricsApi.getByCategory(Number(id)),
        reviewsApi.getAll(Number(id)),
        usersApi.getAll(),
      ]);
      setItem(itemData);
      setMetrics(metricsData);
      setReviews(reviewsData);
      setUsers(usersData);
      if (currentUser) {
        const userReview = reviewsData.find((r: Review) => r.user_id === currentUser.id);
        if (userReview) {
          setUserAlreadyReviewed(true);
          setScores(userReview.scores as Record<string, number>);
          setNotes(userReview.notes || '');
        }
      }
    } catch (e) { console.error('Failed to load', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id, currentUser]);

  const handleScoreChange = (mid: string, v: number) => setScores(prev => ({ ...prev, [mid]: v }));

  const handleSubmit = async () => {
    if (!id || !currentUser) return;
    await reviewsApi.create({ item_id: Number(id), user_id: currentUser.id, scores, notes: notes || undefined });
    setOpenReviewDialog(false);
    loadData();
  };

  const getInput = (m: Metric) => {
    const val = scores[String(m.id)] || m.min_value;
    if (m.metric_type === 'star') return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Rating value={val as number} onChange={(_, v) => v && handleScoreChange(String(m.id), v)} size="large" /><Typ>{val}</Typ></Box>;
    if (m.metric_type === 'boolean') return <RadioGroup row value={val} onChange={(e) => handleScoreChange(String(m.id), Number(e.target.value))}><FormControlLabel value={1} control={<Radio />} label="Yes" /><FormControlLabel value={0} control={<Radio />} label="No" /></RadioGroup>;
    return (
      <Box sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typ variant="caption">{m.name}</Typ>
          <Typ variant="caption">{m.min_value} - {m.max_value}</Typ>
        </Box>
        <Slider value={val as number} onChange={(_, v) => handleScoreChange(String(m.id), v as number)} min={m.min_value} max={m.max_value} valueLabelDisplay="auto" />
      </Box>
    );
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!item) return <Typ>Not found</Typ>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}><ArrowBack /></IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typ variant="h4" sx={{ fontWeight: 700 }}>{item.name}</Typ>
          {item.address && <Typ color="text.secondary">{item.address}</Typ>}
        </Box>
        {item.url && <IconButton component="a" href={item.url} target="_blank" sx={{ color: 'primary.main' }}><Google /></IconButton>}
      </Box>
      
      {item.what_i_got && <Card sx={{ mb: 2 }}><CardContent><Typ variant="subtitle2" color="text.secondary">What I Got / Ordered</Typ><Typ variant="h6">{item.what_i_got}</Typ></CardContent></Card>}
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {item.google_rating && <Chip icon={<Star />} label={`Google: ${item.google_rating}`} color="primary" variant="outlined" />}
        {item.address && <Chip icon={<Google />} label="Has Address" variant="outlined" />}
        <Chip label={`${reviews.length} review${reviews.length !== 1 ? 's' : ''}`} variant="outlined" />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenReviewDialog(true)} size="large">
          {userAlreadyReviewed ? 'Edit My Review' : 'Add My Review'}
        </Button>
      </Box>
      {item.average_scores && Object.keys(item.average_scores).length > 0 && (
        <Card sx={{ mb: 3 }}><CardContent><Typ variant="h6" sx={{ mb: 2 }}>Averages</Typ><Grid container spacing={2}>{metrics.map(m => <Grid size={{ xs: 6, md: 4 }} key={m.id}><Typ color="text.secondary">{m.name}</Typ><Typ variant="h5">{item.average_scores?.[String(m.id)]?.toFixed(1) || '-'}</Typ></Grid>)}</Grid></CardContent></Card>
      )}
      <Card><CardContent><Typ variant="h6" sx={{ mb: 2 }}>Reviews ({reviews.length})</Typ>
      {reviews.length === 0 ? <Typ color="text.secondary">No reviews</Typ> : reviews.map(r => {
        const { color, name } = getUserDisplay(users, r.user_id);
        return <Box key={r.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: color }}><Typ sx={{ fontSize: 12, textAlign: 'center', lineHeight: 24, color: 'white' }}>{name[0].toUpperCase()}</Typ></Box>
            <Typ sx={{ fontWeight: 500 }}>{name}</Typ>
          </Box>
          {Object.entries(r.scores).map(([mid, val]) => { const m = metrics.find(x => x.id === Number(mid)); if (!m) return null; return <Box key={mid} sx={{ display: 'flex', justifyContent: 'space-between' }}><Typ color="text.secondary">{m.name}</Typ><Typ>{String(val)}</Typ></Box>; })}
          {r.notes && <Typ sx={{ mt: 1 }}>{r.notes}</Typ>}
        </Box>;
      })}
      </CardContent></Card>
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{userAlreadyReviewed ? 'Edit' : 'Add'} Review</DialogTitle>
        <DialogContent>
          {metrics.map(m => <FormControl key={m.id} fullWidth sx={{ mb: 3 }}><FormLabel>{m.name}</FormLabel>{getInput(m)}</FormControl>)}
          <TextField fullWidth label="Notes" multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{userAlreadyReviewed ? 'Update' : 'Submit'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}