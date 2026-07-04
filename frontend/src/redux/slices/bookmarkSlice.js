import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api   from '../../services/api';
import toast from 'react-hot-toast';

export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchAll',
  async (type, { rejectWithValue }) => {
    try {
      const url = type ? `/bookmarks?type=${type}` : '/bookmarks';
      const res = await api.get(url);
      return res.data.bookmarks;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addBookmark = createAsyncThunk(
  'bookmarks/add',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/bookmarks', data);
      toast.success('Saved to bookmarks!');
      return res.data.bookmark;
    } catch (err) {
      toast.error(err.message || 'Failed to bookmark');
      return rejectWithValue(err.message);
    }
  }
);

export const removeBookmark = createAsyncThunk(
  'bookmarks/remove',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      toast.success('Removed from bookmarks');
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState: { items: [], isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarks.pending,   (state) => { state.isLoading = true; })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items     = action.payload;
      })
      .addCase(fetchBookmarks.rejected,  (state) => { state.isLoading = false; })
      .addCase(addBookmark.fulfilled,    (state, action) => { state.items.unshift(action.payload); })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  },
});

export const selectBookmarks = (state) => state.bookmarks.items;
export default bookmarkSlice.reducer;
