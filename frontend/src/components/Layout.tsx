import { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from '@mui/material';
import { Add, SwapHoriz, DarkMode, LightMode } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useThemeMode } from '../context/ThemeContext';
import { usersApi } from '../api/client';

const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981', '#F97316'];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser, users, setCurrentUser, refreshUsers } = useUser();
  const { mode, toggleTheme } = useThemeMode();
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserColor, setNewUserColor] = useState(COLORS[0]);

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;
    await usersApi.create({ name: newUserName, color: newUserColor });
    await refreshUsers();
    setNewUserName('');
    setAddUserOpen(false);
    setSwitchDialogOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Review Everything
          </Typography>
          <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Button 
            startIcon={<SwapHoriz />} 
            onClick={() => setSwitchDialogOpen(true)}
          >
            {currentUser ? currentUser.name : 'Select'}
          </Button>
          {currentUser && (
            <Avatar sx={{ bgcolor: currentUser.color, width: 36, height: 36, fontSize: 16, ml: 1 }}>
              {currentUser.name[0].toUpperCase()}
            </Avatar>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        {children}
      </Box>

      {/* User Switch Dialog */}
      <Dialog open={switchDialogOpen} onClose={() => setSwitchDialogOpen(false)}>
        <DialogTitle>Switch Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {users.map((user) => (
              <Box
                key={user.id}
                onClick={() => { setCurrentUser(user); setSwitchDialogOpen(false); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: currentUser?.id === user.id ? 'primary.main' : 'transparent',
                  border: '1px solid',
                  borderColor: currentUser?.id === user.id ? 'primary.main' : 'divider',
                  opacity: currentUser?.id === user.id ? 1 : 0.8,
                }}
              >
                <Avatar sx={{ bgcolor: user.color, width: 40, height: 40 }}>
                  {user.name[0].toUpperCase()}
                </Avatar>
                <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSwitchDialogOpen(false); setAddUserOpen(true); }} startIcon={<Add />}>
            Add New
          </Button>
          <Button onClick={() => setSwitchDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)}>
        <DialogTitle>Add Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  border: newUserColor === color ? '3px solid white' : 'none',
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" disabled={!newUserName.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}