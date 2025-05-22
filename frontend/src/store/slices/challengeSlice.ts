import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { RootState } from '@/store'
import challengeService from '@/services/challengeService'
import { Challenge } from '@/types/models'

// Define types for the slice state
interface ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  recommendedChallenges: Challenge[];
  loading: boolean;
  error: string | null;
  filters: {
    activeOnly: boolean;
    sponsorId: string | null;
    seasonId: string | null;
    searchQuery: string;
  };
}

// Define the initial state
const initialState: ChallengeState = {
  challenges: [],
  currentChallenge: null,
  recommendedChallenges: [],
  loading: false,
  error: null,
  filters: {
    activeOnly: true,
    sponsorId: null,
    seasonId: null,
    searchQuery: '',
  },
}

// Async thunks for challenge operations
export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const { activeOnly, sponsorId, seasonId, searchQuery } = state.challenges.filters
      
      const response = await challengeService.getChallenges(
        activeOnly,
        sponsorId,
        seasonId,
        searchQuery
      )
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch challenges')
    }
  }
)

export const fetchChallengeById = createAsyncThunk(
  'challenges/fetchChallengeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeById(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch challenge')
    }
  }
)

export const fetchRecommendedChallenges = createAsyncThunk(
  'challenges/fetchRecommendedChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeService.getRecommendedChallenges()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch recommended challenges')
    }
  }
)

interface FilterPayload {
  key: string;
  value: any;
}

// Challenge slice
export const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<FilterPayload>) => {
      const { key, value } = action.payload
      // @ts-ignore - Dynamic property assignment
      state.filters[key] = value
    },
    clearFilters: (state) => {
      state.filters = {
        activeOnly: true,
        sponsorId: null,
        seasonId: null,
        searchQuery: '',
      }
    },
    clearChallenges: (state) => {
      state.challenges = []
      state.currentChallenge = null
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<ChallengeState>) => {
    builder
      // fetchChallenges cases
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false
        state.challenges = action.payload as Challenge[]
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // fetchChallengeById cases
      .addCase(fetchChallengeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchChallengeById.fulfilled, (state, action) => {
        state.loading = false
        state.currentChallenge = action.payload as Challenge
      })
      .addCase(fetchChallengeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
      
      // fetchRecommendedChallenges cases
      .addCase(fetchRecommendedChallenges.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRecommendedChallenges.fulfilled, (state, action) => {
        state.loading = false
        state.recommendedChallenges = action.payload as Challenge[]
      })
      .addCase(fetchRecommendedChallenges.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'An unknown error occurred'
      })
  },
})

// Export actions and reducer
export const { setFilter, clearFilters, clearChallenges } = challengeSlice.actions
export default challengeSlice.reducer

// Selectors
export const selectAllChallenges = (state: RootState) => state.challenges.challenges
export const selectCurrentChallenge = (state: RootState) => state.challenges.currentChallenge
export const selectRecommendedChallenges = (state: RootState) => state.challenges.recommendedChallenges
export const selectChallengeLoading = (state: RootState) => state.challenges.loading
export const selectChallengeError = (state: RootState) => state.challenges.error
export const selectChallengeFilters = (state: RootState) => state.challenges.filters
