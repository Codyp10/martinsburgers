// sprites.jsx — Hand-drawn SVG chibi sprites for defenders, enemies, props
// All sprites are ~60-70px tall, rendered as inline SVG for crispness.

// SKETCHY filter — applied via CSS filter:url(#wobble)
// The filter is defined once in index.html

// generic chibi body — circle head, oval body, stick limbs
function ChibiBody({ bodyColor = '#E63946', hairColor = '#1A1A1A', accent, scale = 1, flip = false, animOffset = 0 }) {
  const w = 56 * scale, h = 72 * scale;
  return (
    <svg width={w} height={h} viewBox="0 0 56 72" style={{ transform: flip ? 'scaleX(-1)' : undefined }}>
      {/* legs */}
      <path d="M22 56 L 20 70" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M34 56 L 36 70" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* shoes */}
      <ellipse cx="19" cy="70" rx="4" ry="2" fill="#1A1A1A" />
      <ellipse cx="37" cy="70" rx="4" ry="2" fill="#1A1A1A" />
      {/* body — sketchy rect */}
      <path d="M14 30 Q 12 32 14 56 Q 28 60 42 56 Q 44 32 42 30 Q 28 26 14 30 Z"
        fill={bodyColor} stroke="#1A1A1A" strokeWidth="2.2" strokeLinejoin="round" />
      {/* arms */}
      <path d="M14 34 Q 6 42 8 52" stroke="#1A1A1A" strokeWidth="2.3" strokeLinecap="round" fill="none" />
      <path d="M42 34 Q 50 42 48 52" stroke="#1A1A1A" strokeWidth="2.3" strokeLinecap="round" fill="none" />
      {/* hands */}
      <circle cx="8" cy="52" r="3" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="1.5" />
      <circle cx="48" cy="52" r="3" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="1.5" />
      {/* head */}
      <circle cx="28" cy="20" r="11" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="2.2" />
      {/* hair */}
      <path d="M17 17 Q 18 8 28 7 Q 38 8 39 17 Q 35 13 28 13 Q 21 13 17 17 Z"
        fill={hairColor} stroke="#1A1A1A" strokeWidth="1.5" />
      {/* eyes */}
      <circle cx="24" cy="20" r="1.3" fill="#1A1A1A" />
      <circle cx="32" cy="20" r="1.3" fill="#1A1A1A" />
      {/* smile */}
      <path d="M24 25 Q 28 28 32 25" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* accent emoji over head */}
      {accent && (
        <text x="28" y="3" fontSize="11" textAnchor="middle" dominantBaseline="hanging" style={{ fontFamily: 'sans-serif' }}>{accent}</text>
      )}
    </svg>
  );
}

// Defender sprite — slight bob animation
const DEFENDER_IMAGES = {
  greeter: 'assets/characters/greeter.png',
  hypeman: 'assets/characters/hype-man.png',
  handout: 'assets/characters/handout-giver.png',
  coffee: 'assets/characters/coffee-tosser.png',
  talker: 'assets/characters/talker.png',
  usher: 'assets/characters/usher.png',
  soundbooth: 'assets/characters/sound-booth-guy.png',
  snackrunner: 'assets/characters/snack-runner.png',
  organizer: 'assets/characters/organizer.png',
  pk: 'assets/characters/pastors-kid.png',
};

