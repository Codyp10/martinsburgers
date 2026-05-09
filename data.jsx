// data.jsx — Defenders, enemies, maps, waves
// Loaded as Babel script; exports go to window for shared scope.

const DEFENDERS = [
  {
    id: 'greeter',
    name: 'The Greeter',
    role: 'melee',
    roleLabel: 'MELEE',
    color: '#E63946',
    cost: 90,
    damage: 26,
    range: 95,
    rate: 1.0, // attacks per second
    splash: 0,
    slow: 0,
    flavor: 'Stands by the door. Vigorous handshake. Will not let go.',
    ability: 'Aggressive Welcome — locks one enemy in place for 0.2s and slaps them with a hello.',
    accent: '👋',
    bodyColor: '#E63946',
    hairColor: '#3a2a1a',
  },
  {
    id: 'hypeman',
    name: 'The Hype-Man',
    role: 'melee',
    roleLabel: 'FAST MELEE',
    color: '#FF3D7F',
    cost: 120,
    damage: 7,
    range: 75,
    rate: 3.5,
    splash: 0,
    slow: 0,
    flavor: 'High-fives at the speed of caffeine. "LET\u2019S GOOOO!"',
    ability: 'Rapid Fives — fastest attack rate in the game. Wears down swarms.',
    accent: '🙌',
    bodyColor: '#FF3D7F',
    hairColor: '#1A1A1A',
  },
  {
    id: 'handout',
    name: 'The Handout Giver',
    role: 'ranged',
    roleLabel: 'RANGED',
    color: '#3D5A80',
    cost: 110,
    damage: 16,
    range: 150,
    rate: 1.2,
    splash: 0,
    slow: 0,
    flavor: 'Has six different bulletins. You will take all of them.',
    ability: 'Bulletin Toss — reliable medium-range projectile. The all-rounder.',
    accent: '📄',
    bodyColor: '#3D5A80',
    hairColor: '#5a4a3a',
  },
  {
    id: 'coffee',
    name: 'The Coffee Tosser',
    role: 'ranged',
    roleLabel: 'SPLASH',
    color: '#7B5EA7',
    cost: 170,
    damage: 18,
    range: 130,
    rate: 0.8,
    splash: 55,
    slow: 0.30,
    flavor: 'Decaf? In THIS economy? Hurls hot coffee with prejudice.',
    ability: 'Donut Bomb — area damage and slows everyone in the splash zone.',
    accent: '☕',
    bodyColor: '#7B5EA7',
    hairColor: '#1A1A1A',
  },
  {
    id: 'talker',
    name: 'The Talker',
    role: 'cc',
    roleLabel: 'CONTROL',
    color: '#7B5EA7',
    cost: 110,
    damage: 0,
    range: 95,
    rate: 1.0,
    splash: 0,
    slow: 0.65,
    flavor: '"How was your week?" Forty minutes later, you still have not escaped.',
    ability: 'Trapped In Conversation — stops enemies cold. Zero damage. Maximum awkward.',
    accent: '💬',
    bodyColor: '#52B788',
    hairColor: '#9a6a3a',
  },
  {
    id: 'usher',
    name: 'The Usher',
    role: 'cc',
    roleLabel: 'CONTROL',
    color: '#3D5A80',
    cost: 140,
    damage: 7,
    range: 110,
    rate: 0.65,
    splash: 0,
    knockback: 40,
    flavor: 'Holds the rope. "Sir, the back row is full." Pushes you backward. With love.',
    ability: 'Velvet Rope — knockback on hit. Resets enemy progress on the path.',
    accent: '🪢',
    bodyColor: '#3D5A80',
    hairColor: '#1A1A1A',
  },
  {
    id: 'soundbooth',
    name: 'Sound Booth Guy',
    role: 'support',
    roleLabel: 'BUFFER',
    color: '#FFD23F',
    cost: 140,
    damage: 0,
    range: 130,
    rate: 0,
    buff: { type: 'attackSpeed', mult: 1.3 },
    flavor: 'Up in the booth. Cranks the playlist. Everyone fights faster.',
    ability: 'Hype Mix — boosts attack speed of all defenders in range by 30%.',
    accent: '🎚️',
    bodyColor: '#FFD23F',
    hairColor: '#3a2a1a',
  },
  {
    id: 'snackrunner',
    name: 'The Snack Runner',
    role: 'support',
    roleLabel: 'BUFFER',
    color: '#FFD23F',
    cost: 120,
    damage: 0,
    range: 140,
    rate: 0,
    buff: { type: 'damage', mult: 1.25 },
    flavor: 'Hands out goldfish crackers like ammo. Friendly fire is real.',
    ability: 'Snack Boost — defenders in range deal 25% more damage.',
    accent: '🥨',
    bodyColor: '#52B788',
    hairColor: '#1A1A1A',
  },
  {
    id: 'organizer',
    name: 'The Organizer',
    role: 'special',
    roleLabel: 'ECONOMY',
    color: '#FF3D7F',
    cost: 150,
    damage: 0,
    range: 0,
    rate: 0,
    income: 13, // spirit per 5s
    flavor: 'Has a clipboard. Has a SECOND clipboard. Generates Community Spirit just by existing.',
    ability: 'Paperwork — generates +13 Community Spirit every 5 seconds. Buy more friends.',
    accent: '📋',
    bodyColor: '#FF3D7F',
    hairColor: '#5a4a3a',
  },
  {
    id: 'pk',
    name: 'The Pastor\u2019s Kid',
    role: 'special',
    roleLabel: 'ULTIMATE',
    color: '#1A1A1A',
    cost: 340,
    damage: 72,
    range: 200,
    rate: 0.55,
    splash: 110,
    flavor: 'Has the keys. Knows the basement code. Has been here since birth.',
    ability: 'Insider Knowledge — massive AOE damage. Resolves crowds in one swing.',
    accent: '🗝️',
    bodyColor: '#1A1A1A',
    hairColor: '#1A1A1A',
  },
];

