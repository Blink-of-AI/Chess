import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { username } = await request.json();

    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Allow existing players to re-join (e.g. page refresh)
    if (game.whitePlayer === username.trim() || game.blackPlayer === username.trim()) {
      const fullGame = await prisma.game.findUnique({
        where: { id: gameId },
        include: { moves: { orderBy: { moveNumber: 'asc' } } },
      });
      return NextResponse.json(fullGame);
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json({ error: 'Game already has two players' }, { status: 400 });
    }

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: {
        blackPlayer: username.trim(),
        status: 'ACTIVE',
      },
      include: { moves: { orderBy: { moveNumber: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
  }
}
