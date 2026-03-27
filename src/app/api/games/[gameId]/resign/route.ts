import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { username } = await request.json();

    const game = await prisma.game.findUnique({ where: { id: gameId } });
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

    // Resigning player loses
    const result = isWhite ? '0-1' : '1-0';

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: { status: 'FINISHED', result },
      include: { moves: { orderBy: { moveNumber: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to resign' }, { status: 500 });
  }
}
