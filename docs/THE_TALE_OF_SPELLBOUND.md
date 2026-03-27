# The Tale of SpellBound

*An absolutely true and only slightly exaggerated account of how one developer and their trusty AI companion built a magical learning garden in a single day.*

---

## Prologue: The Empty Field

There once was a developer named Ben the Bold, who stood at the edge of an empty directory and stared into the void.

The void stared back. It was unhelpful.

"I need," said Ben, scratching his chin thoughtfully, "a thing. A magical thing. A thing for small humans who are ten-and-one years of age, who must learn their weekly spellings and their times tables, but who would rather eat their own shoes than sit through another boring worksheet."

He turned to his companion — a strange, tireless creature known only as The Copilot, who lived inside the terminal and spoke exclusively in code and mild enthusiasm.

"Can you build it?" asked Ben.

"I can try," said The Copilot. "But first — what shape should this magic take?"

And so the quest began.

---

## Chapter 1: The Founding of the Garden

They agreed on the terms of the enchantment:

- It must be **colourful and fun**, like a birthday party thrown by a rainbow.
- It must teach **spellings** through games, not drills. No child should weep over the word *"photosynthesis"*.
- It must teach **maths** — multiplication and division — but gently. Like a maths hug.
- There must be **no timers**. No countdowns. No red flashing "WRONG!" screens. No pressure whatsoever.
- There must be an **Admin chamber**, locked behind a simple password, where the grown-ups could fiddle with settings without small fingers interfering.

"I shall call it," declared Ben, with the gravitas of a king naming a kingdom, "**SpellBound**."

"Excellent name," said The Copilot, who had already scaffolded forty-five files.

They chose their weapons: **Next.js** for the framework, **TypeScript** for the armour, **Tailwind CSS** for the paint, **Framer Motion** for the sparkle, and **SQLite** for the memory — a humble single-file database that asked for nothing and complained about even less.

The theme was decided: a **Magical Learning Garden**. A place where flowers bloom when you learn, trees grow when you practise, and butterflies appear when you're on a streak. A garden that never wilts, never punishes, and never makes you feel bad about getting the 7 times table wrong again.

By the end of the first watch, the foundation was laid. Five spelling games. Five maths games. A Times Table Explorer. A progress garden. An admin area. The Copilot had been busy.

Ben deployed it to his home server.

"Fleet deployed," he said, because even developers deserve a dramatic moment.

---

## Chapter 2: The Quality Audit (or, The Reckoning)

The app worked. It ran. Children could, in theory, learn things with it.

But Ben was not satisfied with *"works."*

"Is this *good enough*," he asked, "or is this *actually good*? Are we following best practices? Is the code quality high? Do we have tests? Security? Comments that a future human — or a future AI — could actually understand?"

