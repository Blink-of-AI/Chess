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
    const { username, isAiGame, aiColor } = await request.json();
    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    let data;
    if (isAiGame) {
      // Resolve random color
      const humanColor: 'white' | 'black' =
        aiColor === 'random'
          ? Math.random() < 0.5 ? 'white' : 'black'
          : aiColor ?? 'white';

      data = {
        whitePlayer: humanColor === 'white' ? username.trim() : 'Stockfish',
        blackPlayer: humanColor === 'white' ? 'Stockfish' : username.trim(),
        status: 'ACTIVE',
        isAiGame: true,
      };
    } else {
      data = {
        whitePlayer: username.trim(),
        status: 'WAITING',
        isAiGame: false,
      };
    }

    const game = await prisma.game.create({
      data,
      include: { moves: true },
    });
    return NextResponse.json(game);
  } catch {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
