import { useState, useRef, useEffect } from "react";

const tasks = [
  {
    id: 1,
    title: "Assemble PT",
    steps: [
      "Gather all loose parts and hardware currently scattered around the garage",
      "Confirm any missing pieces — order or source before starting",
      "Clear enough floor space to work around it comfortably",
    ],
    unlocks: [
      "You can finally assess what you're actually working with",
      "The garage cleanup has a clear purpose and direction",
      "Momentum starts here — everything else is downstream of this",
    ],
  },
  {
    id: 2,
    title: "Clean Up Garage",
    steps: [
      "Sort into keep, sell, and toss piles — don't skip this step",
      "Sweep, organize shelving, and create a clear path for vehicles",
      "Dispose of any fluids, scrap, or trash that's been sitting",
    ],
    unlocks: [
      "A clear garage is the only way to safely stage the PT for what's next",
      "You can see what you actually have once the clutter is gone",
      "Sets the tone — a clean shop is a productive shop",
    ],
  },
  {
    id: 3,
    title: "Move or Sell PT",
    steps: [
      "Decide: sell, store, or relocate — commit to one path",
      "If selling: photograph, list, and price it while assembled and clean",
      "If moving: arrange transport or a storage spot ahead of time",
    ],
    unlocks: [
      "Frees up the prime real estate the truck needs",
      "Selling converts a stalled project into capital you can reinvest",
      "Clears the mental weight of an unresolved decision",
    ],
  },
  {
    id: 4,
    title: "Move Truck Into Shop",
    steps: [
      "Confirm the garage is fully clear and the path is wide enough",
      "Check that the truck starts and rolls safely — don't force it",
      "Set up lighting and any lift or jack stands you'll need",
    ],
    unlocks: [
      "The truck is in — the main project is officially underway",
      "Indoor access means working on your schedule, not the weather's",
      "Everything before this was clearing the stage for this moment",
    ],
  },
];

const PANEL = { LEFT: "steps", CENTER: "task", RIGHT: "unlocks" };
const CONFETTI_COLORS = ["#c8a96e", "#6e9ec8", "#a8d88a", "#d88aa8", "#8ad8c8", "#ffffff", "#f0d080"];

// Confetti particle component
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -8 - 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 7 + 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;
        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });
      if (alive) animRef.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 999,
      }}
    />
  );
}

