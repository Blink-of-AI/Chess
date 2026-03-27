'use client';
import Link from 'next/link';

interface GameEndModalProps {
  result: string;        // "1-0" | "0-1" | "1/2-1/2"
  whitePlayer: string;
  blackPlayer: string;
  username: string;
  onClose: () => void;
}

function getOutcome(result: string, whitePlayer: string, blackPlayer: string, username: string) {
  if (result === '1/2-1/2') {
    return { icon: '🤝', headline: 'Draw', sub: '½ – ½', color: 'text-amber-300' };
  }
  const winner = result === '1-0' ? whitePlayer : blackPlayer;
  const loser  = result === '1-0' ? blackPlayer : whitePlayer;
  const iWon   = winner === username;
  return {
    icon: iWon ? '👑' : '🏳️',
    headline: iWon ? 'You Win!' : 'You Lose',
    sub: `${winner} defeated ${loser}`,
    color: iWon ? 'text-amber-300' : 'text-gray-400',
  };
}

export function GameEndModal({ result, whitePlayer, blackPlayer, username, onClose }: GameEndModalProps) {
  const { icon, headline, sub, color } = getOutcome(result, whitePlayer, blackPlayer, username);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in duration-200">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className={`text-3xl font-bold mb-2 ${color}`}>{headline}</h2>
        <p className="text-gray-400 text-sm mb-1">{sub}</p>
        <p className="text-gray-600 text-xs mb-8 font-mono">{result}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors text-sm"
          >
            New Game
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 rounded-xl transition-colors text-sm"
          >
            View Board
          </button>
        </div>
      </div>
    </div>
  );
}
