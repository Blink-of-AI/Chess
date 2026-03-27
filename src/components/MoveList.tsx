'use client';
import { useEffect, useRef } from 'react';
import type { MovePair } from '@/lib/chess-utils';

interface MoveListProps {
  moves: MovePair[];
  result?: string | null;
}

export function MoveList({ moves, result }: MoveListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moves.length]);

  if (moves.length === 0) {
    return (
      <p className="text-gray-600 text-sm text-center py-6">No moves yet</p>
    );
  }

  return (
    <div className="overflow-y-auto max-h-72 pr-1">
      <div className="space-y-0.5">
        {moves.map((pair) => (
          <div key={pair.moveNumber} className="flex gap-2 text-sm font-mono hover:bg-gray-800/50 rounded px-1">
            <span className="text-gray-500 w-7 shrink-0 text-right">{pair.moveNumber}.</span>
            <span className="text-white w-16 shrink-0">{pair.white}</span>
            <span className="text-gray-400 w-16">{pair.black ?? ''}</span>
          </div>
        ))}
        {result && (
          <div className="text-amber-400 text-sm font-bold font-mono text-center pt-2 border-t border-gray-700 mt-2">
            {result}
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