function DefenderSprite({ def, x, y, firing = false, scale = 1 }) {
  const imgSrc = DEFENDER_IMAGES[def.id];
  return (
    <div className="sprite" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
      <div className="sprite-shadow" style={{ position: 'absolute', left: '50%', top: '100%', marginTop: -4 }} />
      <div style={{
        animation: 'wobble 2.4s ease-in-out infinite',
        transformOrigin: 'bottom center',
      }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={def.name}
            style={{
              width: 56 * scale,
              height: 72 * scale,
              objectFit: 'contain',
              objectPosition: 'bottom',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
        ) : (
          <ChibiBody bodyColor={def.bodyColor} hairColor={def.hairColor} accent={def.accent} scale={scale} />
        )}
      </div>
    </div>
  );
}

// Enemy sprite — different "hat" indicates type
function EnemySprite({ enemy, x, y, hpPct, slowed }) {
  const e = enemy.def;
  // colored marker on head — plate, jacket, cone, glasses, crown
  const hatNode = (() => {
    switch (e.hat) {
      case 'plate':
        return <ellipse cx="28" cy="6" rx="13" ry="3" fill="#FBF6E9" stroke="#1A1A1A" strokeWidth="1.8" />;
      case 'jacket':
        return <path d="M14 30 L 14 56 L 42 56 L 42 30 Z" fill="#3D5A80" stroke="#1A1A1A" strokeWidth="2" opacity="0.9" />;
      case 'cone':
        return <path d="M22 8 L 28 -3 L 34 8 Z" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="1.8" />;
      case 'glasses':
        return (
          <g>
            <circle cx="24" cy="20" r="3.5" fill="none" stroke="#1A1A1A" strokeWidth="1.6" />
            <circle cx="32" cy="20" r="3.5" fill="none" stroke="#1A1A1A" strokeWidth="1.6" />
            <line x1="27.5" y1="20" x2="28.5" y2="20" stroke="#1A1A1A" strokeWidth="1.6" />
          </g>
        );
      case 'crown':
        return <path d="M16 8 L 20 -2 L 24 6 L 28 -4 L 32 6 L 36 -2 L 40 8 Z" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="1.8" />;
      default: return null;
    }
  })();

  return (
    <div className="sprite" style={{ left: x, top: y, zIndex: Math.floor(y) }}>
      <div className="sprite-shadow" style={{ position: 'absolute', left: '50%', top: '100%', marginTop: -4 }} />
      {/* HP bar */}
      <div style={{
        position: 'absolute', left: '50%', top: -10, transform: 'translateX(-50%)',
        width: 36, height: 4, background: 'rgba(0,0,0,0.2)',
        border: '1px solid #1A1A1A', borderRadius: 2,
      }}>
        <div style={{
          width: `${hpPct * 100}%`, height: '100%',
          background: hpPct > 0.5 ? '#52B788' : hpPct > 0.25 ? '#FFD23F' : '#E63946',
          transition: 'width 0.15s',
        }} />
      </div>
      <svg width="56" height="72" viewBox="0 0 56 72">
        <path d="M22 56 L 20 70" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M34 56 L 36 70" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="19" cy="70" rx="4" ry="2" fill="#1A1A1A" />
        <ellipse cx="37" cy="70" rx="4" ry="2" fill="#1A1A1A" />
        <path d="M14 30 Q 12 32 14 56 Q 28 60 42 56 Q 44 32 42 30 Q 28 26 14 30 Z"
          fill={e.color} stroke="#1A1A1A" strokeWidth="2.2" strokeLinejoin="round" opacity={slowed ? 0.7 : 1} />
        <path d="M14 34 Q 6 42 8 52" stroke="#1A1A1A" strokeWidth="2.3" strokeLinecap="round" fill="none" />
        <path d="M42 34 Q 50 42 48 52" stroke="#1A1A1A" strokeWidth="2.3" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="52" r="3" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="1.5" />
        <circle cx="48" cy="52" r="3" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="1.5" />
        <circle cx="28" cy="20" r="11" fill="#F4D6B8" stroke="#1A1A1A" strokeWidth="2.2" />
        {/* hair */}
        <path d="M17 17 Q 18 8 28 7 Q 38 8 39 17" fill="#5a4a3a" stroke="#1A1A1A" strokeWidth="1.4" />
        {/* eyes */}
        <circle cx="24" cy="20" r="1.3" fill="#1A1A1A" />
        <circle cx="32" cy="20" r="1.3" fill="#1A1A1A" />
        {/* mouth — varies */}
        {e.id === 'asker' ? (
          <ellipse cx="28" cy="25" rx="2" ry="2.5" fill="#1A1A1A" />
        ) : e.id === 'vbs' ? (
          <path d="M24 25 Q 28 30 32 25" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="#E63946" />
        ) : (
          <path d="M24 25 Q 28 26 32 25" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        )}
        {hatNode}
      </svg>
      {slowed && (
        <div style={{
          position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)',
          fontSize: 14,
        }}>💤</div>
      )}
    </div>
  );
}

