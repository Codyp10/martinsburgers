// screens.jsx — Menu, MapSelect, Roster, Settings, WaveIntro, Result overlays

const { useState, useEffect, useRef, useReducer, useMemo } = React;

function MainMenu({ onStart, onSettings, onRoster }) {
  return (
    <div className="paper" style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 18, padding: 40, overflow: 'hidden',
    }}>
      <div className="annotation annotation--blue" style={{ bottom: 80, left: 70, fontSize: 24, transform: 'rotate(6deg)' }}>(it's a real TD!)</div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: 'rotate(-2deg)', fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 78, lineHeight: 1, color: 'var(--red)' }}>
          The
        </div>
        <div style={{ transform: 'rotate(-2deg)', fontFamily: 'var(--font-hand)', fontWeight: 700, fontSize: 150, lineHeight: 0.95, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
          <span>Martins</span><span style={{ color: 'var(--blue)' }}>burgers</span>
        </div>
        <div className="h-subtitle" style={{ marginTop: 14, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
          a sketchy 2.5D tower defense
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <span className="tag tag--yellow" style={{ whiteSpace: 'nowrap' }}>v0.1 — playtest build</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24, alignItems: 'center' }}>
        <button className="btn btn--red pulse" style={{ fontSize: 38, padding: '10px 50px 4px' }} onClick={onStart}>
          ▶ PLAY
        </button>
        <button className="btn btn--blue" onClick={onRoster}>👥 The Crew</button>
        <button className="btn btn--ghost" onClick={onSettings}>⚙ Settings</button>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', color: 'var(--ink-soft)' }} className="t-mono">
        defend the church · buy donuts · do not let The Committee reach the cookies
      </div>
    </div>
  );
}

function Settings({ onBack, music, sound, speed, hardMode, setMusic, setSound, setSpeed, setHardMode }) {
  return (
    <div className="paper" style={{ width: '100%', height: '100%', padding: '60px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 32 }}>
        <button className="btn btn--ghost btn--sm" onClick={onBack}>← back</button>
        <div className="h-title">Settings</div>
      </div>
      <div style={{ maxWidth: 600 }} className="sketch-box" >
        <div style={{ padding: '24px 30px' }}>
          <div className="set-row">
            <div>
              <div className="h-subtitle" style={{ fontSize: 28 }}>Music</div>
              <div className="t-body" style={{ color: 'var(--ink-soft)' }}>The Sound Booth Guy's playlist</div>
            </div>
            <div className={`toggle ${music ? 'on' : ''}`} onClick={() => setMusic(!music)} />
          </div>
          <div className="set-row">
            <div>
              <div className="h-subtitle" style={{ fontSize: 28 }}>Sound FX</div>
              <div className="t-body" style={{ color: 'var(--ink-soft)' }}>Hand-claps and donut splats</div>
            </div>
            <div className={`toggle ${sound ? 'on' : ''}`} onClick={() => setSound(!sound)} />
          </div>
          <div className="set-row">
            <div>
              <div className="h-subtitle" style={{ fontSize: 28 }}>Game Speed</div>
              <div className="t-body" style={{ color: 'var(--ink-soft)' }}>Default playback speed</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 1.5, 2].map(s => (
                <button key={s} className={`btn btn--sm ${speed === s ? 'btn--yellow' : 'btn--ghost'}`} onClick={() => setSpeed(s)}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
          <div className="set-row" style={{ borderBottom: 'none' }}>
            <div>
              <div className="h-subtitle" style={{ fontSize: 28 }}>Committee Mode</div>
              <div className="t-body" style={{ color: 'var(--ink-soft)' }}>Hard mode. Everyone has follow-up questions.</div>
            </div>
            <div className={`toggle ${hardMode ? 'on' : ''}`} onClick={() => setHardMode(!hardMode)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapSelect({ onBack, onPick, completed }) {
  return (
    <div className="paper" style={{ width: '100%', height: '100%', padding: '36px 60px', overflow: 'auto' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button className="btn btn--ghost btn--sm" onClick={onBack}>← back</button>
          <div className="h-title" style={{ fontSize: 38, lineHeight: 1, whiteSpace: 'nowrap' }}>Pick a Battlefield</div>
        </div>
        <div className="t-body" style={{ color: 'var(--ink-soft)', marginTop: 6, fontSize: 15, marginLeft: 4 }}>
          Each map has its own quirks. Start at The Lobby if you're new.
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        {MAPS.map(m => (
          <div key={m.id} className={`map-card ${!m.unlocked ? 'locked' : ''}`} onClick={() => m.unlocked && onPick(m)}>
            {completed[m.id] && <div className="ribbon">CLEARED!</div>}
            <div style={{ height: 160, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
              <MapMini map={m} />
            </div>
            <div style={{ padding: '10px 16px 14px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div className="h-subtitle" style={{ fontSize: 20, lineHeight: 1, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: 12, color: i < m.difficulty ? 'var(--red)' : 'var(--ink-faint)' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="t-body" style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4, lineHeight: 1.3 }}>{m.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Roster({ onBack }) {
  const [selected, setSelected] = useState(DEFENDERS[0]);
  const [layout, setLayout] = useState('detailed'); // controlled by Tweaks too

  return (
    <div className="paper" style={{ width: '100%', height: '100%', padding: '40px 60px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
        <button className="btn btn--ghost btn--sm" onClick={onBack}>← back</button>
        <div className="h-title" style={{ fontSize: 48, lineHeight: 1 }}>The Crew</div>
        <div className="t-body" style={{ color: 'var(--ink-soft)', fontSize: 16 }}>
          ten friends. one mission. infinite donuts.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, flex: 1, minHeight: 0 }}>
        {/* roster list */}
        <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 10 }} className="scroll-area">
          {DEFENDERS.map(d => (
            <div key={d.id} className={`def-card ${selected.id === d.id ? 'selected' : ''}`}
              onClick={() => setSelected(d)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px 10px 22px' }}>
              <div className={`role-stripe ${d.role}`} />
              <DefenderIcon def={d} size={48} />
              <div style={{ flex: 1, paddingLeft: 4 }}>
                <div className="h-subtitle" style={{ fontSize: 24, lineHeight: 1 }}>{d.name}</div>
                <div className="t-mono" style={{ color: 'var(--ink-soft)', fontSize: 11 }}>{d.roleLabel} · {d.cost}♥</div>
              </div>
            </div>
          ))}
        </div>

        {/* detail card */}
        <DetailCard def={selected} layout={layout} />
      </div>
    </div>
  );
}

function DetailCard({ def, layout = 'detailed' }) {
  if (layout === 'trading-card') {
    return (
      <div className="sketch-box" style={{ flex: 1, padding: 28, position: 'relative', maxWidth: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'flex-start' }}>
        <div className="ribbon" style={{ background: def.color, top: 24, right: -10, fontSize: 20 }}>{def.roleLabel}</div>
        <div className="h-title" style={{ fontSize: 44, textAlign: 'center', marginTop: 4 }}>{def.name}</div>
        <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--paper-2)', border: '2.5px solid var(--ink)', borderRadius: 6, marginTop: 14, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="hatch-soft" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
          <div style={{ transform: 'scale(2.2)' }}>
            <DefenderIcon def={def} size={64} />
          </div>
        </div>
        <div className="h-subtitle" style={{ fontSize: 26, marginTop: 16, color: def.color, textAlign: 'center' }}>{def.ability.split(' — ')[0]}</div>
        <div className="t-body" style={{ marginTop: 6, fontSize: 16, textAlign: 'center', maxWidth: 380 }}>"{def.flavor}"</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15 }}>
          {def.damage > 0 && <Stat label="DMG" val={def.damage} />}
          {def.range > 0 && <Stat label="RNG" val={def.range} />}
          {def.rate > 0 && <Stat label="RPS" val={def.rate} />}
          {def.income && <Stat label="INC" val={`+${def.income}/5s`} />}
          <Stat label="COST" val={`${def.cost}♥`} accent />
        </div>
      </div>
    );
  }

  if (layout === 'minimal') {
    return (
      <div style={{ flex: 1, padding: '40px 60px', maxWidth: 540 }}>
        <div className="t-mono" style={{ color: def.color, fontWeight: 700 }}>{def.roleLabel}</div>
        <div className="h-display" style={{ fontSize: 64, lineHeight: 0.95, marginTop: 4 }}>{def.name}</div>
        <div className="underline-wob" style={{ display: 'inline-block', height: 12, width: 80, background: 'none' }} />
        <div className="t-body" style={{ marginTop: 24, fontSize: 18 }}>{def.flavor}</div>
        <div style={{ marginTop: 24 }}>
          <div className="h-section" style={{ fontSize: 18 }}>Ability</div>
          <div className="t-body" style={{ marginTop: 4 }}>{def.ability}</div>
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 28, paddingTop: 18, borderTop: '1.5px dashed var(--ink-faint)' }}>
          {def.damage > 0 && <Stat label="DMG" val={def.damage} />}
          {def.range > 0 && <Stat label="RNG" val={def.range} />}
          {def.rate > 0 && <Stat label="RPS" val={def.rate} />}
          {def.income && <Stat label="INC" val={`+${def.income}`} />}
          <Stat label="COST" val={`${def.cost}♥`} accent />
        </div>
      </div>
    );
  }

  // DEFAULT: detailed dossier
  return (
    <div className="sketch-box" style={{ flex: 1, padding: 28, position: 'relative' }}>
      <div className="hatch-soft" style={{ position: 'absolute', top: 30, right: 30, width: 80, height: 80, opacity: 0.3, borderRadius: 4 }} />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', padding: 8, background: 'var(--paper-2)', border: '2.5px solid var(--ink)', borderRadius: 8 }}>
          <div style={{ transform: 'scale(1.6)', transformOrigin: 'top left', width: 100, height: 130 }}>
            <DefenderIcon def={def} size={64} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="t-mono" style={{ color: def.color, fontWeight: 700 }}>FILE #{DEFENDERS.indexOf(def) + 1} · {def.roleLabel}</div>
          <div className="h-title" style={{ fontSize: 50, lineHeight: 1, marginTop: 4 }}>{def.name}</div>
          <div className="t-body" style={{ marginTop: 12, fontSize: 18, color: 'var(--ink-2)', fontStyle: 'italic' }}>"{def.flavor}"</div>
        </div>
      </div>
      <div style={{ marginTop: 22, padding: '14px 18px', background: 'var(--paper-2)', border: '2px solid var(--ink)', borderRadius: 6 }}>
        <div className="h-section" style={{ fontSize: 18, color: def.color }}>Ability</div>
        <div className="t-body" style={{ marginTop: 4, fontSize: 17 }}>{def.ability}</div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 22, justifyContent: 'space-around' }}>
        {def.damage > 0 && <Stat label="DAMAGE" val={def.damage} big />}
        {def.range > 0 && <Stat label="RANGE" val={def.range} big />}
        {def.rate > 0 && <Stat label="ATK/SEC" val={def.rate} big />}
        {def.splash > 0 && <Stat label="SPLASH" val={def.splash} big />}
        {def.slow > 0 && <Stat label="SLOW" val={`${Math.round(def.slow*100)}%`} big />}
        {def.income && <Stat label="INCOME" val={`+${def.income}/5s`} big />}
        <Stat label="COST" val={`${def.cost}♥`} accent big />
      </div>
    </div>
  );
}

function Stat({ label, val, accent, big }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 70 }}>
      <div className="t-mono" style={{ fontSize: big ? 11 : 10, color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>{label}</div>
      <div className="t-stat" style={{ color: accent ? 'var(--red)' : 'var(--ink)', fontSize: big ? 26 : 18, marginTop: 2 }}>{val}</div>
    </div>
  );
}

function WaveIntroOverlay({ wave, idx, total, onGo }) {
  return (
    <div className="overlay">
      <div className="sketch-box" style={{ padding: '32px 48px', textAlign: 'center', minWidth: 540, maxWidth: 720, transform: 'rotate(-1.5deg)' }}>
        <div className="t-mono" style={{ color: 'var(--ink-soft)' }}>WAVE {idx + 1} OF {total}</div>
        <div className="stamp" style={{ marginTop: 8 }}>incoming!</div>
        <div className="h-title" style={{ fontSize: 48, marginTop: 14, lineHeight: 1.05 }}>{wave.name}</div>
        <div className="t-body" style={{ marginTop: 10, color: 'var(--ink-soft)', fontSize: 16 }}>
          {wave.spawns.map(s => `${s.count}× ${ENEMIES[s.type].name}`).join(' · ')}
        </div>
        <button className="btn btn--red" style={{ marginTop: 22, whiteSpace: 'nowrap' }} onClick={onGo}>SEND THEM IN ▶</button>
      </div>
    </div>
  );
}

function ResultOverlay({ won, onMenu, onRetry, mapName, wavesDone, livesLeft }) {
  return (
    <div className="overlay">
      <div className="sketch-box" style={{ padding: '36px 56px', textAlign: 'center', minWidth: 540, maxWidth: 720, transform: 'rotate(-1deg)' }}>
        <div className="stamp" style={{ background: won ? 'var(--grass)' : 'var(--red)', color: 'var(--paper)', borderColor: won ? 'var(--grass)' : 'var(--red)' }}>
          {won ? 'VICTORY!' : 'OVERRUN'}
        </div>
        <div className="h-title" style={{ fontSize: 48, marginTop: 16, lineHeight: 1.05 }}>
          {won ? 'The cookies are safe.' : 'They got the cookies.'}
        </div>
        <div className="t-body" style={{ marginTop: 12, fontSize: 18, color: 'var(--ink-soft)' }}>
          {mapName} · {wavesDone} waves cleared · {livesLeft} lives remaining
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <button className="btn btn--ghost" onClick={onMenu}>← Main Menu</button>
          <button className="btn btn--red" onClick={onRetry}>Play Again ↻</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  MainMenu, Settings, MapSelect, Roster, DetailCard, Stat,
  WaveIntroOverlay, ResultOverlay,
});
