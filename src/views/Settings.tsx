import { useState, useEffect } from 'preact/hooks';
import { navigate } from '../app';
import { loadSettings, saveSettings } from '../services/storage';
import { validateToken, listRepos, countRemoteRoutines } from '../services/github';
import { showToast } from '../services/toast';
import { importExamples } from '../services/examples';
import { speak, unlockAudio } from '../services/audio';
import { ArrowLeft, Info, ExternalLink } from '../icons';
import { DurationStepper } from '../components/DurationStepper';

interface RepoOption {
  full_name: string;
  name: string;
}

export function Settings() {
  const [settings, setSettings] = useState(() => loadSettings());
  const [warmupUnit, setWarmupUnit] = useState<'s' | 'm'>(() => (
    settings.warmupDuration >= 60 && settings.warmupDuration % 60 === 0 ? 'm' : 's'
  ));
  const [announceNextUnit, setAnnounceNextUnit] = useState<'s' | 'm'>(() => (
    settings.announceNextSeconds >= 60 && settings.announceNextSeconds % 60 === 0 ? 'm' : 's'
  ));
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [validating, setValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [tryText, setTryText] = useState('Hello, this is a test');
  const [routineCount, setRoutineCount] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      if ('speechSynthesis' in window) {
        setVoices(speechSynthesis.getVoices());
      }
    };
    load();
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', load);
      return () => speechSynthesis.removeEventListener('voiceschanged', load);
    }
  }, []);

  const langs = [...new Set(voices.map(v => v.lang))].sort();
  const filteredVoices = settings.announceLang
    ? voices.filter(v => v.lang === settings.announceLang)
    : voices;

  const update = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const handleValidate = async () => {
    setValidating(true);
    setTokenValid(null);
    setRoutineCount(null);
    try {
      const ok = await validateToken(settings.githubToken);
      setTokenValid(ok);
      if (ok) {
        const list = await listRepos(settings.githubToken);
        setRepos(list);
      }
    } catch {
      setTokenValid(false);
      showToast('GitHub validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleCheckRepo = async () => {
    if (!settings.repo || !settings.githubToken) return;
    setValidating(true);
    setRoutineCount(null);
    try {
      const count = await countRemoteRoutines(settings.repo, settings.githubToken);
      setRoutineCount(count);
    } catch {
      showToast('Repository check failed');
    } finally {
      setValidating(false);
    }
  };

  const handleImportExamples = () => {
    const result = importExamples();
    if (result.imported > 0) {
      showToast(`Imported ${result.imported} example${result.imported !== 1 ? 's' : ''}`, 'success');
    }
    if (result.errors.length > 0) {
      showToast(`Failed: ${result.errors.join(', ')}`);
    }
  };

  return (
    <div>
      <div class="header">
        <button class="btn-icon" onClick={() => navigate('')} title="Back"><ArrowLeft size={18} /></button>
        <h1>Settings</h1>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">GitHub</div>

        <div class="field">
          <label>Personal Access Token</label>
          <div class="field-row">
            <input
              type="password"
              autocomplete="off"
              value={settings.githubToken}
              onInput={(e) => update({ githubToken: (e.target as HTMLInputElement).value })}
              placeholder="ghp_..."
            />
            <button type="button" class="btn-primary" onClick={handleValidate} disabled={validating}>
              {validating ? '...' : 'Check'}
            </button>
            <button type="button" class="btn-icon" onClick={() => setShowInfo(s => !s)} title="Info" style="flex-shrink:0"><Info size={18} /></button>
          </div>
          {showInfo && (
            <div style="font-size:13px;color:var(--text2);margin-top:6px;padding:8px 12px;background:var(--surface2);border-radius:var(--radius)">
              <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">Generate a token</a> with &ldquo;Contents&rdquo; read-and-write permissions.
            </div>
          )}
          {tokenValid === true && <span style="color:var(--success);font-size:13px">Token valid</span>}
          {tokenValid === false && <span style="color:var(--danger);font-size:13px">Invalid token</span>}
        </div>

        <div class="field">
          <label>Repository</label>
          <div class="field-row">
            <select
              value={settings.repo}
              onChange={(e) => update({ repo: (e.target as HTMLSelectElement).value })}
            >
              <option value="">Select a repository</option>
              {repos.length === 0 && settings.repo && (
                <option value={settings.repo}>{settings.repo}</option>
              )}
              {repos.map((r) => (
                <option key={r.full_name} value={r.full_name}>{r.full_name}</option>
              ))}
            </select>
            <button type="button" class="btn-primary" onClick={handleCheckRepo} disabled={validating || !settings.githubToken || !settings.repo}>
              {validating ? '...' : 'Check'}
            </button>
            <button type="button" class="btn-icon" onClick={() => window.open(`https://github.com/${settings.repo}`, '_blank')} disabled={!settings.repo} title="Open repository" style="flex-shrink:0"><ExternalLink size={18} /></button>
          </div>
          {routineCount !== null && <span style="font-size:13px;color:var(--success)">Found {routineCount} routine{routineCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">General</div>

        <div class="toggle-row">
          <span>Import examples</span>
          <button type="button" class="btn-primary" onClick={handleImportExamples}>
            Import
          </button>
        </div>

        <div class="toggle-row">
          <span>Prepare duration</span>
          <div style="display:flex;align-items:center;gap:4px">
            <DurationStepper
              value={warmupUnit === 'm' ? Math.floor(settings.warmupDuration / 60) : settings.warmupDuration}
              unit={warmupUnit}
              min={0}
              onChange={(value, unit) => {
                setWarmupUnit(unit);
                update({ warmupDuration: unit === 'm' ? value * 60 : value });
              }}
            />
          </div>
        </div>

        <div class="toggle-row">
          <span>Countdown beeps</span>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.enableBeeps}
              onChange={(e) => update({ enableBeeps: (e.target as HTMLInputElement).checked })}
            />
            <span class="toggle-slider" />
          </label>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Announcement</div>

        <div class="toggle-row">
          <span>Current Step</span>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.announceCurrent}
              onChange={(e) => update({ announceCurrent: (e.target as HTMLInputElement).checked })}
            />
            <span class="toggle-slider" />
          </label>
        </div>

        <div class="toggle-row">
          <span>Next Step</span>
          <div style="display:flex;align-items:center;gap:4px">
            <DurationStepper
              value={announceNextUnit === 'm' ? Math.floor(settings.announceNextSeconds / 60) : settings.announceNextSeconds}
              unit={announceNextUnit}
              min={1}
              onChange={(value, unit) => {
                setAnnounceNextUnit(unit);
                update({ announceNextSeconds: unit === 'm' ? value * 60 : value });
              }}
            />
            <label class="toggle">
              <input
                type="checkbox"
                checked={settings.announceNext}
                onChange={(e) => update({ announceNext: (e.target as HTMLInputElement).checked })}
              />
              <span class="toggle-slider" />
            </label>
          </div>
        </div>
        <div class="toggle-row">
          <span>Halfway</span>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.announceHalfway}
              onChange={(e) => update({ announceHalfway: (e.target as HTMLInputElement).checked })}
            />
            <span class="toggle-slider" />
          </label>
        </div>

        <div class="toggle-row">
          <span>Completion</span>
          <label class="toggle">
            <input
              type="checkbox"
              checked={settings.announceCompletion}
              onChange={(e) => update({ announceCompletion: (e.target as HTMLInputElement).checked })}
            />
            <span class="toggle-slider" />
          </label>
        </div>

        <div class="field" style="margin-top:12px">
          <label>Language</label>
          <select
            value={settings.announceLang}
            onChange={(e) => update({ announceLang: (e.target as HTMLSelectElement).value, announceVoiceURI: '' })}
          >
            <option value="">Default</option>
            {langs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div class="field">
          <label>Voice</label>
          <select
            value={settings.announceVoiceURI}
            onChange={(e) => update({ announceVoiceURI: (e.target as HTMLSelectElement).value })}
          >
            <option value="">Default</option>
            {filteredVoices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
            ))}
          </select>
        </div>

        <div class="field">
          <label>Test</label>
          <div class="field-row">
            <input
              value={tryText}
              onInput={(e) => setTryText((e.target as HTMLInputElement).value)}
              placeholder="Type something to test..."
            />
            <button class="btn-primary" onClick={() => { unlockAudio(); speak(tryText, settings.announceLang, settings.announceVoiceURI); }}>Try</button>
          </div>
        </div>
      </div>
    </div>
  );
}
