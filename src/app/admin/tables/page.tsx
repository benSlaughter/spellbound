'use client';

import { useState, useEffect } from 'react';

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ALL_DIFFICULTIES = [
  { key: 'seedling', label: 'Seedling', desc: 'Multiplication 1-6' },
  { key: 'sapling', label: 'Sapling', desc: 'Multiplication 1-12' },
  { key: 'tree', label: 'Tree', desc: 'Multiplication & division' },
  { key: 'mighty_oak', label: 'Mighty Oak', desc: 'Division focus' },
];

export default function TablesAdmin() {
  const [selected, setSelected] = useState<number[]>(ALL_TABLES);
  const [difficulties, setDifficulties] = useState<string[]>(ALL_DIFFICULTIES.map((d) => d.key));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.maths_tables) {
          const tables = String(data.maths_tables)
            .split(',')
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((n: number) => !isNaN(n) && n >= 1 && n <= 12);
          if (tables.length > 0) setSelected(tables);
        }
        if (data.maths_difficulties) {
          const diffs = String(data.maths_difficulties)
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => ALL_DIFFICULTIES.some((d) => d.key === s));
          if (diffs.length > 0) setDifficulties(diffs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(n: number) {
    setSelected((prev) => {
      if (prev.includes(n)) {
        const next = prev.filter((t) => t !== n);
        return next.length === 0 ? prev : next;
      }
      return [...prev, n];
    });
    setMessage(null);
  }

  function toggleDifficulty(key: string) {
    setDifficulties((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((d) => d !== key);
        return next.length === 0 ? prev : next;
      }
      return [...prev, key];
    });
    setMessage(null);
  }

  function selectAll() {
    setSelected(ALL_TABLES);
    setMessage(null);
  }

  function deselectAll() {
    setSelected([1]);
    setMessage(null);
  }

  async function save() {
    if (selected.length === 0 || difficulties.length === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const sorted = [...selected].sort((a, b) => a - b);
      const res1 = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maths_tables', value: sorted.join(',') }),
      });

      const orderedDiffs = ALL_DIFFICULTIES.filter((d) => difficulties.includes(d.key)).map((d) => d.key);
      const res2 = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maths_difficulties', value: orderedDiffs.join(',') }),
      });

      if (res1.ok && res2.ok) {
        setMessage({ type: 'success', text: 'Saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Maths Configuration</h1>
      <p className="text-sm text-stone-500 mb-6">
        Choose which times tables and difficulty levels are available to the student.
      </p>

      {/* Tables */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-700">Times Tables</h2>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors cursor-pointer"
            >
              Select All
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={deselectAll}
              className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {ALL_TABLES.map((n) => {
            const active = selected.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                className={`
                  w-full aspect-square rounded-xl font-bold text-lg
                  flex items-center justify-center cursor-pointer
                  transition-all duration-150
                  ${
                    active
                      ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-400/50'
                      : 'bg-stone-100 text-stone-400 border border-stone-200 hover:border-green-300'
                  }
                `}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-stone-500">
          {selected.length} of 12 tables selected
        </div>
      </div>

      {/* Difficulties */}
      <div className="admin-card mb-6">
        <h2 className="text-lg font-semibold text-stone-700 mb-4">Difficulty Levels</h2>
        <p className="text-sm text-stone-500 mb-4">
          Choose which difficulty levels the student can see. At least one must be enabled.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_DIFFICULTIES.map((d) => {
            const active = difficulties.includes(d.key);
            return (
              <button
                key={d.key}
                onClick={() => toggleDifficulty(d.key)}
                className={`
                  rounded-xl px-4 py-3 text-left cursor-pointer
                  transition-all duration-150
                  ${
                    active
                      ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-400/50'
                      : 'bg-stone-100 text-stone-400 border border-stone-200 hover:border-green-300'
                  }
                `}
              >
                <span className="font-bold text-sm">{d.label}</span>
                <span className={`block text-xs mt-0.5 ${active ? 'text-green-100' : 'text-stone-400'}`}>
                  {d.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-stone-500">
          {difficulties.length} of 4 levels enabled
        </div>
      </div>

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === 'success'
              ? 'msg-success'
              : 'msg-error'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || selected.length === 0 || difficulties.length === 0}
        className="btn-admin-primary mt-6"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
