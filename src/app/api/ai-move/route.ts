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

    // UCI move format: "e2e4" or "e7e8q" (promotion)
    const move: string = data.bestmove;
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move.length > 4 ? move[4] : undefined;

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
