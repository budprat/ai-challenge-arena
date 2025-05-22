import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'

// Define types for the slice state
interface UIState {
  darkMode: boolean
  drawerOpen: boolean
  snackbar: {
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
    duration?: number
  }
  isLoading: boolean
  isMobile: boolean
}

// Define the initial state
const initialState: UIState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  drawerOpen: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
    duration: 6000
  },
  isLoading: false,
  isMobile: window.innerWidth < 768
}

// UI slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', String(state.darkMode))
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
      localStorage.setItem('darkMode', String(state.darkMode))
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen
    },
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.drawerOpen = action.payload
    },
    showSnackbar: (state, action: PayloadAction<{
      message: string,
      severity?: 'success' | 'info' | 'warning' | 'error',
      duration?: number
    }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        duration: action.payload.duration
      }
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload
    }
  }
})

// Export actions and reducer
export const {
  toggleDarkMode,
  setDarkMode,
  toggleDrawer,
  setDrawerOpen,
  showSnackbar,
  hideSnackbar,
  setLoading,
  setMobile
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectDarkMode = (state: RootState) => state.ui.darkMode
export const selectDrawerOpen = (state: RootState) => state.ui.drawerOpen
export const selectSnackbar = (state: RootState) => state.ui.snackbar
export const selectIsLoading = (state: RootState) => state.ui.isLoading
export const selectIsMobile = (state: RootState) => state.ui.isMobile
