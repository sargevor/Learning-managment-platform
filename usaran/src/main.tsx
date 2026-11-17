import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/noto-sans-armenian/400.css';
import '@fontsource/noto-sans-armenian/500.css';
import '@fontsource/noto-sans-armenian/600.css';
import '@fontsource/noto-sans-armenian/700.css';
import '@fontsource/noto-sans-armenian/800.css';
import '@fontsource/noto-serif-armenian/600.css';
import '@fontsource/noto-serif-armenian/700.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/700.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/landing.css';
import './styles/redesign.css';
import './styles/pages/public.css';
import './styles/pages/catalog.css';
import './styles/pages/student-learning.css';
import './styles/pages/student-results.css';
import './styles/pages/teacher-courses.css';
import './styles/pages/teacher-work.css';
import './styles/pages/teacher-people.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
