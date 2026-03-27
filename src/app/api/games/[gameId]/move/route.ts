import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Chess } from 'chess.js';
import { getGameResult } from '@/lib/chess-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { username, from, to, promotion } = await request.json();

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { moves: { orderBy: { moveNumber: 'asc' } } },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (game.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    const isWhite = game.whitePlayer === username;
    const isBlack = game.blackPlayer === username;

    if (!isWhite && !isBlack) {
      return NextResponse.json({ error: 'You are not a player in this game' }, { status: 403 });
    }

    const chess = new Chess(game.fen);

    if (isWhite && chess.turn() !== 'w') {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }
    if (isBlack && chess.turn() !== 'b') {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }

    let move;
    try {
      move = chess.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }

    if (!move) {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }

    const result = getGameResult(chess);
    const newStatus = result ? 'FINISHED' : 'ACTIVE';
    const moveNumber = game.moves.length + 1;

    const [updatedGame] = await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: {
          fen: chess.fen(),
          pgn: chess.pgn(),
          status: newStatus,
          result,
          drawOfferedBy: null, // moving cancels any pending draw offer
        },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      }),
      prisma.move.create({
        data: {
          gameId,
          moveNumber,
          san: move.san,
          uci: `${from}${to}${promotion ?? ''}`,
          fen: chess.fen(),
        },
      }),
    ]);

    return NextResponse.json(updatedGame);
  } catch {
    return NextResponse.json({ error: 'Failed to make move' }, { status: 500 });
  }
}
