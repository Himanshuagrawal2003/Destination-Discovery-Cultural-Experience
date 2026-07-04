import React    from 'react';
import ReactDOM  from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster }  from 'react-hot-toast';
import store        from './redux/store';
import App          from './App';
import './index.css';

// Apply saved dark mode on initial load
const savedTheme = localStorage.getItem('cq_theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-dark-border shadow-lg rounded-2xl text-sm font-sans',
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </Provider>
  </React.StrictMode>
);
