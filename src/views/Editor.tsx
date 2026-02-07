import { useState, useRef } from 'preact/hooks';
import { navigate } from '../app';
import type { Routine, RoutineNode, Block, Step } from '../types';
import { isBlock, formatDateTime, getNodeKey, calcDuration, formatDuration } from '../types';
import { getRoutine, saveRoutine, deleteRoutine, loadSettings, removeRoutineSha } from '../services/storage';
import { pushRoutine, deleteRoutineRemote } from '../services/github';
import { showToast } from '../services/toast';
import { ArrowLeft, Play, Pause, Delete } from '../icons';

interface NodeEditorProps {
  node: RoutineNode;
  onUpdate: (node: RoutineNode) => void;
  onDelete: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

function NodeEditor({ node, onUpdate, onDelete, onDragStart, onDragOver, onDrop }: NodeEditorProps) {
  const [dragOver, setDragOver] = useState(false);

  if (isBlock(node)) {
    const block = node;
    const updateChild = (index: number, child: RoutineNode) => {
      const children = [...block.children];
      children[index] = child;
      onUpdate({ ...block, children });
    };
    const deleteChild = (index: number) => {
      const children = block.children.filter((_, i) => i !== index);
      onUpdate({ ...block, children });
    };
    const addStep = () => {
      onUpdate({
        ...block,
        children: [...block.children, { label: 'Step', duration: 30 } as Step],
      });
    };
    const addBlock = () => {
      onUpdate({
        ...block,
        children: [
          ...block.children,
          { label: 'Block', repeats: 1, children: [] } as Block,
        ],
      });
    };
    const addBreak = () => {
      onUpdate({
        ...block,
        children: [...block.children, { label: 'Break', duration: 30 } as Step],
      });
    };
    const addPause = () => {
      onUpdate({
        ...block,
        children: [...block.children, { label: 'Pause', duration: 5, pause: true } as Step],
      });
    };

    const blockKey = getNodeKey(block);

    return (
      <div
        class={`editor-node ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { setDragOver(false); onDrop(e); }}
      >
        <div class="editor-node-header" draggable onDragStart={onDragStart}>
          <span class="editor-block-tag">Block</span>
          <input
            class="inline-input"
            value={block.label}
            onInput={(e) => onUpdate({ ...block, label: (e.target as HTMLInputElement).value })}
            style="flex:1"
          />
          <span class="editor-block-total" title={formatDuration(calcDuration(block.children) * block.repeats)}>
            {formatDuration(calcDuration(block.children) * block.repeats)}
          </span>
          <span class="editor-repeat-label">Repeat:</span>
          <div class="num-stepper">
            <button class="num-stepper-btn" type="button" onClick={() => { if (block.repeats > 1) onUpdate({ ...block, repeats: block.repeats - 1 }); }}>-</button>
            <input
              type="number"
              class="inline-input repeats-input"
              value={block.repeats}
              onInput={(e) => {
                const v = parseInt((e.target as HTMLInputElement).value);
                if (v > 0) onUpdate({ ...block, repeats: v });
              }}
              min="1"
            />
            <button class="num-stepper-btn" type="button" onClick={() => onUpdate({ ...block, repeats: block.repeats + 1 })}>+</button>
          </div>
          <button class="btn-icon" onClick={onDelete} title="Delete" style="color:var(--danger)"><Delete size={16} /></button>
        </div>
        <div class="editor-node-body">
          {block.children.map((child, i) => (
            <NodeEditor
              key={getNodeKey(child)}
              node={child}
              onUpdate={(n) => updateChild(i, n)}
              onDelete={() => deleteChild(i)}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer!.setData('text/plain', JSON.stringify({ parentId: blockKey, index: i }));
                e.dataTransfer!.effectAllowed = 'move';
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const data = JSON.parse(e.dataTransfer!.getData('text/plain'));
                  if (data.parentId === blockKey && data.index !== i) {
                    const children = [...block.children];
                    const [moved] = children.splice(data.index, 1);
                    children.splice(i, 0, moved);
                    onUpdate({ ...block, children });
                  }
                } catch { /* ignore invalid drops */ }
              }}
            />
          ))}
          <div class="editor-actions">
            <button class="btn-primary" onClick={addStep}>+ Step</button>
            <button class="btn-primary" onClick={addBlock} style="background:var(--surface2)">+ Block</button>
            <button class="btn-primary" onClick={addBreak} style="background:var(--surface2)">+ Break</button>
            <button class="btn-primary" onClick={addPause} style="background:var(--surface2)">+ Pause</button>
          </div>
        </div>
      </div>
    );
  }

  // Step
  const step = node as Step;
  return (
    <div
      class={`editor-node ${dragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e); }}
    >
      <div class="editor-node-header" draggable onDragStart={onDragStart}>
        <span class="editor-step-tag">Step</span>
        <input
          class="inline-input"
          value={step.label}
          onInput={(e) => onUpdate({ ...step, label: (e.target as HTMLInputElement).value })}
          style="flex:1"
        />
        <div class="num-stepper">
          <button class="num-stepper-btn" type="button" onClick={() => { const inc = step.unit === 'm' ? 1 : 10; if (step.duration > inc) onUpdate({ ...step, duration: step.duration - inc }); }}>-</button>
          <input
            type="number"
            class="inline-input duration-input"
            value={step.duration}
            onInput={(e) => {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (v > 0) onUpdate({ ...step, duration: v });
            }}
            min="1"
          />
          <button class="num-stepper-btn" type="button" onClick={() => { const inc = step.unit === 'm' ? 1 : 10; onUpdate({ ...step, duration: step.duration + inc }); }}>+</button>
          <button type="button" class="num-stepper-btn num-stepper-unit" onClick={() => onUpdate({ ...step, unit: step.unit === 'm' ? 's' : 'm' })}>{step.unit === 'm' ? 'm' : 's'}</button>
        </div>
        <button
          class="btn-icon"
          aria-pressed={step.pause}
          onClick={() => onUpdate({ ...step, pause: !step.pause })}
          title={step.pause ? 'Pause (on)' : 'Pause (off)'}
        >
          <Pause size={16} />
        </button>
        <button class="btn-icon" onClick={onDelete} title="Delete" style="color:var(--danger)"><Delete size={16} /></button>
      </div>
    </div>
  );
}

export function Editor({ filename: initialFilename }: { filename: string }) {
  const loaded = useRef(getRoutine(initialFilename));
  const [routine, setRoutine] = useState<Routine | null>(loaded.current ?? null);
  const [saving, setSaving] = useState(false);
  const [filename, setFilename] = useState(initialFilename);
  const currentFilenameRef = useRef(initialFilename);

  if (!routine) {
    return (
      <div>
        <div class="header">
          <button class="btn-icon" onClick={() => navigate('')}><ArrowLeft size={18} /></button>
          <h1>Not Found</h1>
        </div>
        <div class="empty">Routine not found.</div>
      </div>
    );
  }

  const updateNode = (index: number, node: RoutineNode) => {
    const data = [...routine.data];
    data[index] = node;
    setRoutine({ ...routine, data, edited: new Date().toISOString() });
  };

  const deleteNode = (index: number) => {
    const data = routine.data.filter((_, i) => i !== index);
    setRoutine({ ...routine, data, edited: new Date().toISOString() });
  };

  const addStep = () => {
    setRoutine({
      ...routine,
      data: [...routine.data, { label: 'Step', duration: 30 } as Step],
      edited: new Date().toISOString(),
    });
  };

  const addBlock = () => {
    setRoutine({
      ...routine,
      data: [...routine.data, { label: 'Block', repeats: 1, children: [] } as Block],
      edited: new Date().toISOString(),
    });
  };

  const addBreak = () => {
    setRoutine({
      ...routine,
      data: [...routine.data, { label: 'Break', duration: 30 } as Step],
      edited: new Date().toISOString(),
    });
  };

  const addPause = () => {
    setRoutine({
      ...routine,
      data: [...routine.data, { label: 'Pause step', duration: 5, pause: true } as Step],
      edited: new Date().toISOString(),
    });
  };

  const handleSave = async () => {
    if (!routine) return;

    const oldFilename = currentFilenameRef.current;
    const newFilename = filename.replace(/\.json$/, '').trim() || currentFilenameRef.current;
    const renamed = newFilename !== oldFilename;
    const updated = { ...routine, edited: new Date().toISOString() };

    // Handle rename
    if (renamed) {
      deleteRoutine(oldFilename);
      currentFilenameRef.current = newFilename;
    }

    saveRoutine(newFilename, updated);
    setRoutine(updated);
    setFilename(newFilename);

    const settings = loadSettings();
    if (settings.githubToken && settings.repo) {
      setSaving(true);
      try {
        await pushRoutine(settings.repo, settings.githubToken, newFilename, updated);
        if (renamed) {
          await deleteRoutineRemote(settings.repo, settings.githubToken, oldFilename);
        }
        showToast('Saved', 'success');
      } catch {
        showToast('GitHub sync failed');
      } finally {
        setSaving(false);
      }
    } else {
      if (renamed) {
        removeRoutineSha(oldFilename);
      }
      showToast('Saved', 'success');
    }
  };

  return (
    <div>
      <div class="header">
        <button class="btn-icon" onClick={() => navigate('')}><ArrowLeft size={18} /></button>
        <input
          class="inline-input"
          value={routine.name}
          onInput={(e) => setRoutine({ ...routine, name: (e.target as HTMLInputElement).value })}
          style="font-size:20px;font-weight:600;flex:1"
        />
        <button class="btn-icon" onClick={() => { saveRoutine(currentFilenameRef.current, { ...routine, edited: new Date().toISOString() }); navigate('run/' + currentFilenameRef.current); }} title="Run"><Play size={20} /></button>
        <button class="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div class="field" style="margin-bottom:8px">
        <label>Filename</label>
        <input
          value={filename}
          onInput={(e) => setFilename((e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="editor-meta" style="font-size:14px">
        {routine.executed && <div><span class="editor-meta-label">Executed</span> {formatDateTime(routine.executed)}</div>}
        {routine.edited && <div><span class="editor-meta-label">Updated</span> {formatDateTime(routine.edited)}</div>}
        {routine.created && <div><span class="editor-meta-label">Created</span> {formatDateTime(routine.created)}</div>}
        <div><span class="editor-meta-label">Total</span> {formatDuration(calcDuration(routine.data))}</div>
      </div>

      {routine.data.map((node, i) => (
        <NodeEditor
          key={getNodeKey(node)}
          node={node}
          onUpdate={(n) => updateNode(i, n)}
          onDelete={() => deleteNode(i)}
          onDragStart={() => { }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { }}
        />
      ))}

      <div class="editor-actions">
        <button class="btn-primary" onClick={addStep}>+ Step</button>
        <button class="btn-primary" onClick={addBlock} style="background:var(--surface2)">+ Block</button>
        <button class="btn-primary" onClick={addBreak} style="background:var(--surface2)">+ Break</button>
        <button class="btn-primary" onClick={addPause} style="background:var(--surface2)">+ Pause</button>
      </div>

      <datalist id="duration-presets">
        {[5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 300].map(n => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
