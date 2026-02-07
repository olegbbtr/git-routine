import { useState, useEffect } from 'preact/hooks';
import { navigate } from '../app';
import type { SessionLog } from '../types';
import { formatDateTime, formatDuration } from '../types';
import { loadHistory, deleteSessionLog, loadSettings, loadRoutines } from '../services/storage';
import { pullHistory } from '../services/github';
import { showToast } from '../services/toast';
import { ArrowLeft, Pencil, Play, Delete } from '../icons';

export function History() {
  const [logs, setLogs] = useState<SessionLog[]>(() => loadHistory());

  useEffect(() => {
    const settings = loadSettings();
    if (!settings.githubToken || !settings.repo) return;
    pullHistory(settings.repo, settings.githubToken)
      .then((updated) => {
        if (updated) setLogs(updated);
      })
      .catch(() => showToast('GitHub sync failed'));
  }, []);

  const handleDelete = (id: string) => {
    deleteSessionLog(id);
    setLogs(loadHistory());
  };

  const findRoutine = (routineName: string) => {
    const routines = loadRoutines();
    return Object.entries(routines).find(([, r]) => r.name === routineName);
  };

  return (
    <div>
      <div class="header">
        <button class="btn-icon" onClick={() => navigate('')} title="Back"><ArrowLeft size={18} /></button>
        <h1>History</h1>
      </div>

      {logs.length === 0 ? (
        <div class="empty">No sessions recorded yet.</div>
      ) : (
        logs.map((log) => (
          <div class="card" key={log.id}>
            <div class="card-row">
              <div>
                <div class="card-title">{log.routineName}</div>
                <div class="card-sub">
                  {formatDateTime(log.timestamp)} &middot; {formatDuration(log.durationSeconds)}
                </div>
              </div>
              <div style="display:flex;gap:6px">
                {findRoutine(log.routineName) && <button class="btn-icon" onClick={() => navigate('edit/' + findRoutine(log.routineName)![0])} title="Edit"><Pencil size={20} /></button>}
                <button class="btn-icon" onClick={() => { const e = findRoutine(log.routineName); if (e) navigate('run/' + e[0]); }} title="Run again"><Play size={20} /></button>
                <button class="btn-icon" onClick={() => handleDelete(log.id)} title="Delete" style="color:var(--danger)"><Delete size={20} /></button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
