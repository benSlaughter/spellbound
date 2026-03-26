# 🌱 SpellBound

**A fun, gamified learning app for 10–11 year olds** — spelling games, maths games, and a progress garden that grows as you learn. No scores, no timers, no pressure — just encouragement and delight.

Built with love by a parent who wanted something better than flashcards. 💚

<!-- Screenshot: Home page with the four main cards (Spelling, Maths, My Garden, Challenges) -->

## ✨ Features

### Spelling Games (8)
- 🔍 **Word Search** — find words hidden in a grid
- 🃏 **Memory Match** — classic card-matching with spelling words
- 🔀 **Word Scramble** — unscramble the letters
- ✏️ **Missing Letters** — fill in the blanks
- 🔤 **Word Builder** — hear a word, build it letter by letter
- 🎯 **Spell Catcher** — catch the correct spelling as it flies by
- 🌋 **Word Volcano** — words erupt, match them before they vanish
- 🟩 **Wordal** — Wordle-style guessing with your spelling words

### Maths Games (7)
- 🔢 **Times Table Explorer** — interactive multiplication grid with explore, practice, and pattern modes
- 🫧 **Number Bubbles** — pop the right answer
- ⛰️ **Math Mountain** — climb to the top by solving problems
- 🧩 **Puzzle Pieces** — reveal a picture by answering questions
- 🐸 **Number River** — hop across lily pads to the right answer
- 🧭 **Math Maze** — navigate through rooms by solving equations
- 🌊 **Number Cascade** — answers cascade down, catch the right one

### Fun Games (1)
- 🃏 **Spot Match** — find the matching icon between two cards (unlockable)

### Progress & Rewards
- 🌻 **My Garden** — a garden that grows as you learn (flowers, trees, butterflies!)
- 🏆 **Achievements** — 10 unlockable badges (First Sprout, Word Wizard, Maths Maestro, and more)
- 🎮 **Game unlock system** — fun games are unlocked by earning correct answers across all games
- ⭐ **Streak tracking** — encourages daily practice

### More Features
- 💬 **Feedback** — students can submit feedback from the app
- 🔐 **Admin area** — manage spellings, times tables, difficulties, settings, view progress, read feedback

<!-- Screenshot: Spelling games hub showing the five game cards -->
<!-- Screenshot: Maths games hub with table selection and difficulty picker -->
<!-- Screenshot: My Garden progress page with growing elements -->

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo-url> spellbound
cd spellbound
npm install

# Build and run
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. That's it!

## 🌿 First Run

On first launch, SpellBound automatically:

1. Creates the SQLite database at `data/spellbound.db`
2. Sets up all tables
3. Seeds a default profile called **"Learner"**
4. Sets the admin password to `spellbound123`

No configuration needed — it just works.

## 🔐 Admin Access

Navigate to the admin area via the sidebar or go to `/admin`.

- **Default password:** `spellbound123`
- **To change it:** Log in → Settings → Update password
- Sessions last 24 hours and are stored in memory

From the admin dashboard you can:
- 📝 Manage spelling lists (create, edit, archive, activate)
- 🔢 Configure which times tables and difficulty levels are available
- 📊 View learning progress and statistics
- 💬 Read student feedback
- ⚙️ App settings (change password, reset progress)

> ⚠️ Please change the default password on first use!

## 🎮 Game Unlock System

Fun games (like Spot Match) are unlocked by playing spelling and maths games. Every correct answer counts toward unlocking milestones. For example, Spot Match unlocks after 20 correct answers across any game.

This gives kids a motivating reason to practise — the more they learn, the more games they unlock! The unlock status is visible on the Games hub page, where locked games show their requirements.

## 📝 How to Add Spelling Words

There are two ways to add spelling words:

### 1. Admin Panel (parent/teacher)
1. Log in to the admin area
2. Go to **Manage Spellings**
3. Create a new list with a name (e.g., "Week 12")
4. Add words (with optional hints)
5. Activate the list to make it available in games

### 2. Child Entry Page
1. From the spelling hub, click **"Add My Words"**
2. Or go directly to `/entry`
3. Type a list name and add words (minimum 3)
4. The list is automatically created and activated

