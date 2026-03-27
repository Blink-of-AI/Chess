import type { GameData } from '@/lib/types';
import Link from 'next/link';

interface GameCardProps {
  game: GameData;
  username: string;
}

const STATUS_STYLE: Record<string, string> = {
  WAITING: 'bg-yellow-500/20 text-yellow-300 border-yellow-600/30',
  ACTIVE: 'bg-green-500/20 text-green-300 border-green-600/30',
  FINISHED: 'bg-gray-500/20 text-gray-400 border-gray-600/30',
};

const STATUS_LABEL: Record<string, string> = {
  WAITING: 'Open',
  ACTIVE: 'Live',
  FINISHED: 'Finished',
};

export function GameCard({ game, username }: GameCardProps) {
  const isMyGame = game.whitePlayer === username || game.blackPlayer === username;
  const canJoin = game.status === 'WAITING' && game.whitePlayer !== username;

  return (
    <Link href={`/game/${game.id}`}>
      <div
        className={`border rounded-lg p-4 hover:border-amber-500/50 transition-colors cursor-pointer ${
          isMyGame
            ? 'bg-gray-800/60 border-gray-600'
            : 'bg-gray-900/40 border-gray-700/60'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${
              STATUS_STYLE[game.status] ?? STATUS_STYLE.FINISHED
            }`}
          >
            {STATUS_LABEL[game.status] ?? game.status}
          </span>
          <span className="text-gray-600 text-xs">
            {new Date(game.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">♙</span>
            <span
              className={`text-sm font-medium ${
                game.whitePlayer === username ? 'text-amber-300' : 'text-white'
              }`}
            >
              {game.whitePlayer}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base">♟</span>
            <span
              className={`text-sm font-medium ${
                game.blackPlayer === username ? 'text-amber-300' : 'text-gray-400'
              }`}
            >
              {game.blackPlayer ?? '???'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {game.result ? (
            <span className="text-amber-400 font-bold text-sm">{game.result}</span>
          ) : (
            <span className="text-gray-600 text-xs">{game.moves.length} moves</span>
          )}
          {canJoin && (
            <span className="text-amber-400 text-xs font-medium">Join →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
