import * as React from 'react';
import { Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ImportContactsOutlinedIcon from '@mui/icons-material/ImportContactsOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Menu from '@mui/material/Menu';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { jwtDecode } from 'jwt-decode';
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Collapse from "@mui/material/Collapse";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import InputBase from '@mui/material/InputBase';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useThemeContext } from '../ThemeContext';

const leftDrawerWidth  = 300;
const rightPanelWidth  = 360;

// ── AppBar shifts based on BOTH drawers ──────────────────────────────────────
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => !['leftOpen', 'rightOpen'].includes(prop),
})(({ theme, leftOpen, rightOpen }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(leftOpen && {
    marginLeft: `${leftDrawerWidth}px`,
  }),
  ...(rightOpen && {
    marginRight: `${rightPanelWidth}px`,
  }),
  ...((leftOpen || rightOpen) && {
    width: `calc(100% - ${leftOpen ? leftDrawerWidth : 0}px - ${rightOpen ? rightPanelWidth : 0}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// ── Main content shifts based on BOTH drawers ────────────────────────────────
const MainContent = styled('main', {
  shouldForwardProp: (prop) => !['leftOpen', 'rightOpen'].includes(prop),
})(({ theme, leftOpen, rightOpen }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft:  leftOpen  ? 0 : `-${leftDrawerWidth}px`,
  marginRight: rightOpen ? 0 : `-${rightPanelWidth}px`,
  backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
  minHeight: '100vh',
  ...(leftOpen && {
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

// ── Chat bubble styles ────────────────────────────────────────────────────────
const UserBubble = styled(Box)(() => ({
  alignSelf: 'flex-end',
  background: 'linear-gradient(135deg, #6495ed 0%, #4a7bd4 100%)',
  color: '#ffffff',
  borderRadius: '18px 18px 4px 18px',
  padding: '10px 14px',
  maxWidth: '78%',
  fontSize: '0.875rem',
  lineHeight: 1.55,
  wordBreak: 'break-word',
  boxShadow: '0 4px 12px rgba(100,149,237,0.35)',
}));

const AssistantBubble = styled(Box)(() => ({
  alignSelf: 'flex-start',
  background: 'rgba(255,255,255,0.07)',
  color: '#e2e8f0',
  borderRadius: '18px 18px 18px 4px',
  padding: '10px 14px',
  maxWidth: '78%',
  fontSize: '0.875rem',
  lineHeight: 1.55,
  wordBreak: 'break-word',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}));

export default function PersistentDrawerLeft({ children }) {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  // left drawer
  const [open, setOpen] = React.useState(true);
  // right assistant panel
  const [rightOpen, setRightOpen] = React.useState(false);

  const [name, setName]   = React.useState('User');
  const [email, setEmail] = React.useState('');
  const [personalOpen, setPersonalOpen] = React.useState(false);

  // account menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  // chat state
  const [chatMessages, setChatMessages] = React.useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your study assistant powered by AI. Ask me anything about your notes, topics, or anything else you're studying!",
    },
  ]);
  const [chatInput, setChatInput]   = React.useState('');
  const [chatLoading, setChatLoading] = React.useState(false);
  const chatEndRef = React.useRef(null);

  // auto-scroll chat on new messages
  React.useEffect(() => {
    if (rightOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, rightOpen]);

  // decode JWT once
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setName(decoded.name || decoded.userName || 'User');
      setEmail(decoded.email || decoded.userEmail || '');
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  const handleDrawerOpen  = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleMenuOpen    = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose   = () => setAnchorEl(null);
  const handleLogout      = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMsg       = { role: 'user', content: trimmed };
    const updatedMsgs   = [...chatMessages, userMsg];
    setChatMessages(updatedMsgs);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const historyForApi = updatedMsgs
        .slice(1)           // skip greeting
        .slice(0, -1)       // exclude the message just added (sent as "message" field)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: trimmed, history: historyForApi }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: isDarkMode ? '#0f172a' : '#fafafa' }}>
      <CssBaseline />

      {/* ── AppBar ────────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        leftOpen={open}
        rightOpen={rightOpen}
        sx={{
          background: isDarkMode ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          color: isDarkMode ? '#ffffff' : '#000000',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 700,
              fontSize: '1.5rem',
              color: isDarkMode ? '#ffffff' : '#000000',
            }}
          >
            <ImportContactsOutlinedIcon sx={{ color: '#6495ed' }} />
            NotesMaker
          </Typography>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>

            {/* ── Assistant toggle button ─────────────────────────────── */}
            <IconButton
              id="assistant-panel-toggle"
              color="inherit"
              onClick={() => setRightOpen(prev => !prev)}
              sx={{
                position: 'relative',
                color: rightOpen ? '#6495ed' : 'inherit',
                background: rightOpen ? 'rgba(100,149,237,0.15)' : 'transparent',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': { background: 'rgba(100,149,237,0.15)' },
              }}
            >
              <SmartToyIcon />
              {/* subtle glow dot when panel is closed */}
              {!rightOpen && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#6495ed',
                    boxShadow: '0 0 6px #6495ed',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                  }}
                />
              )}
            </IconButton>

            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Account Menu ─────────────────────────────────────────────────── */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Typography variant="body2">{email || 'No email available'}</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary="Toggle Theme" />
          <Switch checked={isDarkMode} onChange={toggleTheme} color="default" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* ── Left Drawer ───────────────────────────────────────────────────── */}
      <Drawer
        sx={{
          width: leftDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: leftDrawerWidth,
            boxSizing: 'border-box',
            background: isDarkMode ? '#111111' : '#000000',
            color: '#ffffff',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffffff' }}>
              Welcome, {name}!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {email || 'Manage your notes'}
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemIcon sx={{ color: '#ffffff' }}><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/public/topics">
              <ListItemIcon sx={{ color: '#ffffff' }}><SearchIcon /></ListItemIcon>
              <ListItemText primary="Search Topics" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Personal dropdown */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setPersonalOpen(!personalOpen)}>
            <ListItemIcon sx={{ color: '#ffffff' }}><AccessibilityNewIcon /></ListItemIcon>
            <ListItemText primary="My Activity" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
            {personalOpen ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />}
          </ListItemButton>
        </ListItem>

        <Collapse in={personalOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/saved">
                <ListItemIcon sx={{ color: '#6495ed' }}><BookmarkIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Saved" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/liked">
                <ListItemIcon sx={{ color: '#6495ed' }}><ThumbUpIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Liked" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/calendar">
            <ListItemIcon sx={{ color: '#ffffff' }}><CalendarTodayIcon /></ListItemIcon>
            <ListItemText primary="Calendar" sx={{ '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' } }} />
          </ListItemButton>
        </ListItem>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login" onClick={handleLogout}>
              <ListItemIcon sx={{ color: '#ffffff' }}><LogoutIcon /></ListItemIcon>
              <ListItemText
                primary="Logout"
                secondary={email || 'Sign out'}
                sx={{
                  '& .MuiTypography-root': { fontWeight: 600, color: '#ffffff' },
                  '& .MuiListItemText-secondary': { color: '#a0a0a0' },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <MainContent leftOpen={open} rightOpen={rightOpen}>
        <DrawerHeader />
        {children}
      </MainContent>

      {/* ── Right Assistant Panel ─────────────────────────────────────────── */}
      <Drawer
        sx={{
          width: rightPanelWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: rightPanelWidth,
            boxSizing: 'border-box',
            background: isDarkMode ? '#0d0d0d' : '#0f0f0f',
            color: '#ffffff',
            borderLeft: '1px solid rgba(100,149,237,0.2)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        variant="persistent"
        anchor="right"
        open={rightOpen}
      >
        {/* Panel header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            minHeight: 64,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(100,149,237,0.08)',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6495ed, #4a7bd4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(100,149,237,0.4)',
              }}
            >
              <SmartToyIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff', lineHeight: 1.2 }}>
                Assistant
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                    animation: 'glow 2s infinite',
                    '@keyframes glow': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                    },
                  }}
                />
                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  AI-powered · llama-3.3-70b
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Clear chat */}
            <IconButton
              size="small"
              title="Clear chat"
              onClick={() =>
                setChatMessages([
                  {
                    role: 'assistant',
                    content: "Chat cleared! Ask me anything 😊",
                  },
                ])
              }
              sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ffffff' } }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setRightOpen(false)}
              sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ffffff' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Messages area */}
        <Box
          id="assistant-messages"
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 2,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(100,149,237,0.3)',
              borderRadius: '4px',
            },
          }}
        >
          {chatMessages.map((msg, idx) =>
            msg.role === 'user' ? (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <UserBubble>{msg.content}</UserBubble>
                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', mt: 0.5, mr: 0.5 }}>
                  You
                </Typography>
              </Box>
            ) : (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6495ed, #4a7bd4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} />
                  </Box>
                  <AssistantBubble>{msg.content}</AssistantBubble>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', mt: 0.5, ml: 4.5 }}>
                  Assistant
                </Typography>
              </Box>
            )
          )}

          {/* Thinking indicator */}
          {chatLoading && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6495ed, #4a7bd4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 14, color: '#fff' }} />
              </Box>
              <AssistantBubble sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={14} sx={{ color: '#6495ed' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Thinking…
                </Typography>
              </AssistantBubble>
            </Box>
          )}

          <div ref={chatEndRef} />
        </Box>

        {/* Input area */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            p: 2,
            flexShrink: 0,
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '14px',
              border: '1px solid rgba(100,149,237,0.2)',
              px: 2,
              py: 1,
              transition: 'border-color 0.2s ease',
              '&:focus-within': {
                borderColor: 'rgba(100,149,237,0.5)',
                background: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <InputBase
              id="assistant-chat-input"
              placeholder="Ask anything… (Enter to send)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={5}
              fullWidth
              sx={{
                color: '#ffffff',
                fontSize: '0.875rem',
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  '&::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 },
                },
              }}
            />
            <IconButton
              id="assistant-send-btn"
              size="small"
              onClick={sendMessage}
              disabled={!chatInput.trim() || chatLoading}
              sx={{
                mb: 0.25,
                color: chatInput.trim() && !chatLoading ? '#ffffff' : 'rgba(255,255,255,0.2)',
                background: chatInput.trim() && !chatLoading
                  ? 'linear-gradient(135deg, #6495ed, #4a7bd4)'
                  : 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                p: 0.9,
                flexShrink: 0,
                transition: 'all 0.2s ease',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #7aabff, #5a8be0)',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              mt: 1,
            }}
          >
            Powered by Groq · llama-3.3-70b-versatile
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
}
