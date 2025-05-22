import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Drawer, 
  List, 
  Divider, 
  Box,
  useTheme,
  IconButton,
  Theme
} from '@mui/material'
import {
  Home as HomeIcon,
  EmojiEvents as ChallengesIcon,
  Leaderboard as LeaderboardIcon,
  Assessment as SubmissionsIcon,
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  ChevronLeft as ChevronLeftIcon,
  Business as SponsorIcon
} from '@mui/icons-material'
import { useLocation } from 'react-router-dom'

import { selectDrawerOpen, setDrawerOpen, selectIsMobile } from '@/store/slices/uiSlice'
import { selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  drawerWidth: number
}

interface NavItem {
  name: string;
  icon: JSX.Element;
  path: string;
  authRequired: boolean;
  adminOnly?: boolean;
}

// Simple ListItem component that doesn't use Material UI's ListItem
const CustomListItem: React.FC<{
  to: string;
  primary: string;
  icon?: JSX.Element;
  selected?: boolean;
  onClick?: () => void;
}> = ({ to, primary, icon, selected = false, onClick }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    navigate(to);
  };

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    cursor: 'pointer',
    borderLeft: selected ? '4px solid #1976d2' : 'none',
    backgroundColor: isHovered 
      ? 'rgba(0, 0, 0, 0.08)' 
      : (selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'),
    transition: 'background-color 0.15s ease',
    minHeight: '48px',
    borderRadius: '4px',
    margin: '2px 0',
  };

  return (
    <div
      style={baseStyles}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && (
        <div style={{ 
          marginRight: '16px',
          minWidth: '24px',
          color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.54)',
          display: 'flex'
        }}>
          {icon}
        </div>
      )}
      
      <div style={{ 
        flexGrow: 1,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
        color: selected ? '#1976d2' : 'rgba(0, 0, 0, 0.87)'
      }}>
        {primary}
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth }) => {
  const theme = useTheme<Theme>()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  
  const drawerOpen = useSelector(selectDrawerOpen)
  const isMobile = useSelector(selectIsMobile)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  
  const handleDrawerClose = () => {
    dispatch(setDrawerOpen(false))
  }
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }
  
  // Navigation items with their respective routes and icons
  const navItems: NavItem[] = [
    { name: 'Home', icon: <HomeIcon />, path: '/', authRequired: false },
    { name: 'Challenges', icon: <ChallengesIcon />, path: '/challenges', authRequired: false },
    { name: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', authRequired: false },
  ]
  
  const authNavItems: NavItem[] = [
    { name: 'My Submissions', icon: <SubmissionsIcon />, path: '/submissions', authRequired: true },
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', authRequired: true },
    { name: 'Profile', icon: <ProfileIcon />, path: '/profile', authRequired: true },
  ]
  
  // Admin-only navigation items
  const adminNavItems: NavItem[] = [
    { name: 'Sponsors', icon: <SponsorIcon />, path: '/admin/sponsors', authRequired: true, adminOnly: true },
  ]
  
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer header with close button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar 
      }}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* Public navigation items */}
      <List>
        {navItems.map((item) => (
          <CustomListItem
            key={item.path}
            to={item.path}
            primary={item.name}
            icon={item.icon}
            selected={isActive(item.path)}
          />
        ))}
      </List>
      
      {/* Authentication required navigation items */}
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            {authNavItems.map((item) => (
              <CustomListItem
                key={item.path}
                to={item.path}
                primary={item.name}
                icon={item.icon}
                selected={isActive(item.path)}
              />
            ))}
          </List>
        </>
      )}
      
      {/* Admin-only navigation items */}
      {isAuthenticated && currentUser?.is_admin && (
        <>
          <Divider />
          <List>
            {adminNavItems.map((item) => (
              <CustomListItem
                key={item.path}
                to={item.path}
                primary={item.name}
                icon={item.icon}
                selected={isActive(item.path)}
              />
            ))}
          </List>
        </>
      )}
      
      {/* Spacer to push the version to the bottom */}
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Version display at the bottom */}
      <Box sx={{ 
        padding: theme.spacing(2), 
        textAlign: 'center',
        color: theme.palette.text.secondary,
        fontSize: '0.75rem'
      }}>
        EliteBuilders v1.0.0
      </Box>
    </Box>
  )
  
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer (temporary) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Desktop drawer (persistent) */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              top: '64px', // Height of AppBar
              height: 'calc(100% - 64px)' 
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  )
}

export default Sidebar
