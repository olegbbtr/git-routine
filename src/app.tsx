import { useState, useEffect } from 'preact/hooks';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Runner } from './views/Runner';
import { History } from './views/History';
import { Settings } from './views/Settings';

type Route =
  | { view: 'dashboard' }
  | { view: 'settings' }
  | { view: 'history' }
  | { view: 'editor'; filename: string }
  | { view: 'runner'; filename: string };

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('edit/')) return { view: 'editor', filename: decodeURIComponent(h.slice(5)) };
  if (h.startsWith('run/')) return { view: 'runner', filename: decodeURIComponent(h.slice(4)) };
  if (h === 'settings') return { view: 'settings' };
  if (h === 'history') return { view: 'history' };
  return { view: 'dashboard' };
}

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
    case 'runner':
      return <Runner filename={route.filename} />;
    default:
      return <Dashboard />;
  }
}
