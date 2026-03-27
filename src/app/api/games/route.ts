import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        moves: { orderBy: { moveNumber: 'asc' } },
      },
    });
    return NextResponse.json(games);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    const game = await prisma.game.create({
      data: {
        whitePlayer: username.trim(),
        status: 'WAITING',
      },
      include: { moves: true },
    });
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