const ENEMIES = {
  potluck: {
    id: 'potluck',
    name: 'Potluck Pirate',
    hp: 80,
    speed: 42,
    bounty: 9,
    damage: 1,
    color: '#F77F00',
    hat: 'plate',
    flavor: 'Coming for the casserole.',
  },
  late: {
    id: 'late',
    name: 'Late Arrival',
    hp: 50,
    speed: 65,
    bounty: 7,
    damage: 1,
    color: '#3D5A80',
    hat: 'jacket',
    flavor: '"Was service at 10 or 10:30?"',
  },
  vbs: {
    id: 'vbs',
    name: 'VBS Sugar Kid',
    hp: 30,
    speed: 110,
    bounty: 5,
    damage: 1,
    color: '#FFD23F',
    hat: 'cone',
    flavor: 'Ate three juice boxes. Cannot be stopped by reason.',
  },
  asker: {
    id: 'asker',
    name: 'Question Asker',
    hp: 120,
    speed: 30,
    bounty: 13,
    damage: 2,
    color: '#7B5EA7',
    hat: 'glasses',
    flavor: '"So in Leviticus 23..."',
  },
  boss: {
    id: 'boss',
    name: 'The Committee',
    hp: 1200,
    speed: 24,
    bounty: 90,
    damage: 5,
    color: '#1A1A1A',
    hat: 'crown',
    flavor: 'Five people. One opinion. Many sub-points.',
    boss: true,
  },
};

