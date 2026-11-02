import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Layers, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {navOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="app-main">
        <header className="mobile-header">
          <button type="button" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>

          <NavLink to="/" className="mobile-brand">
            <span className="brand__mark brand__mark--small">W</span>
            <span>Wortschatz</span>
          </NavLink>

          <div className="mobile-header__actions">
            <ThemeToggle compact />
            <NavLink to="/study" className="mobile-header__study" aria-label="Open flashcards">
              <Layers size={19} />
            </NavLink>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
