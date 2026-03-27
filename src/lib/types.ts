export type GameStatus = 'WAITING' | 'ACTIVE' | 'FINISHED';

export interface MoveData {
  id: string;
  gameId: string;
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  createdAt: string;
}

export interface GameData {
  id: string;
  createdAt: string;
  updatedAt: string;
  whitePlayer: string;
  blackPlayer: string | null;
  pgn: string;
  fen: string;
  status: GameStatus;
  result: string | null;
  isAiGame: boolean;
  moves: MoveData[];
}
