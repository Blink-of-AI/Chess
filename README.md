# Chess Online

Multiplayer chess in the browser. Share a link — no account needed.

**Stack:** Next.js 15 · Prisma · SQLite · chess.js · react-chessboard · Tailwind CSS

---

## Setup (first time)

### 1. Install Node.js
Download the LTS installer from https://nodejs.org and run it.
Restart your terminal/shell after installation.

### 2. Install dependencies
```bash
cd "C:\Users\Kamil\OneDrive\Dokumenty\_AI_Projects\Chess"
npm install --legacy-peer-deps
```

### 3. Create the database
```bash
npm run db:push
```
This creates `prisma/dev.db` (SQLite file — already in .gitignore).

### 4. Start the dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## How to play

1. Open the site and enter a username (stored in your browser — no account needed)
2. Click **New Game** → you play as White and get a shareable link
3. Send the link to your opponent → they enter a username and click **Join as Black**
4. Both players see the board oriented correctly for their color
5. The board polls every 2 seconds — moves appear automatically
6. Move history is shown in Standard Algebraic Notation (SAN)
7. Full PGN is displayed and copyable after each move

---

## Deploy to Vercel (share with the world)

### Prerequisites
- Free accounts at:
  - https://vercel.com
  - https://neon.tech (hosted PostgreSQL, free tier)
  - https://github.com

### Steps

1. **Switch to PostgreSQL**
   In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   # was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: initial chess app"
   # create repo on github.com, then:
   git remote add origin https://github.com/YOUR_USER/chess-online.git
   git push -u origin main
   ```

3. **Import into Vercel**
   - Go to vercel.com → New Project → import your GitHub repo
   - Add environment variable: `DATABASE_URL` = your Neon connection string
   - Deploy

4. **Run migration on Neon**
   ```bash
   # Set DATABASE_URL locally to Neon URL first, then:
   npx prisma migrate dev --name init
   ```

---

## Dev commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Build for production |
| `npm run db:push` | Sync schema to DB (dev) |
| `npm run db:migrate` | Create a migration |
| `npm run db:studio` | Open Prisma Studio (DB browser) |

---

## Features (v1)

- Real-time multiplayer via 2-second polling
- Full move history in SAN notation
- PGN export (copyable)
- Game database with all past games
- Resign button
- Auto-detect check / checkmate / draw
- Board orientation per player
- No login required — just a username
- Stockfish AI opponent (~2400 ELO, depth 15)
- Game mode selection: invite friend or play vs AI
- Choose color (White / Black / Random) vs AI

## Planned (v2)

- Move clocks / time controls
- Draw offers
- Move sound effects
- ELO rating system
- Pusher/WebSocket for instant updates (replace polling)
