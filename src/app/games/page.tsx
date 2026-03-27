import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GamesHistoryPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      _count: { select: { moves: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl">♛</span>
            <span className="font-semibold text-sm">Chess Online</span>
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300 text-sm">Game History</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">All Games</h1>
          <span className="text-gray-600 text-sm">{games.length} games</span>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            No games yet.{' '}
            <Link href="/" className="text-amber-400 hover:underline">
              Play one!
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/70">
                <tr className="text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">White ♙</th>
                  <th className="px-4 py-3 font-medium">Black ♟</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Moves</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {games.map((game) => (
                  <tr
                    key={game.id}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(game.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {game.whitePlayer}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {game.blackPlayer ?? (
                        <span className="text-gray-600 italic">none</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {game.result ? (
                        <span className="text-amber-400 font-bold">
                          {game.result}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {game._count.moves}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          game.status === 'ACTIVE'
                            ? 'text-green-400'
                            : game.status === 'WAITING'
                            ? 'text-yellow-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {game.status === 'ACTIVE'
                          ? 'Live'
                          : game.status === 'WAITING'
                          ? 'Open'
                          : 'Finished'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/game/${game.id}`}
                        className="text-amber-500 hover:text-amber-400 text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
