import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import notificationService from '@/services/notificationService'

// Define types for the slice state
interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'SYSTEM_ANNOUNCEMENT' | 'BADGE_AWARDED' | 'SUBMISSION_EVALUATED' | 'SUBMISSION_REVIEWED' | 'OTHER'
  reference_id: string | null
  read: boolean
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
}

// Define the initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

// Async thunks for notification operations
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (unreadOnly: boolean = false, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(unreadOnly)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notifications')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch unread count')
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead()
      return true
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark all notifications as read')
    }
  }
)

// Notification slice
export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications cases
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.loading = false
        state.notifications = action.payload
        state.unreadCount = action.payload.filter(notification => !notification.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // fetchUnreadCount cases
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        state.unreadCount = action.payload
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // markNotificationAsRead cases
      .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
        const notificationIndex = state.notifications.findIndex(
          notification => notification.id === action.payload.id
        )
        
        if (notificationIndex !== -1) {
          // If the notification was previously unread, decrement counter
          if (!state.notifications[notificationIndex].read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
          
          // Update the notification
          state.notifications[notificationIndex] = action.payload
        }
      })
      
      // markAllNotificationsAsRead cases
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }))
        state.unreadCount = 0
      })
  },
})

// Export actions and reducer
export const { clearNotifications, addNotification } = notificationSlice.actions
export default notificationSlice.reducer

// Selectors
export const selectAllNotifications = (state: RootState) => state.notifications.notifications
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount
export const selectNotificationLoading = (state: RootState) => state.notifications.loading
export const selectNotificationError = (state: RootState) => state.notifications.error
