/**
 * Seed demo spelling lists for fresh deployments.
 * Idempotent — skips if spelling lists already exist.
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { getDb, getSpellingLists, createSpellingList, addWord } from '../src/lib/db';

const DEMO_LISTS = [
  {
    name: 'Week 1 - Science Words',
    words: [
      { word: 'photosynthesis', hint: 'How plants make food from sunlight' },
      { word: 'experiment', hint: 'A test to discover something new' },
      { word: 'microscope', hint: 'Used to see very tiny things' },
      { word: 'hypothesis', hint: 'An educated guess' },
      { word: 'temperature', hint: 'How hot or cold something is' },
      { word: 'molecule', hint: 'Tiny building blocks of matter' },
      { word: 'evaporation', hint: 'When water turns to gas' },
      { word: 'condensation', hint: 'When gas turns back to liquid' },
    ],
  },
  {
    name: 'Week 2 - History Words',
    words: [
      { word: 'parliament', hint: 'Where laws are made' },
      { word: 'civilisation', hint: 'An advanced society' },
      { word: 'archaeology', hint: 'Studying old things dug up from the ground' },
      { word: 'medieval', hint: 'The Middle Ages period' },
      { word: 'revolution', hint: 'A big change or uprising' },
      { word: 'democracy', hint: 'Government by the people' },
      { word: 'industrial', hint: 'Related to factories and manufacturing' },
      { word: 'chronicle', hint: 'A record of events in order' },
    ],
  },
  {
    name: 'Week 3 - Geography Words',
    words: [
      { word: 'continent', hint: 'A large land mass' },
      { word: 'hemisphere', hint: 'Half of the Earth' },
      { word: 'equator', hint: 'Imaginary line around the middle of the Earth' },
      { word: 'volcano', hint: 'Mountain that erupts lava' },
      { word: 'erosion', hint: 'When rock or soil is worn away' },
      { word: 'climate', hint: 'Weather patterns over a long time' },
      { word: 'peninsula', hint: 'Land surrounded by water on three sides' },
      { word: 'tributary', hint: 'A river that flows into a bigger river' },
    ],
  },
];

function seed() {
  const db = getDb();
  const existing = getSpellingLists(1);

  if (existing.length > 0) {
    console.log(`✓ Skipping — ${existing.length} spelling list(s) already exist.`);
    return;
  }

  console.log('Seeding demo spelling lists...');

  let firstListId: number | null = null;

  for (const list of DEMO_LISTS) {
    const listId = Number(createSpellingList(1, list.name));
    if (!firstListId) firstListId = listId;
    for (const w of list.words) {
      addWord(listId, w.word, w.hint);
    }
    console.log(`  ✓ ${list.name} (${list.words.length} words)`);
  }

  // Set the first list as active
  if (firstListId) {
    db.prepare('UPDATE spelling_lists SET is_active = 1 WHERE id = ? AND profile_id = 1').run(firstListId);
  }

  console.log(`\n✓ Done — ${DEMO_LISTS.length} lists seeded with ${DEMO_LISTS.reduce((n, l) => n + l.words.length, 0)} words total.`);
}

seed();
