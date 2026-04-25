// app.jsx — Top-level state machine + Tweaks integration

const { useState: app_useState, useEffect: app_useEffect, useMemo: app_useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "cardLayout": "detailed",
  "showAnnotations": true,
  "paperTone": "cream",
  "accent": "red",
  "speedBoost": 1
}/*EDITMODE-END*/;

function applyPaperTone(tone) {
  const root = document.documentElement;
  if (tone === 'cream') {
    root.style.setProperty('--paper', '#FBF6E9');
    root.style.setProperty('--paper-2', '#F4ECD0');
  } else if (tone === 'mint') {
    root.style.setProperty('--paper', '#EAF6EE');
    root.style.setProperty('--paper-2', '#D7ECD8');
  } else if (tone === 'pink') {
    root.style.setProperty('--paper', '#FBEDEC');
    root.style.setProperty('--paper-2', '#F2D5D2');
  } else if (tone === 'sky') {
    root.style.setProperty('--paper', '#E9F1F8');
    root.style.setProperty('--paper-2', '#D2E2EE');
  }
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scene, setScene] = app_useState('menu'); // menu / settings / mapselect / roster / game / result
  const [pickedMap, setPickedMap] = app_useState(null);
  const [completed, setCompleted] = app_useState({});

  // global settings
  const [music, setMusic] = app_useState(false);
  const [sound, setSound] = app_useState(true);
  const [speed, setSpeed] = app_useState(1);
  const [hardMode, setHardMode] = app_useState(false);

  // No scaling — stage fills viewport directly. Game screen still uses 1280x800
  // internally for path coords; we scale ONLY the game stage container.

  // re-render on resize so game scale stays correct
  const [, forceTick] = app_useState(0);
  app_useEffect(() => {
    const onResize = () => forceTick(t => t + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  app_useEffect(() => { applyPaperTone(tweaks.paperTone); }, [tweaks.paperTone]);

  const onWin = (s) => {
    setCompleted(c => ({ ...c, [pickedMap.id]: true }));
    // overlay handles the dialog; user clicks back from there
  };
  const onLose = (s) => { /* overlay handles */ };

  let body = null;
  if (scene === 'menu') {
    body = <MainMenu
      onStart={() => setScene('mapselect')}
      onSettings={() => setScene('settings')}
      onRoster={() => setScene('roster')}
    />;
  } else if (scene === 'settings') {
    body = <Settings onBack={() => setScene('menu')}
      music={music} sound={sound} speed={speed} hardMode={hardMode}
      setMusic={setMusic} setSound={setSound} setSpeed={setSpeed} setHardMode={setHardMode} />;
  } else if (scene === 'mapselect') {
    body = <MapSelect
      onBack={() => setScene('menu')}
      completed={completed}
      onPick={(m) => { setPickedMap(m); setScene('game'); }} />;
  } else if (scene === 'roster') {
    body = <Roster onBack={() => setScene('menu')} cardLayout={tweaks.cardLayout} />;
  } else if (scene === 'game') {
    // Fit the 1280x800 playfield inside the viewport (contain) so HUD and
    // shop tray are never clipped. Letterbox bands match paper background.
    const sx = window.innerWidth / 1280;
    const sy = window.innerHeight / 800;
    const s = Math.min(sx, sy);
    const w = 1280 * s, h = 800 * s;
    body = (
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--paper)' }}>
        <div style={{ width: w, height: h, position: 'absolute',
          left: (window.innerWidth - w) / 2, top: (window.innerHeight - h) / 2 }}>
          <div style={{ width: 1280, height: 800, position: 'relative', transformOrigin: 'top left', transform: `scale(${s})` }}>
            <GameScreen map={pickedMap}
              defaultSpeed={speed * (tweaks.speedBoost || 1)}
              hardMode={hardMode}
              cardLayout={tweaks.cardLayout}
              onMenu={() => setScene('menu')}
              onWin={onWin}
              onLose={onLose} />
          </div>
        </div>
      </div>
    );
  }

  // Scale-to-fit for non-game scenes when viewport is smaller than the
  // 1280x800 design size. Above that, render fluidly so menus fill the screen.
  const vw = window.innerWidth, vh = window.innerHeight;
  const needsFit = scene !== 'game' && (vw < 1280 || vh < 800);
  const fitS = needsFit ? Math.min(vw / 1280, vh / 800) : 1;

  const fitWrap = needsFit ? {
    position: 'absolute',
    width: 1280, height: 800,
    left: (vw - 1280 * fitS) / 2,
    top: (vh - 800 * fitS) / 2,
    transform: `scale(${fitS})`,
    transformOrigin: 'top left',
  } : { width: '100%', height: '100%' };

  return (
    <div className="stage">
      <div id="stage-canvas" className="stage-canvas">
        <div style={fitWrap}>
          {body}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Defender card layout" />
        <TweakRadio label="Style" value={tweaks.cardLayout}
          options={[
            { value: 'detailed', label: 'Dossier' },
            { value: 'trading-card', label: 'Trading' },
            { value: 'minimal', label: 'Minimal' },
          ]}
          onChange={v => setTweak('cardLayout', v)} />

        <TweakSection label="Surprise me" />
        <TweakRadio label="Paper tone" value={tweaks.paperTone}
          options={[
            { value: 'cream', label: 'Cream' },
            { value: 'mint', label: 'Mint' },
            { value: 'pink', label: 'Pink' },
            { value: 'sky', label: 'Sky' },
          ]}
          onChange={v => setTweak('paperTone', v)} />
        <TweakToggle label="Show doodled annotations" value={tweaks.showAnnotations}
          onChange={v => setTweak('showAnnotations', v)} />
        <TweakSlider label="Speed boost" value={tweaks.speedBoost}
          min={0.5} max={3} step={0.25} unit="×"
          onChange={v => setTweak('speedBoost', v)} />

        <TweakSection label="Tip" />
        <div style={{ fontSize: 11, color: 'rgba(41,38,27,.55)', lineHeight: 1.4 }}>
          On the roster screen ("The Crew") cycle the layout to compare card styles. Paper tone changes everything.
        </div>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
