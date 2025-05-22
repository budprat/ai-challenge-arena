import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, useMediaQuery, useTheme } from '@mui/material'

// Layouts
import MainLayout from '@/layouts/MainLayout'

// Pages
import Home from '@/pages/Home'

// Store selectors and actions
import { setMobile } from '@/store/slices/uiSlice'
import { getUserProfile, selectIsAuthenticated } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const theme = useTheme()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  // Check if the device is mobile
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Update mobile state in Redux when screen size changes
  useEffect(() => {
    dispatch(setMobile(isMobile))
  }, [isMobile, dispatch])
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  
  // Load user profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserProfile())
    }
  }, [isAuthenticated, dispatch])
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        {/* Main routes with layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          
          {/* Add more routes here as needed */}
          
          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App
