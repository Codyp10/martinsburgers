// game.jsx — Core TD game loop: pathing, placement, waves, combat
// Uses React useReducer + requestAnimationFrame.

const TICK_MS = 1000 / 60;
const PATH_WIDTH = 56; // forbidden zone around path for placement

// ─────────── path utilities ───────────
function pathLength(path) {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i-1].x;
    const dy = path[i].y - path[i-1].y;
    total += Math.hypot(dx, dy);
  }
  return total;
}
function pointAt(path, dist) {
  let remaining = dist;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i-1].x;
    const dy = path[i].y - path[i-1].y;
    const len = Math.hypot(dx, dy);
    if (remaining <= len) {
      const t = remaining / len;
      return { x: path[i-1].x + dx * t, y: path[i-1].y + dy * t };
    }
    remaining -= len;
  }
  return path[path.length - 1];
}
function distToPath(x, y, path) {
  let min = Infinity;
  for (let i = 1; i < path.length; i++) {
    const a = path[i-1], b = path[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx*dx + dy*dy;
    if (len2 === 0) continue;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    const d = Math.hypot(x - px, y - py);
    if (d < min) min = d;
  }
  return min;
}

// ─────────── game state ───────────
function makeInitialState(mapDef, wavePack) {
  return {
    map: mapDef,
    wavePack,
    spirit: mapDef.spirit,
    lives: mapDef.lives,
    waveIndex: -1, // not started
    waveActive: false,
    waveQueue: [], // [{type, at}]
    waveSpawnTime: 0,
    enemies: [], // {id, def, dist, hp, hpMax, slowUntil, slowMult, x, y}
    defenders: [], // {id, def, x, y, lastFireAt, target, buffActiveSpeed, buffDamage, lastIncomeAt}
    projectiles: [], // {id, x, y, tx, ty, dmg, splash, slow, speed, sourceId, targetId, emoji}
    fx: [], // {id, kind, x, y, t, life}
    placing: null, // defender def to place
    selectedDefenderId: null,
    paused: false,
    speed: 1,
    won: false,
    lost: false,
    t: 0,
    nextId: 1,
  };
}

let _idCounter = 1;
function nextId() { return _idCounter++; }

// ─────────── reducer-ish step ───────────
function step(state, dtSec) {
  if (state.paused || state.won || state.lost) return state;
  const dt = dtSec * state.speed;
  const path = state.map.path;
  const pathLen = pathLength(path);
  const t = state.t + dt;

  // 1. wave spawn ticking
  let waveActive = state.waveActive;
  let waveQueue = state.waveQueue;
  let enemies = state.enemies.map(e => ({ ...e }));

  if (waveActive && waveQueue.length > 0) {
    const newQueue = [];
    for (const sp of waveQueue) {
      if (t >= sp.at) {
        const ed = ENEMIES[sp.type];
        enemies.push({
          id: nextId(),
          def: ed,
          dist: 0,
          hp: ed.hp, hpMax: ed.hp,
          slowUntil: 0, slowMult: 1,
          x: path[0].x, y: path[0].y,
          flash: 0,
        });
      } else {
        newQueue.push(sp);
      }
    }
    waveQueue = newQueue;
  }

  // 2. enemies move
  let lives = state.lives;
  enemies = enemies.map(e => {
    const slowMult = t < e.slowUntil ? e.slowMult : 1;
    const newDist = e.dist + e.def.speed * slowMult * dt;
    const pos = pointAt(path, newDist);
    return { ...e, dist: newDist, x: pos.x, y: pos.y, flash: Math.max(0, e.flash - dt) };
  });
  // remove enemies that reached the end
  const arrived = enemies.filter(e => e.dist >= pathLen);
  enemies = enemies.filter(e => e.dist < pathLen);
  for (const a of arrived) lives -= a.def.damage;

  // 3. defenders attack — also handle income
  let defenders = state.defenders.map(d => ({ ...d }));
  let projectiles = state.projectiles.map(p => ({ ...p }));
  let spirit = state.spirit;

  // first, compute buffs (which defenders are within range of buffer)
  const pendingFlashes = [];
  for (const d of defenders) {
    d.attackSpeedMult = 1; d.damageMult = 1;
  }
  for (const buffer of defenders) {
    if (buffer.def.buff) {
      for (const d of defenders) {
        if (d === buffer) continue;
        if (Math.hypot(d.x - buffer.x, d.y - buffer.y) <= buffer.def.range) {
          if (buffer.def.buff.type === 'attackSpeed') d.attackSpeedMult *= buffer.def.buff.mult;
          if (buffer.def.buff.type === 'damage') d.damageMult *= buffer.def.buff.mult;
        }
      }
    }
  }

  for (const d of defenders) {
    // income
    if (d.def.income) {
      if (t - d.lastIncomeAt >= 5) {
        spirit += d.def.income;
        d.lastIncomeAt = t;
      }
      continue;
    }
    if (d.def.rate <= 0) continue;
    const interval = 1 / (d.def.rate * d.attackSpeedMult);
    if (t - d.lastFireAt < interval) continue;

    // pick target — closest in range, furthest along path
    let best = null, bestDist = -1;
    for (const e of enemies) {
      const dist = Math.hypot(e.x - d.x, e.y - d.y);
      if (dist <= d.def.range && e.dist > bestDist) {
        best = e;
        bestDist = e.dist;
      }
    }
    if (!best) continue;
    d.lastFireAt = t;
    pendingFlashes.push({ id: nextId(), kind: 'muzzle', x: d.x, y: d.y - 30, t: 0, life: 0.3 });

    // if melee (range <= 100) — instant damage
    if (d.def.range <= 100 && d.def.damage > 0) {
      const target = enemies.find(e => e.id === best.id);
      if (target) {
        target.hp -= d.def.damage * d.damageMult;
        target.flash = 0.15;
        if (d.def.id === 'greeter') {
          target.slowUntil = t + 0.2; target.slowMult = 0;
        }
      }
    } else if (d.def.id === 'talker') {
      // Apply slow to enemies in range each tick
      // (handled below as continuous; but we'll just do it here)
      for (const e of enemies) {
        if (Math.hypot(e.x - d.x, e.y - d.y) <= d.def.range) {
          e.slowUntil = t + 0.5; e.slowMult = 1 - (d.def.slow || 0.85);
        }
      }
    } else {
      // ranged — projectile
      projectiles.push({
        id: nextId(),
        x: d.x, y: d.y - 30,
        targetId: best.id,
        dmg: d.def.damage * d.damageMult,
        splash: d.def.splash || 0,
        slow: d.def.slow || 0,
        knockback: d.def.knockback || 0,
        speed: 360,
        emoji: d.def.id === 'coffee' ? '☕' : d.def.id === 'pk' ? '✨' : d.def.id === 'usher' ? '🪢' : '📄',
      });
    }
  }

  // talker passive — already handled above on its rate tick. Also ensure each tick we re-apply slow:
  for (const d of defenders) {
    if (d.def.id === 'talker') {
      for (const e of enemies) {
        if (Math.hypot(e.x - d.x, e.y - d.y) <= d.def.range) {
          if (e.slowUntil < t + 0.05) {
            e.slowUntil = t + 0.1; e.slowMult = 1 - (d.def.slow || 0.85);
          }
        }
      }
    }
  }

  // 4. projectiles move & hit
  const fx = state.fx.filter(f => f.t < f.life).map(f => ({ ...f, t: f.t + dt }));
  fx.push(...pendingFlashes);
  projectiles = projectiles.map(p => ({ ...p }));
  const remainingProj = [];
  for (const p of projectiles) {
    const tgt = enemies.find(e => e.id === p.targetId);
    if (!tgt) continue; // target gone
    const dx = tgt.x - p.x, dy = (tgt.y - 30) - p.y;
    const d = Math.hypot(dx, dy);
    const move = p.speed * dt;
    if (move >= d) {
      // hit
      tgt.hp -= p.dmg;
      tgt.flash = 0.15;
      if (p.slow > 0) { tgt.slowUntil = t + 1.5; tgt.slowMult = 1 - p.slow; }
      if (p.knockback > 0) { tgt.dist = Math.max(0, tgt.dist - p.knockback); }
      if (p.splash > 0) {
        for (const e of enemies) {
          if (e.id === tgt.id) continue;
          if (Math.hypot(e.x - tgt.x, e.y - tgt.y) <= p.splash) {
            e.hp -= p.dmg * 0.6;
            e.flash = 0.15;
            if (p.slow > 0) { e.slowUntil = t + 1.5; e.slowMult = 1 - p.slow; }
          }
        }
        fx.push({ id: nextId(), kind: 'splash', x: tgt.x, y: tgt.y - 30, r: p.splash, t: 0, life: 0.4 });
      }
      fx.push({ id: nextId(), kind: 'dmg', x: tgt.x, y: tgt.y - 40, val: Math.round(p.dmg), t: 0, life: 0.8 });
    } else {
      p.x += dx / d * move;
      p.y += dy / d * move;
      remainingProj.push(p);
    }
  }
  projectiles = remainingProj;

  // 5. enemy deaths
  const dead = enemies.filter(e => e.hp <= 0);
  enemies = enemies.filter(e => e.hp > 0);
  for (const d of dead) {
    spirit += d.def.bounty;
    fx.push({ id: nextId(), kind: 'pop', x: d.x, y: d.y - 30, t: 0, life: 0.45 });
  }

  // 6. wave end?
  if (waveActive && waveQueue.length === 0 && enemies.length === 0) {
    waveActive = false;
    spirit += 30; // wave bonus
  }

  // 7. win/loss
  let won = state.won, lost = state.lost;
  if (lives <= 0) lost = true;
  if (!waveActive && state.waveIndex >= state.wavePack.length - 1 && enemies.length === 0 && state.waveIndex !== -1) {
    won = true;
  }

  return {
    ...state,
    t,
    enemies,
    defenders,
    projectiles,
    fx,
    spirit,
    lives,
    waveQueue,
    waveActive,
    won, lost,
  };
}

// helpers exposed
function startWave(state) {
  if (state.waveActive) return state;
  const idx = state.waveIndex + 1;
  if (idx >= state.wavePack.length) return state;
  const wave = state.wavePack[idx];
  const queue = [];
  let baseT = state.t + 0.5;
  for (const grp of wave.spawns) {
    for (let i = 0; i < grp.count; i++) {
      queue.push({ type: grp.type, at: baseT + i * grp.gap });
    }
    baseT += grp.count * grp.gap;
  }
  return { ...state, waveIndex: idx, waveActive: true, waveQueue: queue };
}

function placeDefender(state, def, x, y) {
  if (state.spirit < def.cost) return state;
  if (distToPath(x, y, state.map.path) < PATH_WIDTH) return state;
  // not too close to other defender
  for (const d of state.defenders) {
    if (Math.hypot(d.x - x, d.y - y) < 44) return state;
  }
  // bounds
  if (x < 30 || x > 1250 || y < 100 || y > 770) return state;
  return {
    ...state,
    spirit: state.spirit - def.cost,
    defenders: [...state.defenders, {
      id: nextId(), def, x, y,
      lastFireAt: state.t, lastIncomeAt: state.t,
      attackSpeedMult: 1, damageMult: 1,
    }],
    placing: null,
  };
}

function sellDefender(state, id) {
  const d = state.defenders.find(x => x.id === id);
  if (!d) return state;
  return {
    ...state,
    spirit: state.spirit + Math.floor(d.def.cost * 0.6),
    defenders: state.defenders.filter(x => x.id !== id),
    selectedDefenderId: null,
  };
}

Object.assign(window, {
  pathLength, pointAt, distToPath, makeInitialState, step,
  startWave, placeDefender, sellDefender, PATH_WIDTH,
});
