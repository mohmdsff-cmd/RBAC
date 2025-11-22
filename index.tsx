import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { PrimeReactProvider } from 'primereact/api';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

// Configure PrimeReact ripple effect
const value = {
    ripple: true,
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PrimeReactProvider value={value}>
        <App />
      </PrimeReactProvider>
    </Provider>
  </React.StrictMode>
);