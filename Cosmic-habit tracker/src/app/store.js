import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import habitsReducer from '../features/habits/habitsSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Only persist the habits slice
  whitelist: ['habits']
};

const rootReducer = combineReducers({
  habits: habitsReducer,
  // Add other reducers here if needed
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Disable immutable check for Three.js objects if they ever end up in state (should avoid)
      // immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
