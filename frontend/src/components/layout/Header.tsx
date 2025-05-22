import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Theme
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import { setDrawerOpen, selectDrawerOpen, toggleDarkMode, selectDarkMode } from '@/store/slices/uiSlice'
import { logout, selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice'
import { selectUnreadCount, fetchUnreadCount } from '@/store/slices/notificationSlice'
import { AppDispatch } from '@/store'

interface HeaderProps {
  drawerWidth: number
}

const Header: React.FC<HeaderProps> = ({ drawerWidth }) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const drawerOpen = useSelector(selectDrawerOpen)
  const darkMode = useSelector(selectDarkMode)
  const unreadCount = useSelector(selectUnreadCount)
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  
  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount())
    }
  }, [isAuthenticated, dispatch])
  
  const handleDrawerToggle = () => {
    dispatch(setDrawerOpen(!drawerOpen))
  }
  
  const handleThemeToggle = () => {
    dispatch(toggleDarkMode())
  }
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }
  
  const handleLogout = () => {
    dispatch(logout())
    setAnchorEl(null)
    navigate('/')
  }
  
  const navigateToProfile = () => {
    navigate('/profile')
    setAnchorEl(null)
  }
  
  const navigateToNotifications = () => {
    navigate('/notifications')
  }
  
  const navigateToHome = () => {
    navigate('/')
  }
  
  const navigateToLogin = () => {
    navigate('/login')
  }
  
  const navigateToRegister = () => {
    navigate('/register')
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
        ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
        transition: (theme: Theme) => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          onClick={navigateToHome}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          EliteBuilders
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            onClick={handleThemeToggle}
            sx={{ mr: 1 }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          {isAuthenticated ? (
            <>
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit" 
                  onClick={navigateToNotifications}
                  sx={{ mr: 1 }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Account">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  edge="end"
                  aria-haspopup="true"
                >
                  {currentUser?.name ? (
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(currentUser.name)}
                    </Avatar>
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={navigateToProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                onClick={navigateToLogin}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={navigateToRegister}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
