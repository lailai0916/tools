import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '@lailai/ui';
import '@lailai/ui/styles.css';
import App from './App';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('#root not found');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
