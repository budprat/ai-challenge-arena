import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import authService from '@/services/authService'
import { User } from '@/types/models'

// Define types for the slice state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password)
      localStorage.setItem('token', response.access_token)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed')
    }
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.token
      
      if (!token) {
        return rejectWithValue('No token available')
      }
      
      const response = await authService.getUserProfile()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile')
    }
  }
)

// Auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state: AuthState) => {
      state.error = null
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      // Login cases
      .addCase(login.pending, (state: AuthState) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.loading = false
        state.token = action.payload.access_token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state: AuthState, action: PayloadAction<unknown>) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Register cases
      .addCase(register.pending, (state: AuthState) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state: AuthState) => {
        state.loading = false
      })
      .addCase(register.rejected, (state: AuthState, action: PayloadAction<unknown>) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Get user profile cases
      .addCase(getUserProfile.pending, (state: AuthState) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getUserProfile.rejected, (state: AuthState, action: PayloadAction<unknown>) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
  },
})

// Export actions and reducer
export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error
