import { useState, useEffect } from 'preact/hooks';
import { navigate } from '../app';
import type { Routine } from '../types';
import { formatDateTime } from '../types';
import { loadRoutines, saveRoutine, deleteRoutine, loadSettings, slugify, uniqueFilename, getInvalidRoutineNames } from '../services/storage';
import { pullRoutines, deleteRoutineRemote } from '../services/github';
import { showToast } from '../services/toast';

import { Play, Pencil, Delete, Settings, RefreshCw } from '../icons';

export function Dashboard() {
  const [routines, setRoutines] = useState<Record<string, Routine>>(() => loadRoutines());
  const [syncing, setSyncing] = useState(false);

  const syncFromGithub = (silentIfNotConfigured = false) => {
    if (syncing) return;
    const settings = loadSettings();
    if (!settings.githubToken || !settings.repo) {
      if (!silentIfNotConfigured) {
        showToast('Configure GitHub in Settings to sync');
      }
      return;
    }

    setSyncing(true);
    pullRoutines(settings.repo, settings.githubToken)
      .then((result) => {
        if (result) {
          setRoutines(result.routines);
          if (result.errors.length > 0) {
            showToast(`Invalid routines: ${result.errors.join(', ')}`);
          }
        }
      })
      .catch(() => showToast('GitHub sync failed'))
      .finally(() => setSyncing(false));
  };

  useEffect(() => {
    const invalid = getInvalidRoutineNames();
    if (invalid.length > 0) {
      showToast(`Invalid routines removed: ${invalid.join(', ')}`);
    }
  }, []);

  useEffect(() => {
    syncFromGithub(true);
  }, []);

  const handleNew = () => {
    const filename = uniqueFilename(slugify('new-routine'));
    const routine: Routine = {
      name: 'New Routine',
      created: new Date().toISOString(),
      edited: new Date().toISOString(),
      data: [],
    };
    saveRoutine(filename, routine);
    navigate('edit/' + filename);
  };

  const handleDelete = (filename: string) => {
    deleteRoutine(filename);
    setRoutines(loadRoutines());
    const s = loadSettings();
    if (s.githubToken && s.repo) {
      deleteRoutineRemote(s.repo, s.githubToken, filename).catch(() => showToast('GitHub sync failed'));
    }
  };

  const entries = Object.entries(routines).sort(([filenameA, routineA], [filenameB, routineB]) => {
    const executedA = routineA.executed ? Date.parse(routineA.executed) : Number.NEGATIVE_INFINITY;
    const executedB = routineB.executed ? Date.parse(routineB.executed) : Number.NEGATIVE_INFINITY;
    const safeExecutedA = Number.isNaN(executedA) ? Number.NEGATIVE_INFINITY : executedA;
    const safeExecutedB = Number.isNaN(executedB) ? Number.NEGATIVE_INFINITY : executedB;

    if (safeExecutedA !== safeExecutedB) return safeExecutedB - safeExecutedA;

    const nameCmp = routineA.name.localeCompare(routineB.name);
    if (nameCmp !== 0) return nameCmp;
    return filenameA.localeCompare(filenameB);
  });

  return (
    <div>
      <div class="header">
        <h1>GitRoutine {syncing && <span style="font-size:12px;color:var(--text2)">syncing...</span>}</h1>
        <div class="header-actions">
          <button class="btn-icon" onClick={() => syncFromGithub()} disabled={syncing} title="Sync" aria-label="Sync">
            <RefreshCw size={20} />
          </button>
          <button class="btn-icon" onClick={() => navigate('history')} style="width:auto;padding:0 12px">History</button>
          <button class="btn-icon" onClick={() => navigate('settings')} title="Settings"><Settings size={20} /></button>
          <button class="btn-icon" onClick={handleNew} title="New routine">+</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div class="empty">
          <p>No routines yet.</p>
          <p style="margin-top:8px">Create one to get started.</p>
        </div>
      ) : (
        entries.map(([filename, r]) => (
          <div class="card" key={filename}>
            <div class="card-row">
              <div>
                <div class="card-title">{r.name}</div>
                <div class="card-sub">Executed: {r.executed ? formatDateTime(r.executed) : 'never'}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn-icon" onClick={() => navigate('execute/' + filename)} title="Execute"><Play size={20} /></button>
                <button class="btn-icon" onClick={() => navigate('edit/' + filename)} title="Edit"><Pencil size={20} /></button>
                <button class="btn-icon" onClick={() => handleDelete(filename)} title="Delete" style="color:var(--danger)"><Delete size={20} /></button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
