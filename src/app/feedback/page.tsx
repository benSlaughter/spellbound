'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Button from '@/components/ui/Button';
import { PaperPlaneTilt } from '@phosphor-icons/react';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = message.trim();
    if (trimmed.length < 1 || trimmed.length > 1000) {
      setError('Message must be between 1 and 1,000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
      setMessage('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <Breadcrumbs />

      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto w-full">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-garden-text">
            Feedback
          </h1>
          <p className="mt-2 text-lg text-garden-text-light font-semibold">
            Tell us what you think!
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="game-card p-8 text-center w-full"
          >
            <p className="text-2xl font-extrabold text-primary mb-2">🎉</p>
            <p className="text-xl font-bold text-garden-text">
              Thanks for your feedback!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Send more feedback
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="game-card p-6 w-full flex flex-col gap-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to tell us?"
              maxLength={1000}
              rows={6}
              className="w-full rounded-2xl border-2 border-garden-border bg-white p-4 text-lg text-garden-text placeholder:text-garden-text-light/50 focus:outline-none focus:border-primary resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-garden-text-light">
                {message.trim().length}/1,000
              </span>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<PaperPlaneTilt weight="duotone" size={22} />}
                disabled={submitting || message.trim().length === 0}
              >
                {submitting ? 'Sending...' : 'Send'}
              </Button>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold text-center">{error}</p>
            )}
          </form>
        )}
      </div>
    </motion.div>
  );
}
