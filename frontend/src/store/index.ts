import { configureStore } from '@reduxjs/toolkit'
import type { Action } from 'redux'
import type { ThunkAction } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import challengeReducer from './slices/challengeSlice'
import submissionReducer from './slices/submissionSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenges: challengeReducer,
    submissions: submissionReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Define the AppThunk type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>
