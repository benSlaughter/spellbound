'use client';

import { useState, useEffect } from 'react';

interface FeedbackEntry {
  id: number;
  message: string;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/feedback')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch feedback');
        return res.json();
      })
      .then((data: FeedbackEntry[]) => setFeedback(data))
      .catch(() => setError('Failed to load feedback.'))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="page-container-narrow">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Feedback</h1>

      {loading && (
        <p className="text-stone-500">Loading feedback...</p>
      )}

      {error && (
        <p className="text-red-500 font-semibold">{error}</p>
      )}

      {!loading && !error && feedback.length === 0 && (
        <div className="admin-card p-8 text-center">
          <p className="text-stone-500">No feedback submitted yet.</p>
        </div>
      )}

      {!loading && !error && feedback.length > 0 && (
        <div className="grid gap-4">
          {feedback.map((entry) => (
            <div
              key={entry.id}
              className="admin-card p-5"
            >
              <p className="text-stone-800 whitespace-pre-wrap">{entry.message}</p>
              <p className="text-sm text-stone-400 mt-3">
                {formatDate(entry.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
