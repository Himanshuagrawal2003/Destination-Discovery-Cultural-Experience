import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api   from '../../services/api';
import toast from 'react-hot-toast';

// ─── Load initial state from localStorage ─────────────────────────────────────
const storedToken = localStorage.getItem('cq_token');
const storedUser  = localStorage.getItem('cq_user');

const initialState = {
  user:      storedUser  ? JSON.parse(storedUser)  : null,
  token:     storedToken ? storedToken              : null,
  isLoading: false,
  error:     null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('cq_token');
      localStorage.removeItem('cq_user');
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
    setUser:    (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerUser.fulfilled,(state, action) => {
        state.isLoading = false;
        state.token     = action.payload.token;
        state.user      = action.payload.user;
        localStorage.setItem('cq_token', action.payload.token);
        localStorage.setItem('cq_user',  JSON.stringify(action.payload.user));
        toast.success('Welcome to CultureQuest AI! 🌍');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
        toast.error(action.payload || 'Registration failed');
      });

    // Login
    builder
      .addCase(loginUser.pending,  (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled,(state, action) => {
        state.isLoading = false;
        state.token     = action.payload.token;
        state.user      = action.payload.user;
        localStorage.setItem('cq_token', action.payload.token);
        localStorage.setItem('cq_user',  JSON.stringify(action.payload.user));
        toast.success(`Welcome back, ${action.payload.user.name}! 👋`);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
        toast.error(action.payload || 'Login failed');
      });

    // Fetch Me
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('cq_user', JSON.stringify(action.payload.user));
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user  = null;
        state.token = null;
        localStorage.removeItem('cq_token');
        localStorage.removeItem('cq_user');
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending,  (state) => { state.isLoading = true; })
      .addCase(updateProfile.fulfilled,(state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('cq_user', JSON.stringify(action.payload.user));
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        toast.error(action.payload || 'Update failed');
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;

// Selectors
export const selectAuth    = (state) => state.auth;
export const selectUser    = (state) => state.auth.user;
export const selectToken   = (state) => state.auth.token;

export default authSlice.reducer;
