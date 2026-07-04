import { configureStore } from '@reduxjs/toolkit';
import authReducer        from './slices/authSlice';
import uiReducer          from './slices/uiSlice';
import destinationReducer from './slices/destinationSlice';
import bookmarkReducer    from './slices/bookmarkSlice';

const store = configureStore({
  reducer: {
    auth:        authReducer,
    ui:          uiReducer,
    destinations:destinationReducer,
    bookmarks:   bookmarkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
