import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const RefreshContext = createContext(null);

export function RefreshProvider({ children }) {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const value = useMemo(() => ({ version, refresh }), [version, refresh]);

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) throw new Error('useRefresh must be used inside RefreshProvider.');
  return context;
}
