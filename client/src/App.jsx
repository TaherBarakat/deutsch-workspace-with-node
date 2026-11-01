import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { RefreshProvider } from './contexts/RefreshContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { StudyPage } from './pages/StudyPage.jsx';
import { WordSectionPage } from './pages/WordSectionPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RefreshProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<OverviewPage />} />
              <Route path="verbs" element={<WordSectionPage type="verb" />} />
              <Route path="nouns" element={<WordSectionPage type="noun" />} />
              <Route path="adjectives" element={<WordSectionPage type="adjective" />} />
              <Route path="adverbs" element={<WordSectionPage type="adverb" />} />
              <Route path="study" element={<StudyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </RefreshProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
