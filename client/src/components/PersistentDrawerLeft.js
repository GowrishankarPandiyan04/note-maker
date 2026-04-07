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
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import Collapse from "@mui/material/Collapse";

const drawerWidth = 300;

const MainContent = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
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

export default function PersistentDrawerLeft({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [name, setName] = React.useState('User');
  const [email, setEmail] = React.useState('');
  const [darkMode, setDarkMode] = React.useState(false);
  const [personalOpen, setPersonalOpen] = React.useState(false);

  // menu state
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Decode token once when component mounts
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const userName = decoded.name || decoded.userName || 'User';
      const userEmail = decoded.email || decoded.userEmail || '';
      setEmail(userEmail);
      setName(userName);
    } catch (error) {
      console.error('Failed to decode token:', error);
      setEmail('');
      setName('User');
      localStorage.removeItem('token');
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: "#fafafa" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {/* Menu button (left) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo / Title (left-aligned) */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ImportContactsOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Notesmaker
          </Typography>

          {/* Right side (notifications + account + username) */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.1 }}>
            <IconButton color="inherit">
              <NotificationsIcon fontSize="medium" />
            </IconButton>

            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon fontSize="medium" />
            </IconButton>

            {/* <Typography
              variant="body2"
              fontWeight="light"
              onClick={handleMenuOpen}
              sx={{ cursor: 'pointer' }}
            >
              {name || "User"}
            </Typography> */}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* Email display */}
        <MenuItem disabled>
          <Typography variant="body2">{email || "No email available"}</Typography>
        </MenuItem>

        {/* Dark/Light mode toggle */}
        <MenuItem>
          <ListItemIcon>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary="Toggle Theme" />
          <Switch
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            color="default"
          />
        </MenuItem>

        {/* Logout */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
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
            px: 2,
          }}
        >
          <Box>
            {/* <img src="/logo.png" width={100} alt="NotesMaker Logo" /> */}
            <Typography variant="subtitle1">Welcome, {name}!</Typography>
            {/* <Typography variant="body2" color="text.secondary">{email || 'No email available'}</Typography> */}
          </Box>

          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        
        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton component={Link} to="/public/topics">
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Search Topics Online" />
            </ListItemButton>
          </ListItem>
          
        </List>

        {/* Personal dropdown */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setPersonalOpen(!personalOpen)}>
            <ListItemIcon>
              <AccessibilityNewIcon />
            </ListItemIcon>
            <ListItemText primary="My Activity" />
            {personalOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={personalOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/saved">
                <ListItemIcon>
                  <BookmarkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Saved" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton sx={{ pl: 4 }} component={Link} to="/liked">
                <ListItemIcon>
                  <ThumbUpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Liked" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/calendar">
            <ListItemIcon>
              <CalendarTodayIcon />
            </ListItemIcon>
            <ListItemText primary="Calendar" />
          </ListItemButton>
        </ListItem>

        <Divider />

        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login" onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" secondary={email || 'No email available'} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <MainContent open={open}>
        <DrawerHeader />
        {children}
      </MainContent>
    </Box>
  );
}
