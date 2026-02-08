import { useState, useEffect } from 'preact/hooks';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Executor } from './views/Executor';
import { History } from './views/History';
import { Settings } from './views/Settings';
import { parseHash } from './services/router';
import type { Route } from './services/router';

export function navigate(path: string): void {
  window.location.hash = '#' + path;
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  switch (route.view) {
    case 'settings':
      return <Settings />;
    case 'history':
      return <History />;
    case 'editor':
      return <Editor filename={route.filename} />;
    case 'executor':
      return <Executor filename={route.filename} />;
    default:
      return <Dashboard />;
  }
}