// little flat icon for use in cards / buttons (no animation)
function DefenderIcon({ def, size = 64 }) {
  const imgSrc = DEFENDER_IMAGES[def.id];
  return (
    <div style={{ width: size, height: size * 1.3, position: 'relative' }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={def.name}
          style={{
            width: size,
            height: size * 1.3,
            objectFit: 'contain',
            objectPosition: 'bottom',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
      ) : (
        <ChibiBody bodyColor={def.bodyColor} hairColor={def.hairColor} accent={def.accent}
          scale={size / 56} />
      )}
    </div>
  );
}

// SKETCHY DOODLES used as scenic props on maps
function MapDoodle({ kind, x, y, scale = 1 }) {
  const w = 60 * scale, h = 60 * scale;
  const props = { width: w, height: h, viewBox: '0 0 60 60' };
  let body = null;
  switch (kind) {
    case 'pew':
      body = (
        <g>
          <rect x="4" y="22" width="52" height="10" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" rx="2" />
          <rect x="4" y="32" width="52" height="6" fill="#7a4a2a" stroke="#1A1A1A" strokeWidth="2" />
          <rect x="6" y="38" width="4" height="14" fill="#1A1A1A" />
          <rect x="50" y="38" width="4" height="14" fill="#1A1A1A" />
        </g>
      );
      break;
    case 'cross':
      body = (
        <g>
          <rect x="26" y="6" width="8" height="50" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" />
          <rect x="14" y="20" width="32" height="8" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" />
        </g>
      );
      break;
    case 'table':
      body = (
        <g>
          <ellipse cx="30" cy="28" rx="26" ry="12" fill="#FBF6E9" stroke="#1A1A1A" strokeWidth="2" />
          <rect x="10" y="40" width="40" height="16" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" rx="2" />
          {/* food blobs */}
          <ellipse cx="22" cy="26" rx="7" ry="4" fill="#F77F00" stroke="#1A1A1A" strokeWidth="1.5" />
          <ellipse cx="38" cy="28" rx="6" ry="3.5" fill="#52B788" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="30" cy="22" r="3" fill="#E63946" stroke="#1A1A1A" strokeWidth="1.5" />
        </g>
      );
      break;
    case 'coffee':
      body = (
        <g>
          <rect x="14" y="18" width="32" height="34" fill="#F4ECD0" stroke="#1A1A1A" strokeWidth="2" rx="3" />
          <rect x="14" y="18" width="32" height="8" fill="#7B5EA7" stroke="#1A1A1A" strokeWidth="2" />
          <text x="30" y="42" textAnchor="middle" fontFamily="Caveat" fontSize="14" fill="#1A1A1A" fontWeight="700">COFFEE</text>
          {/* steam */}
          <path d="M22 14 Q 24 8 22 4 M 30 14 Q 32 8 30 4 M 38 14 Q 40 8 38 4"
            stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
        </g>
      );
      break;
    case 'plant':
      body = (
        <g>
          <rect x="20" y="38" width="20" height="18" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" rx="2" />
          <path d="M30 38 Q 18 28 22 14 M 30 38 Q 42 28 38 14 M 30 38 L 30 10"
            stroke="#52B788" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="14" r="6" fill="#52B788" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="38" cy="14" r="6" fill="#52B788" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="30" cy="10" r="6" fill="#52B788" stroke="#1A1A1A" strokeWidth="1.5" />
        </g>
      );
      break;
    case 'pulpit':
      body = (
        <g>
          <path d="M14 50 L 18 18 L 42 18 L 46 50 Z" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" strokeLinejoin="round" />
          <rect x="20" y="22" width="20" height="6" fill="#7a4a2a" stroke="#1A1A1A" strokeWidth="1.5" />
          <text x="30" y="40" textAnchor="middle" fontFamily="Caveat" fontSize="9" fill="#FBF6E9" fontWeight="700">SERMON</text>
        </g>
      );
      break;
    case 'sign':
      body = (
        <g>
          <rect x="12" y="14" width="36" height="20" fill="#FBF6E9" stroke="#1A1A1A" strokeWidth="2" rx="2" />
          <rect x="28" y="34" width="4" height="22" fill="#1A1A1A" />
          <text x="30" y="27" textAnchor="middle" fontFamily="Caveat" fontSize="11" fill="#1A1A1A" fontWeight="700">WELCOME!</text>
        </g>
      );
      break;
    case 'door':
      body = (
        <g>
          <rect x="14" y="6" width="32" height="50" fill="#9a6a3a" stroke="#1A1A1A" strokeWidth="2" rx="2" />
          <circle cx="40" cy="32" r="2" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="1.5" />
          <line x1="14" y1="20" x2="46" y2="20" stroke="#1A1A1A" strokeWidth="1.5" />
        </g>
      );
      break;
    default:
      break;
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', zIndex: Math.floor(y) - 1 }}>
      <svg {...props}>{body}</svg>
    </div>
  );
}

// Map mini preview (used on map-select cards)
function MapMini({ map }) {
  // Render the path inside a 320x180 area scaled from 1280x800
  const sx = 290 / 1280;
  const sy = 180 / 800;
  if (!map.path || map.path.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Caveat', fontSize: 60, color: '#1A1A1A', opacity: 0.4,
      }}>🔒</div>
    );
  }
  const d = map.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * sx + 15} ${p.y * sy}`).join(' ');
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 180" style={{ display: 'block' }}>
      {/* paper grid */}
      <defs>
        <pattern id={`grid-${map.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 0 20 L 20 20 M 20 0 L 20 20" fill="none" stroke="#3D5A80" strokeOpacity="0.15" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#grid-${map.id})`} />
      {/* path - sketchy double line */}
      <path d={d} stroke="#1A1A1A" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      <path d={d} stroke="#9a6a3a" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 4" />
      {/* base marker — last point */}
      {(() => {
        const last = map.path[map.path.length - 1];
        return <circle cx={last.x * sx + 15} cy={last.y * sy} r="8" fill="#E63946" stroke="#1A1A1A" strokeWidth="2" />;
      })()}
      {/* spawn marker — first point */}
      {(() => {
        const first = map.path[0];
        return <circle cx={first.x * sx + 15} cy={first.y * sy} r="6" fill="#FFD23F" stroke="#1A1A1A" strokeWidth="2" />;
      })()}
    </svg>
  );
}

Object.assign(window, { ChibiBody, DefenderSprite, EnemySprite, DefenderIcon, MapDoodle, MapMini });
