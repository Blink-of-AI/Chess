'use client';
import { useEffect, useState, useCallback } from 'react';
import { UsernameModal } from '@/components/UsernameModal';
import { GameModeModal } from '@/components/GameModeModal';
import { GameCard } from '@/components/GameCard';
import type { GameData } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LobbyPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('chess_username');
    setUsername(stored);
  }, []);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/games');
      if (res.ok) setGames(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 3000);
    return () => clearInterval(interval);
  }, [fetchGames]);

  function saveUsername(name: string) {
    localStorage.setItem('chess_username', name);
    setUsername(name);
  }

  async function createGame(mode: 'human' | 'ai', aiColor?: 'white' | 'black' | 'random') {
    if (!username) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, isAiGame: mode === 'ai', aiColor }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModeModal(false);
        router.push(`/game/${data.id}`);
      } else {
        setCreateError(data.error ?? 'Failed to create game');
      }
    } catch {
      setCreateError('Cannot reach server.');
    } finally {
      setCreating(false);
    }
  }

  const myGames = games.filter(
    (g) => g.whitePlayer === username || g.blackPlayer === username
  );
  const openGames = games.filter(
    (g) => g.status === 'WAITING' && g.whitePlayer !== username
  );
  const recentFinished = games
    .filter((g) => g.status === 'FINISHED')
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-950">
      {!username && <UsernameModal onSave={saveUsername} />}
      {showModeModal && (
        <GameModeModal
          onClose={() => setShowModeModal(false)}
          onCreate={createGame}
          creating={creating}
        />
      )}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♛</span>
            <span className="text-lg font-bold text-white">Chess Online</span>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Playing as</span>
                <span className="text-amber-300 font-semibold">{username}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('chess_username');
                    setUsername(null);
                  }}
                  className="text-gray-600 hover:text-gray-400 text-xs underline ml-1"
                >
                  change
                </button>
              </div>
            )}
            <Link
              href="/games"
              className="text-gray-500 hover:text-gray-200 text-sm transition-colors"
            >
              History
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero + Create */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Chess Lobby</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Create a game and share the link — no account needed.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => username ? setShowModeModal(true) : undefined}
              disabled={!username}
              title={!username ? 'Enter a username first' : undefined}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors text-sm"
            >
              {!username ? '+ New Game (set username first)' : '+ New Game'}
            </button>
            {createError && (
              <p className="text-red-400 text-xs max-w-xs text-right">{createError}</p>
            )}
          </div>
        </div>

        {/* My Games */}
        {myGames.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              My Games
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myGames.map((game) => (
                <GameCard key={game.id} game={game} username={username ?? ''} />
              ))}
            </div>
          </section>
        )}

        {/* Open Games */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Open Games — Join as Black
          </h2>
          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading...</p>
          ) : openGames.length === 0 ? (
            <div className="border border-dashed border-gray-800 rounded-lg py-10 text-center text-gray-600 text-sm">
              No open games right now. Create one!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {openGames.map((game) => (
                <GameCard key={game.id} game={game} username={username ?? ''} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Finished */}
        {recentFinished.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Recent Results
              </h2>
              <Link href="/games" className="text-amber-500 hover:text-amber-400 text-xs">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentFinished.map((game) => (
                <GameCard key={game.id} game={game} username={username ?? ''} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
