'use client';

import { useState, useEffect } from 'react';

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function TablesAdmin() {
  const [selected, setSelected] = useState<number[]>(ALL_TABLES);
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

  function selectAll() {
    setSelected(ALL_TABLES);
    setMessage(null);
  }

  function deselectAll() {
    setSelected([1]);
    setMessage(null);
  }

  async function save() {
    if (selected.length === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const sorted = [...selected].sort((a, b) => a - b);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'maths_tables', value: sorted.join(',') }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Saved successfully' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
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
        <p className="text-stone-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Times Tables Selection</h1>
      <p className="text-sm text-stone-500 mb-6">
        Choose which times tables the student should practise. At least one must be selected.
      </p>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-700">Tables 1–12</h2>
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

      {message && (
        <div
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || selected.length === 0}
        className="mt-6 w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
