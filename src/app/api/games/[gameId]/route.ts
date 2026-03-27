import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        moves: { orderBy: { moveNumber: 'asc' } },
      },
    });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}
