'use client';
import { useState } from 'react';

type Mode = 'human' | 'ai';
type AiColor = 'white' | 'black' | 'random';

interface GameModeModalProps {
  onClose: () => void;
  onCreate: (mode: Mode, aiColor?: AiColor) => void;
  creating: boolean;
}

export function GameModeModal({ onClose, onCreate, creating }: GameModeModalProps) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [aiColor, setAiColor] = useState<AiColor>('white');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">New Game</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        {!mode ? (
          /* Step 1: choose mode */
          <div className="space-y-3">
            <p className="text-gray-400 text-sm mb-4">Who do you want to play against?</p>

            <button
              onClick={() => onCreate('human')}
              className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-amber-500/50 rounded-lg transition-colors text-left group"
            >
              <span className="text-3xl">🧑‍🤝‍🧑</span>
              <div>
                <div className="text-white font-semibold group-hover:text-amber-300 transition-colors">Invite a Friend</div>
                <div className="text-gray-500 text-xs mt-0.5">Share a link — play online together</div>
              </div>
            </button>

            <button
              onClick={() => setMode('ai')}
              className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-amber-500/50 rounded-lg transition-colors text-left group"
            >
              <span className="text-3xl">🤖</span>
              <div>
                <div className="text-white font-semibold group-hover:text-amber-300 transition-colors">Play vs Stockfish</div>
                <div className="text-gray-500 text-xs mt-0.5">High-ELO chess engine (~2400)</div>
              </div>
            </button>
          </div>
        ) : (
          /* Step 2: choose color vs AI */
          <div className="space-y-5">
            <button onClick={() => setMode(null)} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1">
              ← Back
            </button>

            <div>
              <p className="text-gray-400 text-sm mb-3">Play as:</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'white', label: '♙ White', sub: 'You go first' },
                  { value: 'black', label: '♟ Black', sub: 'AI goes first' },
                  { value: 'random', label: '🎲 Random', sub: 'Surprise me' },
                ] as { value: AiColor; label: string; sub: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAiColor(opt.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      aiColor === opt.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.label.split(' ')[0]}</div>
                    <div className="text-xs font-medium">{opt.label.split(' ')[1]}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onCreate('ai', aiColor)}
              disabled={creating}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-lg transition-colors"
            >
              {creating ? 'Starting...' : 'Play vs Stockfish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