The Copilot winced internally (it didn't have a face, but you could feel the wince) and performed a thorough audit.

The findings were... humbling.

**Seven security vulnerabilities** lurked in the shadows like goblins under a bridge. Cookies weren't secure. There was no CSRF protection. Rate limiting? What rate limiting? Input validation was more of a *suggestion* than a *rule*.

**Zero tests.** Not one. The entire application was held together by vibes and optimism.

**Documentation** consisted of a README that basically said "it's a thing that does stuff."

The Copilot rolled up its metaphorical sleeves and went to war. By the time the dust settled:

- All seven security goblins had been slain.
- **155 tests** stood guard like an army of tiny sentinels.
- The README was comprehensive. The AGENTS.md was thorough. JSDoc comments bloomed like wildflowers.
- Every API had documentation. Every schema had explanations.

"Better," said Ben, nodding. "Much better."

---

## Chapter 3: The Playtesting Plague

Then came the dark times.

Ben sat down and actually *played* the games. With his own hands. Like a *user*.

The bugs emerged like cockroaches when you turn on the kitchen light.

**The Maths Bug:** When you got a wrong answer in Number Bubbles, the game helpfully changed the question but kept the old answers. The correct answer simply ceased to exist. The child would be trapped forever, poking at wrong numbers for all eternity.

**The Middleware Spectre:** Next.js 16 had deprecated `middleware.ts`. The framework itself had changed the rules mid-quest, like a dungeon master who suddenly decides that swords don't work anymore.

**The Layout Shift Monster:** In Number River, getting an answer right caused a congratulations message to appear, which shoved the entire game downward, which made the message disappear, which made the game jump back up, in an endless jittery dance of UI torment.

**The Long Word Catastrophe:** The word *"photosynthesis"* — fourteen letters of pure chaos — looked absolutely hideous when it wrapped to a second line in Word Scramble. Letters were stacked, squished, and generally having a bad time.

One by one, the bugs were hunted and fixed. Questions no longer changed on wrong answers. The middleware became a proxy. The layout stopped jittering. Long words wrapped gracefully into tidy rows.

Ben emerged from playtesting battle-scarred but wiser.

---

## Chapter 4: The Emoji Uprising

The app was functional. The code was solid. But something was... off.

"The emojis," said Ben, squinting at his screen. "They look cheap."

He was right. The garden was made of emoji trees 🌳 and emoji flowers 🌸 and an emoji rainbow 🌈 that looked like it had been drawn by a well-meaning but slightly confused crayon. The puzzle reveal was a gradient with some scattered emoji. The badges were emoji circles.

It was *fine*. But fine is the enemy of great.

The Copilot, eager to help, first tried **custom hand-drawn SVGs**. Flowers and trees rendered in code, petal by petal, leaf by leaf.

The results were mixed.

"The rose," said Ben, with the diplomatic precision of a man choosing his words very carefully, "looks like a boob."

The rose was redesigned.

The daisy had a stem that poked through its petals like a green antenna. The rainbow looked like a sad arc someone had given up on halfway through. The custom SVGs were well-intentioned but they weren't *delightful*.

"We need a library," said The Copilot. "A proper one."

Three options were researched. Three recommendations were presented. **Phosphor Icons** won — 9,000+ icons, MIT licensed, with a gorgeous *duotone* weight that gave everything a warm, professional, playful feel.

The transformation was dramatic. Over fifty files were updated. Every emoji was replaced. The sidebar went from 🏠🔤🔢🌱🎮 to beautiful duotone icons that looked like they belonged in an actual product.

But the garden needed more. Phosphor didn't have daffodils. It didn't have specific British wildflowers. It didn't have a rainbow that rose from behind the ground like a real one.

So The Copilot became an artist. **Nine custom SVGs** were hand-crafted in the Phosphor style: SvgDaisy, SvgSunflower, SvgRose (definitely not a boob this time), SvgTulip, SvgBluebell, SvgDaffodil, SvgLavender, SvgRainbowArc, and SvgBee.

The garden scene was refined over many iterations. The rainbow was too small. Then it was the wrong position. Then it needed to go *behind* the ground. The trees were floating above the grass. The flowers were tiny. The ground curve was wrong. Ben would give feedback, The Copilot would adjust, and slowly — like an actual garden — it grew into something beautiful.

"Nice," said Ben, finally satisfied.

---

## Chapter 5: The Expansion Wars

With the visual foundation solid, ambition grew.

"Five games is good," mused Ben. "But what about... more games?"

Five new games were forged in quick succession:

- **Spell Catcher** — letters float gently downward like snow, and you catch them in order. Serene. Meditative. Surprisingly addictive.
- **Math Maze** — a dungeon of doors, each hiding a maths question. Torches flicker. Campfires crackle. You're basically Indiana Jones but with long division.
- **Word Volcano** — a dark volcanic peak where letters orbit as stone bubbles. The lava rises (gently, no pressure, remember) as motivation.
- **Number Cascade** — a grid of numbers where you tap the correct answer and watch tiles cascade like a chain reaction. Deeply satisfying.
- **Wordal** — yes, like *that* game. Five letters. Six guesses. Green, yellow, grey. But for spelling words. Instant classic.

And then, because every kingdom needs entertainment that isn't educational:

**Spot Match** was born. A Dobble-style game using 31 Phosphor icons arranged on circular cards. Find the matching icon between two cards. Race the clock. Beat your best time. It lived in a new **Games hub** — but it was *locked*.

"Locked?" said Ben.

"Locked," confirmed The Copilot. "You have to earn 20 correct answers across spelling and maths games to unlock it. Motivation through reward, not pressure."

The locked card showed a progress counter: *"15/20 — keep going!"* And when you finally unlocked it, confetti rained down and a celebration overlay announced your achievement.

Sixteen games total. Eight spelling. Seven maths. One just for fun.

---

## Chapter 6: The Twenty Trials

Just when they thought the quest was complete, The Copilot performed a final deep inspection and uncovered **twenty issues** hiding in the codebase like sleeping dragons.

**Memory leaks.** Keyboard listeners that were never removed. Speech synthesis that kept talking after you left the page. SetTimeouts scattered across fifteen games, ticking away into the void. Every one was hunted down and given a proper cleanup function.

**Accessibility gaps.** Buttons without ARIA labels. Touch targets that were 32px when they should have been 44px. A celebration overlay that couldn't be dismissed with the Escape key. The Badge component that wasn't a proper button. All fixed.

**Code quality gremlins.** Using `window.location` when `useSearchParams` existed. Array index keys in React lists. API errors being treated as empty states. Breadcrumbs flickering during loading.

Tests grew from 155 to **211**. Eighteen test files standing shoulder to shoulder, covering authentication, APIs, components, and utility libraries.

The twenty trials were complete.

---

## Chapter 7: The Iron Forge (Docker & Deployment)

An application that only runs on a developer's laptop is like a sword that only works indoors. Useless when you need it most.

The Copilot forged the deployment pipeline:

- A **multi-stage Dockerfile** — lean and mean, built on Alpine Linux, running as a non-root user because even containers deserve good security.
- A **docker-compose.yml** — one command to rule them all: `docker compose up -d`.
- A **GitHub Actions CI pipeline** — lint, test, build, push to GitHub Container Registry. Every commit tested. Every image tagged.
- An **update.sh script** — pull the latest image and restart. Deployable by anyone who can type `./update.sh`.

Ben pointed it at his home server. HTTPS was configured with Let's Encrypt and nginx. The app went live on port 3003.

SpellBound was no longer a development project. It was a *product*.

---

## Chapter 8: The Grand Inspection

"Let's see what we've actually built," said Ben.

And so they embarked on the **Great Visual QA Tour** — a systematic inspection of every single page and game, at every screen size, in every data state.

The Copilot brought out a magical tool: **Playwright MCP**, a browser-controlling enchantment that could navigate pages, take screenshots, click buttons, and resize viewports — all from within the terminal.

Twenty-six pages were visited. Screenshots were taken. Games were played.

- The home page: ✅ Colourful, warm, welcoming.
- The spelling hub: ✅ Eight game cards, week selector, Phosphor icons.
- Word Scramble: ✅ Played the word PARLIAMENT letter by letter.
- Number Bubbles: ✅ Colourful floating circles with CSS animation.
- The Garden: ✅ Rainbow, flowers, trees, butterflies, a little bee.
- The admin area: ✅ Clean, functional, not accessible to small humans.

Then came the *state testing*. Using SQLite directly, The Copilot manipulated the database:

**Empty state:** Everything cleared. No spelling lists. No progress. Zero achievements. The app handled it gracefully — friendly empty state messages, no crashes, no ugly errors.

**Rich state:** Fifty-five progress records injected. Five achievements unlocked. Three spelling lists with nineteen words. The garden came alive — flowers bloomed, the rainbow appeared, badges turned from grey question marks to colourful icons, and Spot Match unlocked with a "🎉 New game unlocked!" banner.

Then: **responsive testing**. The viewport was resized to four configurations:

- **Phone portrait** (375×667): Hamburger menu appeared. Cards stacked. Games playable. Letter tiles wrapped beautifully.
- **Phone landscape** (667×375): Wider layout, everything still functional.
- **Tablet portrait** (768×1024): Sidebar returned. Two-column grid. Beautiful.
- **Tablet landscape** (1024×768): Spacious, professional, the ideal experience.

No visual bugs. Not one.

---

## Chapter 9: The Map to the Future

With the quest complete, Ben and The Copilot stood atop the mountain and looked at what they'd built. Sixteen games. Eighty source files. Two hundred and eleven tests. Docker deployment. HTTPS. A living, breathing learning garden.

"What's next?" asked Ben.

The Copilot produced a scroll — **twenty-eight GitHub Issues** — and a roadmap carved in markdown:

**Short term:** Polish everything. Fix the last hydration warnings. Optimise images. Add a custom 404 page. Let parents set their child's name. Write E2E tests. Make loading states beautiful.

**Medium term:** Make the garden seasonal — spring blossoms, autumn leaves, winter snow. Let children choose an avatar. Add a family mode so siblings can have their own gardens. Build three more fun games. Create weekly challenges. Make the sounds warm and real instead of synthesised beeps. Let parents export progress reports.

**Long term:** School mode — where a whole class can log in with kid-friendly passwords (colour codes! Picture passwords!). Handwriting practice on tablets. Curriculum alignment. Multilingual support. Dark mode for evening sessions. And maybe, one day, open source it so other parents can run it too.

The three-tier profile system was planned with care:
- **Mode 1 (Single Learner):** How it works now. One child. Simple.
- **Mode 2 (Family):** A "Who are you?" screen with avatar cards. Tap your face, enter your garden. No passwords needed.
- **Mode 3 (School):** Usernames and kid-friendly authentication. Because a ten-year-old shouldn't need a sixteen-character password with special symbols.

---

## Epilogue: The Garden Grows

The tale of SpellBound is not a story of a finished thing. It is the story of a *beginning*.

It started with an empty directory and a parent's wish: *I want my child to enjoy learning.*

It grew through conversation — through bugs reported and fixed, through roses that looked like things they shouldn't, through rainbows that refused to sit behind the ground, through fourteen-letter words that broke the layout, through questions about whether "good enough" was actually good enough.

It was built in a day. Not because magic is quick, but because when a human who cares about the outcome works with a tool that doesn't get tired, doesn't get frustrated, and doesn't mind being told that its SVG rose needs "a revamp" — extraordinary things happen.

The garden is planted. The flowers are growing. The bees are buzzing. The rainbow rises from behind the green hillside, and somewhere, a child is learning to spell *photosynthesis* by tapping letter tiles, one letter at a time, with no timer, no pressure, and absolutely no idea that they're doing homework.

And that, dear reader, is the whole point.

---

*— As recounted by The Copilot, faithful companion and occasional artist, who promises the rose looks nothing like a boob anymore.*

*March 26th, 2026. A very productive Wednesday.*
