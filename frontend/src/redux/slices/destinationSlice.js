import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDestinations = createAsyncThunk(
  'destinations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res   = await api.get(`/destinations?${query}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchFeaturedDestinations = createAsyncThunk(
  'destinations/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/destinations/featured');
      return res.data.destinations;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrendingDestinations = createAsyncThunk(
  'destinations/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/destinations/trending');
      return res.data.destinations;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const destinationSlice = createSlice({
  name: 'destinations',
  initialState: {
    list:       [],
    featured:   [],
    trending:   [],
    pagination: null,
    isLoading:  false,
    error:      null,
    filters: {
      category: '',
      country:  '',
      search:   '',
      sort:     '-createdAt',
      budget:   '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: '', country: '', search: '', sort: '-createdAt', budget: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchDestinations.fulfilled,(state, action) => {
        state.isLoading  = false;
        state.list       = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      })

      .addCase(fetchFeaturedDestinations.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchTrendingDestinations.fulfilled,  (state, action) => { state.trending = action.payload; });
  },
});

export const { setFilters, clearFilters } = destinationSlice.actions;
export const selectDestinations = (state) => state.destinations;
export default destinationSlice.reducer;
