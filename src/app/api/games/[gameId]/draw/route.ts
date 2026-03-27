import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { username, action } = await request.json();

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    if (game.status !== 'ACTIVE') return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    if (game.isAiGame) return NextResponse.json({ error: 'Cannot offer draw vs AI' }, { status: 400 });

    const isWhite = game.whitePlayer === username;
    const isBlack = game.blackPlayer === username;
    if (!isWhite && !isBlack) return NextResponse.json({ error: 'Not a player in this game' }, { status: 403 });

    if (action === 'offer') {
      if (game.drawOfferedBy === username) {
        return NextResponse.json({ error: 'You already offered a draw' }, { status: 400 });
      }
      const updated = await prisma.game.update({
        where: { id: gameId },
        data: { drawOfferedBy: username },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      });
      return NextResponse.json(updated);
    }

    if (action === 'accept') {
      if (!game.drawOfferedBy || game.drawOfferedBy === username) {
        return NextResponse.json({ error: 'No draw offer to accept' }, { status: 400 });
      }
      const updated = await prisma.game.update({
        where: { id: gameId },
        data: { status: 'FINISHED', result: '1/2-1/2', drawOfferedBy: null },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      });
      return NextResponse.json(updated);
    }

    if (action === 'decline') {
      const updated = await prisma.game.update({
        where: { id: gameId },
        data: { drawOfferedBy: null },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process draw offer' }, { status: 500 });
  }
}