// Path is in stage-canvas coordinates (1280x800). Game area ~ 1280x640 (HUD eats 160 top).
const MAPS = [
  // Path is in stage-canvas coordinates (1280x800). Path lies within ~1280x720 to leave HUD room.
  {
    id: 'lobby',
    name: 'The Lobby',
    subtitle: 'where it all begins',
    difficulty: 1,
    unlocked: true,
    spirit: 200,
    lives: 16,
    color: '#52B788',
    icon: 'lobby',
    desc: 'A wide-open lobby with one main hallway. Friendly intro map. Coffee bar in the corner.',
    path: [
      { x: -40, y: 220 }, { x: 320, y: 220 }, { x: 320, y: 420 },
      { x: 760, y: 420 }, { x: 760, y: 260 }, { x: 1080, y: 260 },
      { x: 1080, y: 560 }, { x: 1320, y: 560 },
    ],
    waves: 'standard',
  },
  {
    id: 'sanctuary',
    name: 'The Sanctuary',
    subtitle: 'do NOT disturb the sermon',
    difficulty: 2,
    unlocked: true,
    spirit: 180,
    lives: 13,
    color: '#3D5A80',
    icon: 'sanctuary',
    desc: 'Two aisles converge on the pulpit. Late arrivals come in HOT.',
    path: [
      { x: 200, y: -40 }, { x: 200, y: 300 }, { x: 460, y: 300 },
      { x: 460, y: 500 }, { x: 820, y: 500 }, { x: 820, y: 300 },
      { x: 1080, y: 300 }, { x: 1080, y: 840 },
    ],
    waves: 'sanctuary',
  },
  {
    id: 'fellowship',
    name: 'Fellowship Hall',
    subtitle: 'guard the casserole',
    difficulty: 3,
    unlocked: true,
    spirit: 210,
    lives: 14,
    color: '#F77F00',
    icon: 'fellowship',
    desc: 'Long folding tables. The food is the base. Potluck pirates everywhere.',
    path: [
      { x: -40, y: 360 }, { x: 240, y: 360 }, { x: 240, y: 180 },
      { x: 540, y: 180 }, { x: 540, y: 540 }, { x: 880, y: 540 },
      { x: 880, y: 180 }, { x: 1180, y: 180 }, { x: 1180, y: 480 }, { x: 1320, y: 480 },
    ],
    waves: 'fellowship',
  },
  {
    id: 'parking',
    name: 'The Parking Lot',
    subtitle: 'after-service traffic jam',
    difficulty: 4,
    unlocked: false,
    spirit: 180,
    lives: 12,
    color: '#1A1A1A',
    icon: 'parking',
    desc: 'Locked! Beat Fellowship Hall to unlock the chaos of post-service parking.',
    path: [],
    waves: 'standard',
  },
  {
    id: 'vbs',
    name: 'The Youth Lounge',
    subtitle: 'sugar rush hour',
    difficulty: 5,
    unlocked: false,
    spirit: 160,
    lives: 10,
    color: '#FF3D7F',
    icon: 'vbs',
    desc: 'Locked! VBS kids only. Bring your fastest friends.',
    path: [],
    waves: 'standard',
  },
  {
    id: 'ludicrous',
    name: 'Ludicrous Mode',
    subtitle: '100 waves. how far can you get?',
    difficulty: 5,
    unlocked: true,
    spirit: 350,
    lives: 30,
    color: '#E63946',
    icon: 'lobby',
    desc: 'One hundred waves of escalating chaos. Every wave hits harder than the last. Survival is unlikely. Glory is mandatory.',
    path: [
      { x: -40, y: 180 }, { x: 280, y: 180 }, { x: 280, y: 400 },
      { x: 120, y: 400 }, { x: 120, y: 620 }, { x: 540, y: 620 },
      { x: 540, y: 320 }, { x: 820, y: 320 }, { x: 820, y: 600 },
      { x: 1080, y: 600 }, { x: 1080, y: 240 }, { x: 1320, y: 240 },
    ],
    waves: 'ludicrous',
  },
];

// wave packs — { delay (s before wave), spawns: [{type, count, gap (s)}] }
const WAVES_STANDARD = [
  { name: 'The Early Birds', spawns: [{ type: 'late', count: 6, gap: 1.1 }] },
  { name: 'Bulletin Rush', spawns: [{ type: 'late', count: 8, gap: 0.85 }, { type: 'potluck', count: 4, gap: 1.2 }] },
  { name: 'Sugar Rush', spawns: [{ type: 'vbs', count: 15, gap: 0.45 }] },
  { name: 'Mixed Crowd', spawns: [{ type: 'late', count: 8, gap: 0.7 }, { type: 'asker', count: 4, gap: 1.4 }, { type: 'potluck', count: 6, gap: 0.9 }] },
  { name: 'Theological Inquiry', spawns: [{ type: 'asker', count: 10, gap: 1.1 }, { type: 'vbs', count: 10, gap: 0.5 }] },
  { name: 'Lunch Rush', spawns: [{ type: 'potluck', count: 18, gap: 0.6 }] },
  { name: 'The Committee Arrives', spawns: [{ type: 'asker', count: 8, gap: 0.9 }, { type: 'boss', count: 1, gap: 0 }, { type: 'late', count: 14, gap: 0.5 }, { type: 'potluck', count: 4, gap: 1.0 }] },
];

const WAVES_SANCTUARY = WAVES_STANDARD; // reuse for now
const WAVES_FELLOWSHIP = WAVES_STANDARD;

