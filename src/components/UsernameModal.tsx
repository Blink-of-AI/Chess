'use client';
import { useState } from 'react';

interface UsernameModalProps {
  onSave: (username: string) => void;
}

export function UsernameModal({ onSave }: UsernameModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a username');
      return;
    }
    if (trimmed.length < 2) {
      setError('At least 2 characters required');
      return;
    }
    if (trimmed.length > 20) {
      setError('Max 20 characters');
      return;
    }
    onSave(trimmed);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-5xl">♛</span>
          <h2 className="text-2xl font-bold text-white mt-3">Chess Online</h2>
          <p className="text-gray-400 text-sm mt-1">Choose a username to play</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="Your username..."
            autoFocus
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
          >
            Start Playing
          </button>
        </form>
      </div>
    </div>
  );
}
