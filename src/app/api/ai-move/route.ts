import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const fen = request.nextUrl.searchParams.get('fen');
  if (!fen) {
    return NextResponse.json({ error: 'FEN required' }, { status: 400 });
  }

  try {
    // stockfish.online — free, no API key, depth 15 ≈ 2400 ELO
    const url = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=15`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Stockfish API returned ${res.status}`);
    }

    const data = await res.json();

    if (!data.success || !data.bestmove || data.bestmove === '(none)') {
      return NextResponse.json({ error: 'No move available (game may be over)' }, { status: 400 });
    }

    // API returns e.g. "bestmove e7e5 ponder g1f3" — extract the UCI move part
    const uciMove: string = data.bestmove.split(' ')[1];
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

    return NextResponse.json({
      from,
      to,
      promotion,
      evaluation: data.evaluation ?? null,
    });
  } catch (err) {
    console.error('AI move error:', err);
    return NextResponse.json({ error: 'Chess engine unavailable' }, { status: 500 });
  }
}