## 🛠 Technology Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router) | Full-stack React framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations and transitions |
| [Phosphor Icons](https://phosphoricons.com) | Beautiful duotone icon library |
| [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Local database |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |

## 📁 Project Structure

```
spellbound/
├── data/                    # SQLite database (auto-created)
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   ├── layout.tsx       # Root layout with sidebar
│   │   ├── spelling/        # Spelling hub + 8 game pages
│   │   ├── maths/           # Maths hub + 7 game pages
│   │   ├── games/           # Fun games hub + Spot Match
│   │   ├── progress/        # My Garden progress page
│   │   ├── entry/           # Child word entry page
│   │   ├── feedback/        # Student feedback page
│   │   ├── dev/             # Dev tools + icon library
│   │   ├── admin/           # Admin dashboard
│   │   │   ├── spellings/   # Manage spelling lists
│   │   │   ├── tables/      # Configure times tables
│   │   │   ├── progress/    # View learning progress
│   │   │   ├── feedback/    # Read student feedback
│   │   │   └── settings/    # App settings (password, reset)
│   │   └── api/             # API routes
│   │       ├── achievements/
│   │       ├── admin/       # login, logout
│   │       ├── entry/
│   │       ├── feedback/    # Student feedback
│   │       ├── maths/tables/# Times table config
│   │       ├── progress/
│   │       ├── settings/
│   │       ├── spellings/   # CRUD + activate
│   │       └── unlocks/     # Game unlock status
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── svg/             # Custom flower, bee & rainbow SVGs
│   │   └── layout/          # Sidebar navigation
│   └── lib/
│       ├── db.ts            # Database access layer
│       ├── schema.sql       # Database schema (7 tables)
│       ├── achievements.ts  # Achievement definitions
│       ├── auth.ts          # Admin authentication
│       ├── maths-helpers.ts # Question generation + utilities
│       ├── sounds.ts        # Synthesised sound effects + speech
│       └── unlocks.ts       # Fun game unlock definitions
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Container orchestration
├── deploy.sh                # Home server deploy script
├── package.json
└── tsconfig.json
```

## 💻 Development

```bash
# Run in development mode (with hot reload)
npm run dev

# Run on a custom port
PORT=3456 npm run dev

# Lint the codebase
npm run lint

# Run tests (211 tests)
npm test

# Build for production
npm run build

# Start the production server
npm start
```

## ⚙️ Configuration

### Database
- **Location:** `data/spellbound.db` (relative to project root)
- Auto-created on first run
- Uses WAL journal mode for performance
- Foreign keys are enabled

### Environment Variables
SpellBound works without any environment variables. Optional:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` for secure cookies |
| `PORT` | `3000` | Server port (Next.js default) |

## 🏠 Deployment

SpellBound is designed to run on a home server — a Raspberry Pi, an old laptop, a NAS, or any machine on your local network.

```bash
# Build once
npm run build

# Run it
npm start

# Or with a custom port
PORT=8080 npm start
```

For auto-start on boot, use your OS's service manager (systemd, launchd, etc.) or a process manager like [pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start npm --name spellbound -- start
pm2 save
pm2 startup
```

> 💡 **Tip:** Access from other devices on your network at `http://<server-ip>:3000`

### 🐳 Docker Deployment

SpellBound includes a production-ready Docker setup for easy deployment.

```bash
# Build and run locally with Docker
docker compose up --build

# Or deploy on your home server
./deploy.sh
```

**How it works:**
- Multi-stage Dockerfile produces a lean standalone Next.js image
- GitHub Actions CI pipeline (on push to `main`) runs tests, builds the Docker image, and pushes to GitHub Container Registry (GHCR)
- `deploy.sh` pulls the latest image and restarts the container
- SQLite database is persisted via a Docker volume (`spellbound-data`)
- Puzzle images are bind-mounted from the host for easy updates

## 📚 Documentation

- [API Reference](docs/api.md) — Complete REST API documentation
- [AGENTS.md](AGENTS.md) — Guide for AI coding agents working on this codebase

## 📄 License

MIT — do whatever you like with it. If it helps your kids learn, that makes me happy. 🌻
