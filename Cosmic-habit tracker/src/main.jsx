import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store'; // Correct path
import App from './App.jsx';
import './index.css'; // Keep global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Optionally dispatch position recalculation once persisted state is loaded */}
        {/* <AppInitializer /> */}
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);

// Optional: Component to run actions after rehydration
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { recalculateAllPositions } from './features/habits/habitsSlice';
//
// function AppInitializer() {
//   const dispatch = useDispatch();
//   useEffect(() => {
//     // Ensure positions are correct based on persisted state
//     dispatch(recalculateAllPositions());
//   }, [dispatch]);
//   return null; // This component doesn't render anything
// }
