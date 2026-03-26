"use client";

import { useState, useEffect, useCallback } from "react";

interface SpellingWord {
  id?: number;
  word: string;
  hint?: string;
}

interface SpellingList {
  id: number;
  name: string;
  is_active: number;
  created_at: string;
  words: SpellingWord[];
}

export default function SpellingsPage() {
  const [lists, setLists] = useState<SpellingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingList, setEditingList] = useState<SpellingList | null>(null);
  const [formName, setFormName] = useState("");
  const [formWords, setFormWords] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchLists = useCallback(async () => {
    try {
      const res = await fetch("/api/spellings");
      const data = await res.json();
      setLists(data);
    } catch {
      setError("Failed to load spelling lists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const parseWords = (text: string): SpellingWord[] => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Support "word - hint" or "word | hint" or just "word"
        const separators = [" - ", " | ", "\t"];
        for (const sep of separators) {
          const idx = line.indexOf(sep);
          if (idx > 0) {
            return {
              word: line.substring(0, idx).trim(),
              hint: line.substring(idx + sep.length).trim() || undefined,
            };
          }
        }
        return { word: line };
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const words = parseWords(formWords);
    if (words.length === 0) {
      setError("Please enter at least one word");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/spellings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, words }),
      });

      if (res.ok) {
        setFormName("");
        setFormWords("");
        setShowForm(false);
        await fetchLists();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create list");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList) return;
    setSaving(true);
    setError("");

    const words = parseWords(formWords);

    try {
      const res = await fetch(`/api/spellings/${editingList.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, words }),
      });

      if (res.ok) {
        setEditingList(null);
        setFormName("");
        setFormWords("");
        await fetchLists();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update list");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      const res = await fetch(`/api/spellings/${id}/activate`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchLists();
      }
    } catch {
      setError("Failed to activate list");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" and all its words?`)) return;

    try {
      const res = await fetch(`/api/spellings/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchLists();
      }
    } catch {
      setError("Failed to delete list");
    }
  };

  const startEdit = (list: SpellingList) => {
    setEditingList(list);
    setFormName(list.name);
    setFormWords(
      list.words
        .map((w) => (w.hint ? `${w.word} - ${w.hint}` : w.word))
        .join("\n")
    );
    setShowForm(false);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingList(null);
    setFormName("");
    setFormWords("");
    setError("");
  };

  if (loading) {
    return <div className="text-stone-400">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Spelling Lists</h1>
        {!showForm && !editingList && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + New List
          </button>
        )}
      </div>

      {error && (
        <div className="msg-error mb-4">
          {error}
        </div>
      )}

      {(showForm || editingList) && (
        <form
          onSubmit={editingList ? handleUpdate : handleCreate}
          className="admin-card p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-stone-800 mb-4">
            {editingList ? "Edit List" : "New Spelling List"}
          </h2>

          <div className="mb-4">
            <label
              htmlFor="list-name"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              List Name
            </label>
            <input
              id="list-name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="input-admin"
              placeholder="e.g. Week 5 Words"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="list-words"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Words{" "}
              <span className="text-stone-400 font-normal">
                (one per line, optionally add hint with &ldquo; - &rdquo;)
              </span>
            </label>
            <textarea
              id="list-words"
              value={formWords}
              onChange={(e) => setFormWords(e.target.value)}
              className="textarea-admin h-48"
              placeholder={`because - a reason word\nfriend\nbeautiful - means very pretty`}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
            >
              {saving
                ? "Saving…"
                : editingList
                  ? "Update List"
                  : "Create List"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="btn-admin-text"            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {lists.length === 0 ? (
        <div className="admin-card p-8 text-center text-stone-500">
          No spelling lists yet. Create one to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="admin-card-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-800">
                      {list.name}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {list.words.length} word{list.words.length !== 1 && "s"} ·
                      Created{" "}
                      {new Date(list.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {list.is_active === 1 && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {list.is_active !== 1 && (
                    <button
                      onClick={() => handleActivate(list.id)}
                      className="text-sm text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(list)}
                    className="text-sm text-stone-500 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(list.id, list.name)}
                    className="btn-admin-text-danger px-2 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {list.words.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {list.words.map((word, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-100 text-stone-700 text-xs px-2 py-1 rounded"
                      title={word.hint || undefined}
                    >
                      {word.word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
