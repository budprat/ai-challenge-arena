import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Box, 
  CssBaseline, 
  useMediaQuery, 
  useTheme,
  Container 
} from '@mui/material'

import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { selectDrawerOpen, setDrawerOpen, setMobile } from '@/store/slices/uiSlice'
import { AppDispatch } from '@/store'

const MainLayout: React.FC = () => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  
  const drawerOpen = useSelector(selectDrawerOpen)
  const drawerWidth = 240
  
  // Set mobile status in state
  useEffect(() => {
    dispatch(setMobile(isSmallScreen))
    
    // Close drawer by default on small screens
    if (isSmallScreen && drawerOpen) {
      dispatch(setDrawerOpen(false))
    }
  }, [isSmallScreen, dispatch, drawerOpen])
  
  // Close drawer when changing routes on mobile
  useEffect(() => {
    if (isSmallScreen && drawerOpen) {
      dispatch(setDrawerOpen(false))
    }
  }, [location.pathname, isSmallScreen, drawerOpen, dispatch])
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      <Header drawerWidth={drawerWidth} />
      <Sidebar drawerWidth={drawerWidth} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          marginTop: '64px', // Header height
          padding: theme.spacing(3),
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

export default MainLayout
