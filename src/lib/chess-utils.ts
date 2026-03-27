import { Chess } from 'chess.js';
import type { GameData } from './types';

export interface MovePair {
  moveNumber: number;
  white: string;
  black: string | null;
}

export function parseMovePairs(pgn: string): MovePair[] {
  if (!pgn) return [];
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }
  const history = chess.history();
  const pairs: MovePair[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] ?? null,
    });
  }
  return pairs;
}

export function getGameResult(chess: Chess): string | null {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? '0-1' : '1-0';
  }
  if (chess.isDraw()) {
    return '1/2-1/2';
  }
  return null;
}

export function getStatusText(game: GameData, username: string): string {
  if (game.status === 'WAITING') {
    return game.whitePlayer === username
      ? 'Waiting for opponent to join...'
      : 'Click "Join as Black" to play';
  }
  if (game.status === 'FINISHED') {
    if (game.result === '1-0') return `White wins! (${game.whitePlayer})`;
    if (game.result === '0-1') return `Black wins! (${game.blackPlayer})`;
    if (game.result === '1/2-1/2') return 'Draw!';
    return 'Game over';
  }
  const chess = new Chess(game.fen);
  const isMyTurn =
    (chess.turn() === 'w' && game.whitePlayer === username) ||
    (chess.turn() === 'b' && game.blackPlayer === username);
  if (chess.isCheck()) {
    return isMyTurn ? '⚠ You are in check!' : '⚠ Opponent is in check';
  }
  return isMyTurn ? 'Your turn to move' : "Opponent's turn";
}

export function getPlayerColor(game: GameData, username: string): 'white' | 'black' | null {
  if (game.whitePlayer === username) return 'white';
  if (game.blackPlayer === username) return 'black';
  return null;
}
