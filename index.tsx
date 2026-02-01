
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { PrimeReactProvider } from 'primereact/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

// Configure PrimeReact ripple effect
const value = {
    ripple: true,
};

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PrimeReactProvider value={value}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
      </PrimeReactProvider>
    </Provider>
  </React.StrictMode>
);
