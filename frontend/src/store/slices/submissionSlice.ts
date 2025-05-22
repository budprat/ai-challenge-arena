/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import submissionService from '@/services/submissionService'
import { Submission, SubmissionWithEvaluation } from '@/types/models'

// Define types for the slice state
interface SubmissionState {
  submissions: Submission[];
  currentSubmission: SubmissionWithEvaluation | null;
  userSubmissions: Submission[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

// Define the initial state
const initialState: SubmissionState = {
  submissions: [],
  currentSubmission: null,
  userSubmissions: [],
  loading: false,
  submitting: false,
  error: null,
}

// Async thunks for submission operations
export const fetchUserSubmissions = createAsyncThunk(
  'submissions/fetchUserSubmissions',
  async (challengeId: string | null = null, { rejectWithValue }) => {
    try {
      const response = await submissionService.getUserSubmissions(challengeId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch your submissions')
    }
  }
)

export const fetchSubmissionById = createAsyncThunk(
  'submissions/fetchSubmissionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await submissionService.getSubmissionById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch submission')
    }
  }
)

export const createSubmission = createAsyncThunk(
  'submissions/createSubmission',
  async (submissionData: any, { rejectWithValue }) => {
    try {
      const response = await submissionService.createSubmission(submissionData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create submission')
    }
  }
)

export interface UpdateSubmissionParams {
  id: string;
  data: any;
}

export const updateSubmission = createAsyncThunk(
  'submissions/updateSubmission',
  async ({ id, data }: UpdateSubmissionParams, { rejectWithValue }) => {
    try {
      const response = await submissionService.updateSubmission(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update submission')
    }
  }
)

export const evaluateSubmission = createAsyncThunk(
  'submissions/evaluateSubmission',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await submissionService.evaluateSubmission(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to evaluate submission')
    }
  }
)

// Submission slice
export const submissionSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    clearCurrentSubmission: (state: SubmissionState) => {
      state.currentSubmission = null
    },
    clearSubmissionError: (state: SubmissionState) => {
      state.error = null
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<SubmissionState>) => {
    builder
      // fetchUserSubmissions cases
      .addCase(fetchUserSubmissions.pending, (state: SubmissionState) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserSubmissions.fulfilled, (state: SubmissionState, action) => {
        state.loading = false
        state.userSubmissions = action.payload as Submission[]
      })
      .addCase(fetchUserSubmissions.rejected, (state: SubmissionState, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // fetchSubmissionById cases
      .addCase(fetchSubmissionById.pending, (state: SubmissionState) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubmissionById.fulfilled, (state: SubmissionState, action) => {
        state.loading = false
        state.currentSubmission = action.payload as SubmissionWithEvaluation
      })
      .addCase(fetchSubmissionById.rejected, (state: SubmissionState, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // createSubmission cases
      .addCase(createSubmission.pending, (state: SubmissionState) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createSubmission.fulfilled, (state: SubmissionState, action) => {
        state.submitting = false
        state.userSubmissions.unshift(action.payload as Submission)
      })
      .addCase(createSubmission.rejected, (state: SubmissionState, action) => {
        state.submitting = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // updateSubmission cases
      .addCase(updateSubmission.pending, (state: SubmissionState) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateSubmission.fulfilled, (state: SubmissionState, action) => {
        state.submitting = false
        const payload = action.payload as Submission;
        
        if (state.currentSubmission && state.currentSubmission.id === payload.id) {
          state.currentSubmission = {...state.currentSubmission, ...payload}
        }
        
        state.userSubmissions = state.userSubmissions.map((submission: Submission) => 
          submission.id === payload.id ? payload : submission
        )
      })
      .addCase(updateSubmission.rejected, (state: SubmissionState, action) => {
        state.submitting = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // evaluateSubmission cases
      .addCase(evaluateSubmission.pending, (state: SubmissionState) => {
        state.loading = true
        state.error = null
      })
      .addCase(evaluateSubmission.fulfilled, (state: SubmissionState, action) => {
        state.loading = false
        const payload = action.payload as SubmissionWithEvaluation;
        state.currentSubmission = payload
        
        // Update in the list as well
        state.userSubmissions = state.userSubmissions.map((submission: Submission) => 
          submission.id === payload.id ? payload : submission
        )
      })
      .addCase(evaluateSubmission.rejected, (state: SubmissionState, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
  },
})

// Export actions and reducer
export const { clearCurrentSubmission, clearSubmissionError } = submissionSlice.actions
export default submissionSlice.reducer

// Selectors
export const selectUserSubmissions = (state: RootState) => state.submissions.userSubmissions
export const selectCurrentSubmission = (state: RootState) => state.submissions.currentSubmission
export const selectSubmissionLoading = (state: RootState) => state.submissions.loading
export const selectSubmissionSubmitting = (state: RootState) => state.submissions.submitting
export const selectSubmissionError = (state: RootState) => state.submissions.error
