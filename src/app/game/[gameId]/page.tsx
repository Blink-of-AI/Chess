'use client';
import { use, useEffect, useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { MoveList } from '@/components/MoveList';
import { UsernameModal } from '@/components/UsernameModal';
import {
  parseMovePairs,
  getStatusText,
  getPlayerColor,
} from '@/lib/chess-utils';
import type { GameData } from '@/lib/types';
import Link from 'next/link';

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);

  const [username, setUsername] = useState<string | null>(null);
  const [game, setGame] = useState<GameData | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [resigning, setResigning] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastUpdatedAt = useRef<string | null>(null);

  // Load username from localStorage
  useEffect(() => {
    setUsername(localStorage.getItem('chess_username'));
  }, []);

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`);
      if (!res.ok) {
        setPageError('Game not found');
        setLoading(false);
        return;
      }
      const data: GameData = await res.json();
      // Only update state when the server has new data
      if (data.updatedAt !== lastUpdatedAt.current) {
        lastUpdatedAt.current = data.updatedAt;
        setGame(data);
      }
    } catch {
      // silent on poll errors
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Initial load + 2-second polling
  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  function saveUsername(name: string) {
    localStorage.setItem('chess_username', name);
    setUsername(name);
  }

  async function joinGame() {
    if (!username || !game) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMoveError(data.error);
      } else {
        lastUpdatedAt.current = data.updatedAt;
        setGame(data);
      }
    } finally {
      setJoining(false);
    }
  }

  async function onPieceDrop(
    sourceSquare: string,
    targetSquare: string
  ): Promise<boolean> {
    if (!username || !game) return false;
    setMoveError(null);

    // Detect pawn promotion
    const chess = new Chess(game.fen);
    const moves = chess.moves({ square: sourceSquare as Parameters<typeof chess.moves>[0]['square'], verbose: true });
    const isPromotion = moves.some(
      (m) => 'to' in m && m.to === targetSquare && m.flags.includes('p')
    );

    const res = await fetch(`/api/games/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        from: sourceSquare,
        to: targetSquare,
        promotion: isPromotion ? 'q' : undefined, // auto-promote to queen
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMoveError(data.error);
      return false;
    }

    lastUpdatedAt.current = data.updatedAt;
    setGame(data);
    return true;
  }

  async function resign() {
    if (!username || !game || resigning) return;
    if (!confirm('Resign this game?')) return;
    setResigning(true);
    try {
      const res = await fetch(`/api/games/${gameId}/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        const data = await res.json();
        lastUpdatedAt.current = data.updatedAt;
        setGame(data);
      }
    } finally {
      setResigning(false);
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading game...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 text-lg">{pageError}</p>
          <Link href="/" className="text-amber-400 hover:underline text-sm">
            ← Back to lobby
          </Link>
        </div>
      </div>
    );
  }

  if (!game) return null;

  // ── Derived state ────────────────────────────────────────────────────────
  const playerColor = username ? getPlayerColor(game, username) : null;
  const isPlayer = playerColor !== null;
  const chess = new Chess(game.fen);
  const isMyTurn =
    isPlayer &&
    ((playerColor === 'white' && chess.turn() === 'w') ||
      (playerColor === 'black' && chess.turn() === 'b'));

  const movePairs = parseMovePairs(game.pgn);
  const statusText = username ? getStatusText(game, username) : 'Spectating';

  const canJoin =
    game.status === 'WAITING' &&
    !!username &&
    game.whitePlayer !== username &&
    !game.blackPlayer;

  const canResign = isPlayer && game.status === 'ACTIVE';

  const statusColor =
    game.status === 'FINISHED'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
      : game.status === 'WAITING'
      ? 'border-yellow-600/30 bg-yellow-500/10 text-yellow-200'
      : chess.isCheck()
      ? 'border-red-500/40 bg-red-500/10 text-red-300'
      : 'border-green-600/30 bg-green-500/10 text-green-200';

  return (
    <div className="min-h-screen bg-gray-950">
      {!username && <UsernameModal onSave={saveUsername} />}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-lg">♛</span>
            <span className="font-semibold text-sm">Chess Online</span>
          </Link>
          {username && (
            <span className="text-amber-300 text-sm font-medium">{username}</span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Board column ──────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            {/* Black player */}
            <div className="w-full max-w-[560px] flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">♟</span>
                <span
                  className={`font-semibold ${
                    playerColor === 'black' ? 'text-amber-300' : 'text-gray-300'
                  }`}
                >
                  {game.blackPlayer ?? 'Waiting for opponent...'}
                </span>
              </div>
              {chess.turn() === 'b' && game.status === 'ACTIVE' && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>

            {/* Chessboard */}
            <div className="w-full max-w-[560px]">
              <Chessboard
                position={game.fen}
                onPieceDrop={onPieceDrop}
                boardOrientation={playerColor === 'black' ? 'black' : 'white'}
                arePiecesDraggable={isMyTurn && game.status === 'ACTIVE'}
                customBoardStyle={{
                  borderRadius: '4px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
                }}
              />
            </div>

            {/* White player */}
            <div className="w-full max-w-[560px] flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">♙</span>
                <span
                  className={`font-semibold ${
                    playerColor === 'white' ? 'text-amber-300' : 'text-gray-300'
                  }`}
                >
                  {game.whitePlayer}
                </span>
              </div>
              {chess.turn() === 'w' && game.status === 'ACTIVE' && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
            {/* Status banner */}
            <div className={`border rounded-lg px-4 py-3 text-sm font-medium ${statusColor}`}>
              {statusText}
            </div>

            {/* Join button */}
            {canJoin && (
              <button
                onClick={joinGame}
                disabled={joining}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-lg transition-colors"
              >
                {joining ? 'Joining...' : 'Join as Black'}
              </button>
            )}

            {/* Share link — shown while waiting */}
            {game.status === 'WAITING' && isPlayer && (
              <div className="border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-2 font-medium">
                  Share this link with your opponent:
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 min-w-0 text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-400 truncate focus:outline-none"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors shrink-0"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Move error */}
            {moveError && (
              <div className="text-red-400 text-sm border border-red-800/50 bg-red-900/20 rounded-lg px-4 py-2">
                {moveError}
              </div>
            )}

            {/* Move list */}
            <div className="border border-gray-700 rounded-lg p-4">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Moves
              </h3>
              <MoveList moves={movePairs} result={game.result} />
            </div>

            {/* PGN */}
            {game.pgn && (
              <div className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    PGN
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(game.pgn)}
                    className="text-gray-600 hover:text-gray-300 text-xs transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap break-all leading-relaxed max-h-24 overflow-y-auto">
                  {game.pgn}
                </pre>
              </div>
            )}

            {/* Resign */}
            {canResign && (
              <button
                onClick={resign}
                disabled={resigning}
                className="w-full py-2 border border-red-900/50 hover:bg-red-900/20 text-red-500 text-sm rounded-lg transition-colors"
              >
                {resigning ? 'Resigning...' : 'Resign'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