// Ludicrous Mode — 100 waves of escalating chaos.
// Each wave applies an HP/speed/bounty multiplier that grows with the wave
// index, plus enemy mix and spawn density that ramp through five brackets.
function generateLudicrousWaves() {
  const waves = [];
  for (let i = 0; i < 100; i++) {
    const w = i + 1;                                  // wave number 1..100
    const hpMult = +(1 + i * 0.07).toFixed(3);        // wave 100 -> ~7.9x HP
    const speedMult = +(1 + i * 0.008).toFixed(3);    // wave 100 -> ~1.79x speed
    const bountyMult = +(1 + i * 0.05).toFixed(3);    // economy keeps pace
    const tag = { hpMult, speedMult, bountyMult };
    const spawns = [];

    if (w <= 10) {
      // Bracket 1: warmup
      spawns.push({ type: 'late', count: 5 + w, gap: 0.9, ...tag });
      if (w >= 4) spawns.push({ type: 'vbs', count: 4 + w, gap: 0.55, ...tag });
      if (w >= 7) spawns.push({ type: 'potluck', count: 3 + Math.floor(w / 2), gap: 0.95, ...tag });
    } else if (w <= 25) {
      // Bracket 2: full enemy roster, scaling counts
      spawns.push({ type: 'late', count: 10 + Math.floor(w / 2), gap: 0.7, ...tag });
      spawns.push({ type: 'potluck', count: 6 + Math.floor(w / 3), gap: 0.85, ...tag });
      spawns.push({ type: 'vbs', count: 10 + Math.floor(w / 2), gap: 0.45, ...tag });
      if (w % 4 === 0) spawns.push({ type: 'asker', count: 4 + Math.floor(w / 6), gap: 1.1, ...tag });
      if (w === 25) spawns.push({ type: 'boss', count: 1, gap: 0, ...tag });
    } else if (w <= 50) {
      // Bracket 3: bosses become recurring
      spawns.push({ type: 'late', count: 14, gap: 0.6, ...tag });
      spawns.push({ type: 'potluck', count: 12, gap: 0.7, ...tag });
      spawns.push({ type: 'asker', count: 7, gap: 1.0, ...tag });
      spawns.push({ type: 'vbs', count: 16, gap: 0.4, ...tag });
      if (w % 10 === 0) spawns.push({ type: 'boss', count: 1, gap: 0, ...tag });
    } else if (w <= 75) {
      // Bracket 4: heavy pressure, frequent bosses
      spawns.push({ type: 'late', count: 18, gap: 0.5, ...tag });
      spawns.push({ type: 'potluck', count: 15, gap: 0.6, ...tag });
      spawns.push({ type: 'asker', count: 11, gap: 0.85, ...tag });
      spawns.push({ type: 'vbs', count: 22, gap: 0.35, ...tag });
      if (w % 5 === 0) spawns.push({ type: 'boss', count: 1, gap: 0, ...tag });
    } else {
      // Bracket 5: endgame chaos
      const extra = w - 75; // 1..25
      spawns.push({ type: 'late', count: 22 + extra, gap: 0.4, ...tag });
      spawns.push({ type: 'potluck', count: 18 + Math.floor(extra / 2), gap: 0.5, ...tag });
      spawns.push({ type: 'asker', count: 14 + Math.floor(extra / 2), gap: 0.75, ...tag });
      spawns.push({ type: 'vbs', count: 26 + extra, gap: 0.3, ...tag });
      // Boss caravans — 1 boss at w76, scaling up to 4 by w100
      const bossCount = 1 + Math.floor(extra / 7);
      const bossTag = { hpMult: hpMult * 1.4, speedMult, bountyMult: bountyMult * 1.4 };
      spawns.push({ type: 'boss', count: bossCount, gap: 2.0, ...bossTag });
    }

    // Wave naming
    let name;
    if (w === 100) name = '🏆 THE FINAL HOUR';
    else if (w === 50) name = '⚡ HALFWAY MARK';
    else if (w === 75) name = '🔥 The Final Quarter';
    else if (w === 25) name = '💀 First Boss';
    else if (w % 10 === 0) name = `Wave ${w} — Big One`;
    else name = `Wave ${w}`;

    waves.push({ name, spawns });
  }
  return waves;
}

const WAVES_LUDICROUS = generateLudicrousWaves();

const WAVE_PACKS = {
  standard: WAVES_STANDARD,
  sanctuary: WAVES_SANCTUARY,
  fellowship: WAVES_FELLOWSHIP,
  ludicrous: WAVES_LUDICROUS,
};

Object.assign(window, { DEFENDERS, ENEMIES, MAPS, WAVE_PACKS });
