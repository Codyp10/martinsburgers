// gameplay.jsx — In-game screen: HUD, map render, placement, wave control

const { useState: gp_useState, useEffect: gp_useEffect, useRef: gp_useRef, useReducer: gp_useReducer, useMemo: gp_useMemo, useCallback: gp_useCallback } = React;

// Render the actual map background — iso-flavored hand-drawn floor + path + props
function MapRender({ map }) {
  const path = map.path;
  if (!path || path.length === 0) return null;

  // build path d string
  const d = path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // scenic doodles per map
  const doodles = (() => {
    if (map.id === 'lobby') {
      return [
        { kind: 'sign', x: 100, y: 160 },
        { kind: 'plant', x: 540, y: 130 },
        { kind: 'coffee', x: 1180, y: 700 },
        { kind: 'plant', x: 950, y: 700 },
      ];
    }
    if (map.id === 'sanctuary') {
      return [
        { kind: 'cross', x: 1200, y: 130 },
        { kind: 'pulpit', x: 1180, y: 320 },
        { kind: 'pew', x: 320, y: 200 },
        { kind: 'pew', x: 320, y: 420 },
        { kind: 'pew', x: 660, y: 200 },
        { kind: 'pew', x: 660, y: 420 },
      ];
    }
    if (map.id === 'fellowship') {
      return [
        { kind: 'table', x: 100, y: 200 },
        { kind: 'table', x: 380, y: 660 },
        { kind: 'table', x: 750, y: 280 },
        { kind: 'table', x: 1050, y: 660 },
        { kind: 'coffee', x: 1200, y: 200 },
      ];
    }
    return [];
  })();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* floor — soft tinted paper with grid */}
      <div className="paper-plain" style={{
        position: 'absolute', inset: 0,
        background: `var(--paper)`,
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(61,90,128,0.05) 0 1px, transparent 1px 32px),
          repeating-linear-gradient(90deg, rgba(61,90,128,0.05) 0 1px, transparent 1px 32px)`,
      }} />
      {/* large coffee stains scattered */}
      <div className="coffee-stain" style={{ width: 200, height: 160, top: -30, right: 60 }} />
      <div className="coffee-stain" style={{ width: 130, height: 110, bottom: 40, left: 40 }} />

      {/* path */}
      <svg width="1280" height="800" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* drop shadow */}
        <path d={d} stroke="rgba(0,0,0,0.18)" strokeWidth="60" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(2,4)" />
        {/* tile-base path (warm wood color) */}
        <path d={d} stroke="#c9a26a" strokeWidth="56" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* inner darker stripe */}
        <path d={d} stroke="#a8814a" strokeWidth="44" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* dashed center marker */}
        <path d={d} stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 9" opacity="0.5" />
        {/* outline */}
        <path d={d} stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        {/* spawn point — yellow circle */}
        <circle cx={path[0].x} cy={path[0].y} r="20" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="3" />
        <text x={path[0].x} y={path[0].y + 5} textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill="#1A1A1A">IN</text>
        {/* base — last point */}
        <circle cx={path[path.length-1].x} cy={path[path.length-1].y} r="32" fill="#E63946" stroke="#1A1A1A" strokeWidth="3" />
        <circle cx={path[path.length-1].x} cy={path[path.length-1].y} r="22" fill="#FBF6E9" stroke="#1A1A1A" strokeWidth="2" />
        <text x={path[path.length-1].x} y={path[path.length-1].y + 6} textAnchor="middle" fontFamily="Caveat" fontSize="20" fontWeight="700" fill="#E63946">BASE</text>
      </svg>

      {/* doodles */}
      {doodles.map((d, i) => <MapDoodle key={i} {...d} />)}
    </div>
  );
}

function HUD({ state, onPause, onSpeed, onMenu, onStartWave, totalWaves, autoStartIn }) {
  const wave = state.waveIndex >= 0 ? state.wavePack[state.waveIndex] : null;
  return (
    <div className="hud" style={{ left: 0, top: 0, right: 0, padding: '10px 12px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        {/* lives */}
        <div className="sketch-box-tight" style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 88 }}>
          <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-soft)' }}>COOKIES LEFT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 26, fontWeight: 700, color: state.lives <= 5 ? 'var(--red)' : 'var(--ink)', lineHeight: 1 }}>{state.lives}</span>
            <span style={{ fontSize: 18 }}>🍪</span>
          </div>
        </div>
        {/* spirit */}
        <div className="sketch-box-tight" style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 110, background: 'var(--yellow)' }}>
          <div className="t-mono" style={{ fontSize: 9 }}>COMMUNITY SPIRIT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{state.spirit}</span>
            <span style={{ fontSize: 18 }}>♥</span>
          </div>
        </div>
        {/* wave info */}
        <div className="sketch-box-tight" style={{ padding: '4px 12px', flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-soft)' }}>WAVE</div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {state.waveIndex + 1}<span style={{ color: 'var(--ink-soft)', fontSize: 16 }}> / {totalWaves}</span>
            </div>
          </div>
          {wave && (
            <div style={{ flex: 1, paddingLeft: 10, borderLeft: '2px dashed var(--ink-faint)', minWidth: 0 }}>
              <div className="h-subtitle" style={{ fontSize: 20, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{wave.name}</div>
              <div className="t-mono" style={{ color: 'var(--ink-soft)', fontSize: 10 }}>
                {state.waveActive ? (
                  <>● ACTIVE — {state.waveQueue.length} incoming · {state.enemies.length} on map</>
                ) : (
                  <>○ wave complete — ready for next</>
                )}
              </div>
            </div>
          )}
          {!state.waveActive && state.waveIndex < totalWaves - 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {autoStartIn != null && state.waveIndex >= 0 && (
                <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                  auto-start in <span style={{ color: 'var(--red)', fontWeight: 700 }}>{autoStartIn}s</span>
                </div>
              )}
              <button className="btn btn--red btn--sm" onClick={onStartWave}>
                ▶ {state.waveIndex < 0 ? 'START' : 'NEXT'}
              </button>
            </div>
          )}
        </div>
        {/* speed/pause */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn--ghost btn--sm" onClick={onPause}>{state.paused ? '▶' : '❚❚'}</button>
          <button className={`btn btn--sm ${state.speed > 1 ? 'btn--yellow' : 'btn--ghost'}`} onClick={onSpeed}>
            {state.speed}×
          </button>
          <button className="btn btn--ghost btn--sm" onClick={onMenu}>⌂</button>
        </div>
      </div>
    </div>
  );
}

function DefPillTooltip({ def }) {
  const stats = [];
  if (def.damage > 0) stats.push(['DMG', def.damage]);
  if (def.range > 0) stats.push(['RNG', def.range]);
  if (def.rate > 0) stats.push(['RPS', def.rate]);
  if (def.splash > 0) stats.push(['SPLASH', def.splash]);
  if (def.slow > 0) stats.push(['SLOW', `${Math.round(def.slow * 100)}%`]);
  if (def.knockback > 0) stats.push(['KNOCKBK', def.knockback]);
  if (def.income) stats.push(['INCOME', `+${def.income}/5s`]);
  if (def.buff) stats.push([def.buff.type === 'attackSpeed' ? 'ATK SPD' : 'DMG BUFF', `×${def.buff.mult}`]);
  return (
    <div className="sketch-box" style={{
      position: 'absolute', left: '50%', bottom: 'calc(100% + 14px)',
      transform: 'translateX(-50%)',
      padding: '10px 12px', width: 220,
      background: 'var(--paper)', zIndex: 200, pointerEvents: 'none',
      boxShadow: '4px 4px 0 var(--ink)',
    }}>
      <div className="t-mono" style={{ fontSize: 10, color: def.color, fontWeight: 700, letterSpacing: '0.05em' }}>{def.roleLabel}</div>
      <div className="h-subtitle" style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{def.name}</div>
      <div className="t-body" style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.3 }}>"{def.flavor}"</div>
      <div className="t-body" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.3 }}>{def.ability}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', marginTop: 8, paddingTop: 6, borderTop: '1.5px dashed var(--ink-faint)' }}>
        {stats.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-soft)', letterSpacing: '0.05em' }}>{k}</span>
            <span className="t-mono" style={{ fontSize: 11, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', gridColumn: '1 / -1', marginTop: 2, paddingTop: 4, borderTop: '1px dashed var(--ink-faint)' }}>
          <span className="t-mono" style={{ fontSize: 9, color: 'var(--ink-soft)' }}>COST</span>
          <span className="t-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{def.cost}♥</span>
        </div>
      </div>
    </div>
  );
}

function DefPill({ d, selected, cant, onPick }) {
  const [hover, setHover] = gp_useState(false);
  const timerRef = gp_useRef(null);
  const enter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHover(true), 1500);
  };
  const leave = () => {
    clearTimeout(timerRef.current);
    setHover(false);
  };
  return (
    <div
      className={`def-pill ${selected ? 'selected' : ''} ${cant ? 'cant-afford' : ''}`}
      style={{ width: 78 }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={(e) => { e.stopPropagation(); leave(); if (!cant) onPick(d); }}
      title={d.name}>
      <div className={`role-stripe ${d.role}`} style={{ width: 4 }} />
      <div style={{ height: 44, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)' }}>
          <DefenderIcon def={d} size={36} />
        </div>
      </div>
      <div className="t-mono" style={{ fontSize: 9, lineHeight: 1.1, marginTop: 2, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {d.name.replace('The ', '').replace("'s", "'s")}
      </div>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: 700, marginTop: 1, color: cant ? 'var(--ink-soft)' : 'var(--red)', lineHeight: 1 }}>
        {d.cost}♥
      </div>
      {hover && <DefPillTooltip def={d} />}
    </div>
  );
}

function ShopTray({ state, onPick, selectedDef }) {
  return (
    <div className="hud" style={{ left: 0, right: 0, bottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 12px 12px' }}>
        <div className="sketch-box" style={{ padding: '8px 10px', display: 'flex', gap: 6, alignItems: 'center', maxWidth: 1240 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 8, borderRight: '2px dashed var(--ink-faint)', flexShrink: 0 }}>
            <div className="t-mono" style={{ fontSize: 9, color: 'var(--ink-soft)' }}>BUY A</div>
            <div className="h-subtitle" style={{ fontSize: 18, lineHeight: 1, marginTop: 2, whiteSpace: 'nowrap' }}>FRIEND</div>
          </div>
          {DEFENDERS.map(d => (
            <DefPill key={d.id}
              d={d}
              selected={selectedDef?.id === d.id}
              cant={state.spirit < d.cost}
              onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectedDefenderPanel({ defender, onSell, onClose }) {
  if (!defender) return null;
  return (
    <div className="hud" style={{ right: 16, top: 90, width: 250 }}>
      <div className="sketch-box" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="h-subtitle" style={{ fontSize: 24 }}>{defender.def.name}</div>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
        </div>
        <div className="t-body" style={{ fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic' }}>"{defender.def.flavor}"</div>
        <div className="t-body" style={{ fontSize: 14, marginTop: 8 }}>{defender.def.ability}</div>
        <button className="btn btn--red btn--sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={onSell}>
          Sell · +{Math.floor(defender.def.cost * 0.6)}♥
        </button>
      </div>
    </div>
  );
}

function GameScreen({ map, onMenu, onWin, onLose, defaultSpeed, hardMode, cardLayout }) {
  const wavePack = WAVE_PACKS[map.waves] || WAVE_PACKS.standard;
  const [state, setState] = gp_useState(() => {
    let s = makeInitialState(map, wavePack);
    s.speed = defaultSpeed || 1;
    if (hardMode) {
      s.lives = Math.floor(s.lives * 0.7);
      s.spirit = Math.floor(s.spirit * 0.85);
    }
    return s;
  });

  const stateRef = gp_useRef(state);
  stateRef.current = state;
  const [showWaveIntro, setShowWaveIntro] = gp_useState(false);
  const [pendingWave, setPendingWave] = gp_useState(null);
  const stageRef = gp_useRef(null);
  const [mouse, setMouse] = gp_useState({ x: 0, y: 0, in: false });
  const [autoStartAt, setAutoStartAt] = gp_useState(null);
  const [autoTick, setAutoTick] = gp_useState(0);
  const prevWaveActiveRef = gp_useRef(false);

  // game loop
  gp_useEffect(() => {
    let raf = 0; let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setState(s => step(s, dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // result handling
  gp_useEffect(() => {
    if (state.won) setTimeout(() => onWin(state), 600);
    if (state.lost) setTimeout(() => onLose(state), 600);
  }, [state.won, state.lost]);

  // Detect wave-end transition: arm a 15s auto-advance timer.
  gp_useEffect(() => {
    const wasActive = prevWaveActiveRef.current;
    prevWaveActiveRef.current = state.waveActive;
    if (wasActive && !state.waveActive
        && state.waveIndex >= 0
        && state.waveIndex < wavePack.length - 1
        && !state.won && !state.lost) {
      setAutoStartAt(Date.now() + 15000);
    }
  }, [state.waveActive, state.waveIndex, state.won, state.lost]);

  // Cancel auto-advance on win/lose.
  gp_useEffect(() => {
    if (state.won || state.lost) setAutoStartAt(null);
  }, [state.won, state.lost]);

  // Tick + fire auto-advance when timer elapses.
  gp_useEffect(() => {
    if (autoStartAt == null) return;
    const i = setInterval(() => {
      if (Date.now() >= autoStartAt) {
        setAutoStartAt(null);
        setState(s => s.waveActive ? s : startWave(s));
      } else {
        setAutoTick(n => n + 1);
      }
    }, 250);
    return () => clearInterval(i);
  }, [autoStartAt]);

  const autoStartIn = autoStartAt != null
    ? Math.max(0, Math.ceil((autoStartAt - Date.now()) / 1000))
    : null;

  // mouse tracking on stage
  const handleMouseMove = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const scale = rect.width / 1280;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setMouse({ x, y, in: true });
  };
  const handleMouseLeave = () => setMouse(m => ({ ...m, in: false }));

  const handleStageClick = (e) => {
    if (!state.placing) {
      // try to select a defender
      const rect = stageRef.current.getBoundingClientRect();
      const scale = rect.width / 1280;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      const found = state.defenders.find(d => Math.hypot(d.x - x, d.y - y) < 32);
      setState(s => ({ ...s, selectedDefenderId: found ? found.id : null }));
      return;
    }
    setState(s => placeDefender(s, s.placing, mouse.x, mouse.y));
  };

  const startNextWave = () => {
    const next = state.waveIndex + 1;
    if (next >= wavePack.length) return;
    setAutoStartAt(null);
    setPendingWave({ idx: next, wave: wavePack[next] });
    setShowWaveIntro(true);
    setState(s => ({ ...s, paused: true }));
  };
  const confirmWave = () => {
    setShowWaveIntro(false);
    setState(s => startWave({ ...s, paused: false }));
    setPendingWave(null);
  };

  // is placing valid?
  const placingValid = state.placing && distToPath(mouse.x, mouse.y, map.path) >= PATH_WIDTH
    && !state.defenders.some(d => Math.hypot(d.x - mouse.x, d.y - mouse.y) < 44)
    && state.spirit >= state.placing.cost;

  const selectedDefender = state.defenders.find(d => d.id === state.selectedDefenderId);

  return (
    <div className="paper-plain" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleStageClick}
      onContextMenu={(e) => { e.preventDefault(); setState(s => ({ ...s, placing: null })); }}>
      <MapRender map={map} />

      {/* always-on faint range rings under each defender */}
      {state.defenders.map(d => (
        <div key={`rh-${d.id}`} className={`range-hint ${d.def.role}`} style={{
          left: d.x, top: d.y,
          width: d.def.range * 2, height: d.def.range * 2,
        }} />
      ))}

      {/* range ring for selected defender */}
      {selectedDefender && (
        <div className="range-ring" style={{
          left: selectedDefender.x, top: selectedDefender.y,
          width: selectedDefender.def.range * 2, height: selectedDefender.def.range * 2,
        }} />
      )}

      {/* defenders */}
      {state.defenders.map(d => (
        <div key={d.id}
          onClick={(e) => { e.stopPropagation(); setState(s => ({ ...s, selectedDefenderId: d.id, placing: null })); }}
          style={{ position: 'absolute', left: d.x, top: d.y, transform: 'translate(-50%, -100%)', cursor: 'pointer', zIndex: Math.floor(d.y) }}
        >
          <DefenderSprite def={d.def} x={0} y={0} />
        </div>
      ))}

      {/* enemies */}
      {state.enemies.map(e => (
        <EnemySprite key={e.id} enemy={e} x={e.x} y={e.y}
          hpPct={e.hp / e.hpMax}
          slowed={e.slowUntil > state.t} />
      ))}

      {/* projectiles */}
      {state.projectiles.map(p => {
        const tgt = state.enemies.find(e => e.id === p.targetId);
        const dx = tgt ? tgt.x - p.x : 0;
        const dy = tgt ? (tgt.y - 30) - p.y : 0;
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        return (
          <React.Fragment key={p.id}>
            <div className="proj-trail" style={{
              left: p.x, top: p.y,
              width: 28, transform: `translate(-100%, -50%) rotate(${ang}deg)`,
              transformOrigin: 'right center',
            }} />
            <div className="projectile" style={{ left: p.x, top: p.y, zIndex: 1000 }}>{p.emoji}</div>
          </React.Fragment>
        );
      })}

      {/* fx */}
      {state.fx.map(f => {
        if (f.kind === 'muzzle') {
          return <div key={f.id} className="muzzle-flash" style={{ left: f.x, top: f.y, zIndex: 900 }} />;
        }
        if (f.kind === 'handshake') {
          // 🤝 emoji travels from Greeter to target, with a small shake on arrival
          const p = Math.min(1, f.t / f.life);
          const x = f.sx + (f.ex - f.sx) * p;
          const y = f.sy + (f.ey - f.sy) * p - Math.sin(p * Math.PI) * 12; // gentle arc
          // shake increases as it approaches the target ("vigorous" handshake)
          const shake = p > 0.6 ? Math.sin(p * 80) * 4 : 0;
          const scale = 1 + Math.sin(p * Math.PI) * 0.4;
          const opacity = p < 0.85 ? 1 : (1 - p) / 0.15;
          return (
            <div key={f.id} style={{
              position: 'absolute', left: x + shake, top: y,
              fontSize: 26,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${shake * 4}deg)`,
              opacity,
              filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))',
              pointerEvents: 'none', zIndex: 1100,
            }}>🤝</div>
          );
        }
        if (f.kind === 'highfive') {
          // 🙌 emoji that travels from defender to target and pops on impact
          const p = Math.min(1, f.t / f.life);
          const x = f.sx + (f.ex - f.sx) * p;
          const y = f.sy + (f.ey - f.sy) * p - Math.sin(p * Math.PI) * 16; // gentle arc
          const scale = 1 + Math.sin(p * Math.PI) * 0.6;
          const opacity = p < 0.85 ? 1 : (1 - p) / 0.15;
          return (
            <div key={f.id} style={{
              position: 'absolute', left: x, top: y,
              fontSize: 26,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${(p - 0.5) * 30}deg)`,
              opacity,
              filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))',
              pointerEvents: 'none', zIndex: 1100,
            }}>🙌</div>
          );
        }
        if (f.kind === 'splash') {
          const a = Math.max(0, 1 - f.t / f.life);
          return <div key={f.id} style={{
            position: 'absolute', left: f.x, top: f.y,
            width: f.r * 2, height: f.r * 2, borderRadius: '50%',
            border: `2px solid rgba(123,94,167,${a})`,
            background: `rgba(123,94,167,${a*0.18})`,
            transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 1100,
          }} />;
        }
        if (f.kind === 'dmg') {
          return <div key={f.id} className="dmg-num" style={{
            left: f.x, top: f.y - f.t * 30, opacity: 1 - f.t/f.life, zIndex: 1200,
          }}>-{f.val}</div>;
        }
        if (f.kind === 'pop') {
          const a = Math.max(0, 1 - f.t/f.life);
          return <div key={f.id} style={{
            position: 'absolute', left: f.x, top: f.y,
            width: 36, height: 36, borderRadius: '50%',
            background: `radial-gradient(rgba(255,210,63,${a}), transparent 70%)`,
            transform: `translate(-50%, -50%) scale(${1 + f.t * 2})`,
            pointerEvents: 'none', zIndex: 1100,
          }} />;
        }
        return null;
      })}

      {/* placement ghost */}
      {state.placing && mouse.in && (
        <>
          <div className={`place-ghost ${!placingValid ? 'bad' : ''}`}
            style={{ left: mouse.x, top: mouse.y }} />
          <div style={{
            position: 'absolute', left: mouse.x, top: mouse.y,
            width: state.placing.range * 2, height: state.placing.range * 2,
            borderRadius: '50%', border: '2px dashed rgba(61, 90, 128, 0.5)',
            background: 'rgba(61, 90, 128, 0.05)',
            transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', left: mouse.x, top: mouse.y, transform: 'translate(-50%, -100%)', opacity: 0.7, pointerEvents: 'none', zIndex: 5000 }}>
            <DefenderSprite def={state.placing} x={0} y={0} />
          </div>
        </>
      )}

      <HUD state={state}
        totalWaves={wavePack.length}
        autoStartIn={autoStartIn}
        onPause={() => setState(s => ({ ...s, paused: !s.paused }))}
        onSpeed={() => setState(s => ({ ...s, speed: s.speed >= 3 ? 1 : s.speed + 1 }))}
        onMenu={onMenu}
        onStartWave={startNextWave} />

      <ShopTray state={state}
        selectedDef={state.placing}
        onPick={(d) => setState(s => ({ ...s, placing: s.placing?.id === d.id ? null : d, selectedDefenderId: null }))} />

      <SelectedDefenderPanel
        defender={selectedDefender}
        onSell={() => setState(s => sellDefender(s, s.selectedDefenderId))}
        onClose={() => setState(s => ({ ...s, selectedDefenderId: null }))} />

      {/* placement helper banner */}
      {state.placing && (
        <div className="hud" style={{ left: '50%', top: 80, transform: 'translateX(-50%)' }}>
          <div className="sketch-box-tight" style={{ padding: '4px 14px', background: 'var(--yellow)' }}>
            <span className="t-body" style={{ fontWeight: 700 }}>placing {state.placing.name} · click to plant · right-click to cancel</span>
          </div>
        </div>
      )}

      {showWaveIntro && pendingWave && (
        <WaveIntroOverlay
          wave={pendingWave.wave}
          idx={pendingWave.idx}
          total={wavePack.length}
          onGo={confirmWave} />
      )}

      {state.won && (
        <ResultOverlay won={true} mapName={map.name} wavesDone={wavePack.length} livesLeft={state.lives}
          onMenu={onMenu} onRetry={() => window.location.reload()} />
      )}
      {state.lost && (
        <ResultOverlay won={false} mapName={map.name} wavesDone={state.waveIndex + 1} livesLeft={0}
          onMenu={onMenu} onRetry={() => window.location.reload()} />
      )}
    </div>
  );
}

Object.assign(window, { GameScreen, HUD, ShopTray, SelectedDefenderPanel, MapRender });