export default function FocusChain() {
  const [activeLine, setActiveLine] = useState(0);
  const [panel, setPanel] = useState(PANEL.CENTER);
  const [mode, setMode] = useState("overview");
  const [confetti, setConfetti] = useState(false);
  const lastTap = useRef({});
  const startX = useRef(null);
  const startY = useRef(null);
  const mouseStart = useRef(null);

  const handleTaskTap = (i) => {
    const now = Date.now();
    if (lastTap.current[i] && now - lastTap.current[i] < 380) {
      setActiveLine(i);
      setPanel(PANEL.CENTER);
      setMode("zoomed");
      lastTap.current = {};
    } else {
      lastTap.current = { [i]: now };
    }
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (startX.current === null || mode === "overview") return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current);
    if (Math.abs(dx) < 40 || dy > 60) return;
    if (dx < 0) setPanel((p) => p === PANEL.LEFT ? PANEL.CENTER : p === PANEL.CENTER ? PANEL.RIGHT : PANEL.RIGHT);
    else setPanel((p) => p === PANEL.RIGHT ? PANEL.CENTER : p === PANEL.CENTER ? PANEL.LEFT : PANEL.LEFT);
    startX.current = null;
  };

  const handleMouseDown = (e) => { mouseStart.current = e.clientX; };
  const handleMouseUp = (e) => {
    if (mouseStart.current === null || mode === "overview") return;
    const dx = e.clientX - mouseStart.current;
    if (Math.abs(dx) < 40) { mouseStart.current = null; return; }
    if (dx < 0) setPanel((p) => p === PANEL.LEFT ? PANEL.CENTER : p === PANEL.CENTER ? PANEL.RIGHT : PANEL.RIGHT);
    else setPanel((p) => p === PANEL.RIGHT ? PANEL.CENTER : p === PANEL.CENTER ? PANEL.LEFT : PANEL.LEFT);
    mouseStart.current = null;
  };

  const advance = (i) => {
    if (i === activeLine) {
      setActiveLine(i + 1);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2800);
    } else if (i < activeLine) {
      setActiveLine(i);
    }
  };

  // Arrow color: green if done, gold if active, dim if future
  const arrowColor = (isDone, isActive) => isDone ? "#4caf82" : "#2a2a2a";

  // ── OVERVIEW ───────────────────────────────────────────────────
  if (mode === "overview") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0c0c0d",
        fontFamily: "'Georgia', serif", color: "#e2ddd6",
        userSelect: "none", paddingBottom: 60, overflowX: "hidden",
      }}>
        <Confetti active={confetti} />

        {/* Header */}
        <div style={{
          padding: "36px 16px 16px", borderBottom: "1px solid #1a1a1a",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#444", textTransform: "uppercase", marginBottom: 5 }}>Focus Chain</div>
            <div style={{ fontSize: 20, fontWeight: "normal", letterSpacing: -0.5 }}>The Work Ahead</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#383838", letterSpacing: 2, textTransform: "uppercase" }}>Done</div>
            <div style={{ fontSize: 20, color: "#c8a96e", marginTop: 2 }}>
              {Math.min(activeLine, tasks.length)}<span style={{ color: "#2a2a2a", fontSize: 12 }}>/{tasks.length}</span>
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", padding: "10px 8px 4px", gap: 4 }}>
          {["Steps", "Task", "Unlocks"].map((label, li) => (
            <div key={label} style={{
              textAlign: "center", fontSize: 7, letterSpacing: 3, textTransform: "uppercase",
              color: li === 1 ? "#c8a96e55" : li === 0 ? "#55483055" : "#2a3d4f55",
              paddingBottom: 4,
              borderBottom: `1px solid ${li === 1 ? "#c8a96e18" : "#1a1a1a"}`,
            }}>{label}</div>
          ))}
        </div>

        <div style={{
          textAlign: "center", fontSize: 8, letterSpacing: 3,
          color: "#282828", textTransform: "uppercase", padding: "10px 0 4px",
        }}>Double tap to focus</div>

        {/* Rows */}
        <div style={{ padding: "4px 0" }}>
          {tasks.map((task, i) => {
            const isDone = i < activeLine;
            const isActive = i === activeLine;
            const isFuture = i > activeLine;
            const isLast = i === tasks.length - 1;

            return (
              <div key={task.id}>
                <div
                  onClick={() => handleTaskTap(i)}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 4,
                    padding: "12px 8px",
                    opacity: isFuture ? 0.58 : 1,
                    transition: "opacity 0.4s ease",
                    cursor: "pointer",
                    background: isActive ? "#0f0e09" : "transparent",
                    borderLeft: isActive ? "2px solid #c8a96e44" : "2px solid transparent",
                    borderRight: isActive ? "2px solid #2a3d4f44" : "2px solid transparent",
                  }}
                >
                  {/* Steps column */}
                  <div style={{
                    borderRight: "1px solid #161616", paddingRight: 6,
                    display: "flex", flexDirection: "column", gap: 5, justifyContent: "center",
                  }}>
                    {task.steps.map((s, si) => (
                      <div key={si} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                        <div style={{
                          width: 3, height: 3, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                          background: isDone ? "#c8a96e66" : isActive ? "#c8a96e44" : "#303030",
                        }} />
                        <div style={{
                          fontSize: 8, lineHeight: 1.5,
                          color: isDone ? "#3a3630" : isActive ? "#7a7060" : "#383838",
                        }}>{s}</div>
                      </div>
                    ))}
                  </div>

                  {/* Task column */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "0 6px", borderRight: "1px solid #161616",
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      border: isDone ? "1.5px solid #4caf82" : isActive ? "1.5px solid #c8a96e" : "1.5px solid #2e2e2e",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isDone ? "#4caf8214" : "transparent",
                      boxShadow: isActive ? "0 0 8px #c8a96e18" : isDone ? "0 0 8px #4caf8218" : "none",
                      transition: "all 0.4s ease",
                    }}>
                      {isDone
                        ? <span style={{ color: "#4caf82", fontSize: 11 }}>✓</span>
                        : <span style={{ fontSize: 9, color: isActive ? "#c8a96e" : "#383838", fontFamily: "monospace" }}>{task.id}</span>
                      }
                    </div>
                    <div>
                      <div style={{
                        fontSize: 12,
                        color: isDone ? "#555" : isActive ? "#e2ddd6" : "#585858",
                        textDecoration: isDone ? "line-through" : "none",
                        lineHeight: 1.35, transition: "all 0.3s ease",
                      }}>{task.title}</div>
                      <div style={{
                        fontSize: 7, marginTop: 3, letterSpacing: 2, textTransform: "uppercase",
                        color: isDone ? "#4caf8266" : isActive ? "#c8a96e66" : "#2a2a2a",
                      }}>
                        {isDone ? "Done" : isActive ? "Active" : "Locked"}
                      </div>
                    </div>
                  </div>

                  {/* Unlocks column */}
                  <div style={{
                    paddingLeft: 6, display: "flex", flexDirection: "column", gap: 5, justifyContent: "center",
                  }}>
                    {task.unlocks.map((u, ui) => (
                      <div key={ui} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                        <div style={{
                          width: 3, height: 3, borderRadius: 1, flexShrink: 0, marginTop: 5,
                          background: isDone ? "#6e9ec866" : isActive ? "#6e9ec844" : "#1e2830",
                        }} />
                        <div style={{
                          fontSize: 8, lineHeight: 1.5,
                          color: isDone ? "#2a3d4f" : isActive ? "#4a6070" : "#283038",
                        }}>{u}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carriage return arrow — green when done */}
                {!isLast && (
                  <div style={{
                    padding: "0 12px", height: 32,
                    opacity: isDone ? 0.9 : isFuture ? 0.12 : 0.2,
                    transition: "opacity 0.4s ease",
                  }}>
                    <svg width="100%" height="32" viewBox="0 0 320 32" preserveAspectRatio="none">
                      <path
                        d="M 300 7 Q 314 7 314 16 Q 314 26 300 26 L 20 26 Q 6 26 6 20 L 6 14"
                        fill="none"
                        stroke={arrowColor(isDone, isActive)}
                        strokeWidth={isDone ? 2 : 1.5}
                        strokeDasharray={isDone ? "none" : "5 4"}
                        strokeLinecap="round"
                        style={{ transition: "stroke 0.6s ease" }}
                      />
                      <polygon
                        points="2,14 10,14 6,22"
                        fill={arrowColor(isDone, isActive)}
                        style={{ transition: "fill 0.6s ease" }}
                      />
                      {isDone && (
                        <circle cx="300" cy="7" r="3" fill="#4caf82" opacity="0.6" />
                      )}
                    </svg>
                  </div>
                )}
              </div>
            );
          })}

          {activeLine >= tasks.length && (
            <div style={{
              margin: "24px 16px 0", padding: "20px",
              border: "1px solid #4caf8233", borderRadius: 4,
              background: "#4caf8207", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🏁</div>
              <div style={{ color: "#4caf82", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Chain Complete</div>
              <div style={{ color: "#555", fontSize: 11, marginTop: 6, lineHeight: 1.7 }}>All tasks cleared. Rest easy.</div>
              <div onClick={() => setActiveLine(0)} style={{
                marginTop: 14, fontSize: 9, color: "#444", letterSpacing: 3,
                textTransform: "uppercase", cursor: "pointer", textDecoration: "underline",
              }}>Reset Chain</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ZOOMED ─────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh", background: "#0c0c0d",
        fontFamily: "'Georgia', serif", color: "#e2ddd6",
        userSelect: "none", overflowX: "hidden", paddingBottom: 80,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Confetti active={confetti} />

      {/* Header */}
      <div style={{
        padding: "40px 24px 20px", borderBottom: "1px solid #1e1e1e",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <div onClick={() => setMode("overview")} style={{
            fontSize: 9, letterSpacing: 3, color: "#c8a96e88",
            textTransform: "uppercase", marginBottom: 8,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>← Overview</div>
          <div style={{ fontSize: 24, fontWeight: "normal", letterSpacing: -0.5 }}>The Work Ahead</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>Done</div>
          <div style={{ fontSize: 22, color: "#c8a96e", marginTop: 2 }}>
            {Math.min(activeLine, tasks.length)}<span style={{ color: "#333", fontSize: 14 }}>/{tasks.length}</span>
          </div>
        </div>
      </div>

      {/* Panel tabs */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "16px 0 12px" }}>
        {[{ key: PANEL.LEFT, label: "Steps" }, { key: PANEL.CENTER, label: "Task" }, { key: PANEL.RIGHT, label: "Unlocks" }].map(({ key, label }) => (
          <div key={key} onClick={() => setPanel(key)} style={{
            padding: "4px 14px", borderRadius: 20, fontSize: 10,
            letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.25s ease",
            background: panel === key ? "#c8a96e18" : "transparent",
            color: panel === key ? "#c8a96e" : "#3a3a3a",
            border: panel === key ? "1px solid #c8a96e44" : "1px solid transparent",
          }}>{label}</div>
        ))}
      </div>

      {/* Task rows */}
      <div style={{ padding: "4px 0" }}>
        {tasks.map((task, i) => {
          const isActive = i === activeLine;
          const isDone = i < activeLine;
          const isFuture = i > activeLine;
          const isLast = i === tasks.length - 1;

          return (
            <div key={task.id}>
              <div style={{
                display: "flex", alignItems: "stretch", minHeight: 100,
                opacity: isFuture ? 0.58 : 1, transition: "opacity 0.4s ease",
              }}>
                {/* STEPS */}
                <div style={{
                  width: panel === PANEL.LEFT ? "100%" : panel === PANEL.CENTER ? 36 : 0,
                  minWidth: panel === PANEL.LEFT ? "100%" : panel === PANEL.CENTER ? 36 : 0,
                  maxWidth: panel === PANEL.LEFT ? "100%" : panel === PANEL.CENTER ? 36 : 0,
                  overflow: "hidden", transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                  background: panel === PANEL.LEFT && isActive ? "linear-gradient(135deg, #141208 0%, #0c0c0d 100%)" : "transparent",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: panel === PANEL.LEFT ? "20px" : "0 8px",
                }}>
                  {panel === PANEL.LEFT ? (
                    isActive ? (
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: 3, color: "#c8a96e", textTransform: "uppercase", marginBottom: 14 }}>Steps</div>
                        {task.steps.map((s, si) => (
                          <div key={si} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                            <div style={{ color: "#c8a96e", fontSize: 10, marginTop: 3, flexShrink: 0 }}>▶</div>
                            <div style={{ fontSize: 1
