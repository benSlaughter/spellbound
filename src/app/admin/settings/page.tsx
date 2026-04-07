"use client";

import { useState, useEffect, useCallback } from "react";

interface Settings {
  hasPassword: boolean;
  sounds_enabled?: string;
  [key: string]: string | boolean | undefined;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [learnerName, setLearnerName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/profile"),
      ]);
      const data = await settingsRes.json();
      setSettings(data);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setLearnerName(profile.name || "");
      }
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        setMessage(`Setting "${key}" updated`);
        await fetchSettings();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update setting");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (settings?.hasPassword) {
      if (!currentPassword) {
        setError("Current password is required");
        return;
      }

      // Verify old password first
      try {
        const verifyRes = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: currentPassword }),
        });

        if (!verifyRes.ok) {
          setError("Current password is incorrect");
          return;
        }
      } catch {
        setError("Connection error");
        return;
      }
    }

    await updateSetting("admin_password", newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully");
  };

  const handleToggleSounds = async () => {
    const current = settings?.sounds_enabled !== "false";
    await updateSetting("sounds_enabled", current ? "false" : "true");
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnerName.trim()) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: learnerName.trim() }),
      });
      if (res.ok) {
        setMessage("Learner name updated");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update name");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      // Reset progress by deleting all entries for the default profile
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "reset_progress", value: "true" }),
      });

      if (res.ok) {
        setMessage("Progress has been reset");
        setShowResetConfirm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset progress");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-stone-400">Loading…</div>;
  }

  const soundsEnabled = settings?.sounds_enabled !== "false";

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Settings</h1>

      {message && (
        <div className="msg-success mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="msg-error mb-4">
          {error}
        </div>
      )}

      {/* Learner Name */}
      <section className="admin-card mb-4">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Learner Name
        </h2>
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label
              htmlFor="learner-name"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Shown in greetings and around the app
            </label>
            <input
              id="learner-name"
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value)}
              className="input-admin"
              placeholder="e.g. Rosie"
              maxLength={50}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving || !learnerName.trim()}
            className="btn-admin-primary"
          >
            {saving ? "Saving…" : "Save Name"}
          </button>
        </form>
      </section>

      {/* Change Password */}
      <section className="admin-card mb-4">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">
          Change Admin Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {settings?.hasPassword && (
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-admin"
                required
              />
            </div>
          )}
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-admin"
              required
              minLength={8}
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-admin"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-admin-primary"
          >
            {saving ? "Saving…" : "Update Password"}
          </button>
        </form>
      </section>

      {/* Sounds */}
      <section className="admin-card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Sounds</h2>
            <p className="text-sm text-stone-500">
              Enable or disable game sounds
            </p>
          </div>
          <button
            onClick={handleToggleSounds}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              soundsEnabled ? "bg-green-600" : "bg-stone-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                soundsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Reset Progress */}
      <section className="admin-card">
        <h2 className="text-lg font-semibold text-stone-800 mb-2">
          Reset Progress
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          This will delete all progress records and achievements. This cannot be
          undone.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-admin-danger-light text-sm"
          >
            Reset All Progress
          </button>
        ) : (
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-700 font-medium mb-3">
              Are you sure? All progress and achievements will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetProgress}
                disabled={saving}
                className="btn-admin-danger disabled:opacity-50 text-sm"
              >
                {saving ? "Resetting…" : "Yes, Reset Everything"}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-admin-text"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
