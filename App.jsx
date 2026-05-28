import { useState, useRef, useEffect } from "react";

// ── DEFAULT EXAMPLE CHAIN ─────────────────────────────────────
const EXAMPLE_TASKS = [
  {
    id: 1,
    title: "Get Up",
    steps: [
      "Feet on the floor — nothing else required yet",
      "Sit up, take one breath, don't reach for your phone",
      "Stand up and open the blinds if you can",
    ],
    unlocks: [
      "Everything else today depends on this one move",
      "The hardest part of the day is already behind you",
      "Your body wakes up faster once you're upright and moving",
    ],
  },
  {
    id: 2,
    title: "Make The Bed",
    steps: [
      "Straighten the sheets and pull them tight",
      "Stack the pillows neatly",
      "Step back and look at the first win of the day",
    ],
    unlocks: [
      "A made bed signals to your brain the day has officially started",
      "You've already accomplished something before breakfast",
      "Coming home to a made bed tonight will feel like a gift",
    ],
  },
  {
    id: 3,
    title: "Wash Up & Brush",
    steps: [
      "Splash cold water on your face to fully wake up",
      "Brush teeth for a full two minutes",
      "Take care of anything else that makes you feel ready",
    ],
    unlocks: [
      "You feel human — and that changes everything about how you show up",
      "Taking care of yourself first puts you in a position to care for others",
      "The morning rhythm is building — this keeps the momentum going",
    ],
  },
  {
    id: 4,
    title: "Feed Pets & Water Plants",
    steps: [
      "Check food and water bowls — refill what's needed",
      "Water any plants that need it",
      "Take a moment to actually notice them",
    ],
    unlocks: [
      "The things that depend on you are taken care of — that matters",
      "Acts of care early in the day set a generous tone for everything after",
      "Breakfast feels more earned when you've already given before you've taken",
    ],
  },
  {
    id: 5,
    title: "Eat A Real Breakfast",
    steps: [
      "Make something — even simple counts",
      "Sit down to eat it, don't eat standing over the sink",
      "No phone during breakfast if you can manage it",
    ],
    unlocks: [
      "Your brain runs on fuel — this is the investment that pays off all day",
      "You've completed the chain — you're ready to win the day",
      "Whatever comes next, you started right",
    ],
  },
];

const PANEL = { LEFT: "steps", CENTER: "task", RIGHT: "unlocks" };
const CONFETTI_COLORS = ["#c8a96e", "#6e9ec8", "#a8d88a", "#d88aa8", "#8ad8c8", "#ffffff", "#f0d080"];
const STORAGE_KEY = "focuschain_data";
const ONBOARDED_KEY = "focuschain_onboarded";

// ── CONFETTI ──────────────────────────────────────────────────
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
    particles.current = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      vx: (Math.random() - 0.5) * 7,
      vy: Math.random() * -9 - 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 9,
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.28;
        p.rotation += p.rotationSpeed; p.opacity -= 0.011;
        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
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
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999 }} />;
}

// ── ONBOARDING ────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const screens = [
    {
      title: "Focus Chain",
      body: "A simple method for people who get overwhelmed. See your tasks, understand why they matter, and feel the momentum of moving forward.",
      cta: "Show Me How",
    },
    {
      title: "Three Columns",
      body: "Every task has three sides. Steps tells you what to do. Task is where you are. Unlocks shows you what completing it opens up. Swipe to explore each side.",
      cta: "Got It",
    },
    {
      title: "Ready To Win",
      body: "We've built your first chain — a morning routine. Complete it, feel it, then make it yours. Or start fresh if you already know what you need.",
      cta: "Let's Go →",
    },
  ];
  const s = screens[step];
  return (
    <div style={{
      minHeight: "100vh", background: "#0c0c0d", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 32px", fontFamily: "'Georgia', serif", color: "#e2ddd6",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 5, color: "#444", textTransform: "uppercase", marginBottom: 32 }}>
        {step + 1} of {screens.length}
      </div>
      <div style={{ fontSize: 28, fontWeight: "normal", letterSpacing: -0.5, textAlign: "center", marginBottom: 24, color: "#e2ddd6" }}>
        {s.title}
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.8, textAlign: "center", color: "#888", maxWidth: 300, marginBottom: 48 }}>
        {s.body}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 280 }}>
        <div
          onClick={() => step < screens.length - 1 ? setStep(step + 1) : onDone(false)}
          style={{
            background: "#c8a96e", color: "#0c0c0d", padding: "16px 24px",
            borderRadius: 4, textAlign: "center", cursor: "pointer",
            fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Georgia', serif",
          }}
        >{s.cta}</div>
        {step === screens.length - 1 && (
          <div
            onClick={() => onDone(true)}
            style={{
              color: "#444", padding: "12px 24px", textAlign: "center",
              cursor: "pointer", fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
            }}
          >Start Fresh Instead</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
        {screens.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6, borderRadius: 3,
            background: i === step ? "#c8a96e" : "#222", transition: "all 0.3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── END OF DAY MODAL ──────────────────────────────────────────
function EndOfDayModal({ progress, total, onClose }) {
  const pct = Math.round((progress / total) * 100);
  const won = pct === 100;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0c0c0ddd", zIndex: 900,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div style={{
        background: "#111", border: `1px solid ${won ? "#4caf8244" : "#c8a96e22"}`,
        borderRadius: 8, padding: "36px 28px", maxWidth: 320, textAlign: "center",
        fontFamily: "'Georgia', serif",
      }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>{won ? "🏁" : "🌙"}</div>
        <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: won ? "#4caf82" : "#c8a96e", marginBottom: 16 }}>
          {won ? "Chain Complete" : "Day's Done"}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#888", marginBottom: 28 }}>
          {won
            ? `Looks like we accomplished a lot today! You've completed 100% of your chain. Ready to win the day again tomorrow. 👍`
            : `Looks like we had a tough one — but progress isn't about speed, it's about moving forward. You hit ${pct}% today. Rest easy, get a good night's rest, you've earned it. I'll see you in the morning. 🌙`
          }
        </div>
        <div
          onClick={onClose}
          style={{
            background: won ? "#4caf8222" : "#c8a96e18",
            border: `1px solid ${won ? "#4caf8244" : "#c8a96e44"}`,
            color: won ? "#4caf82" : "#c8a96e",
            padding: "12px 24px", borderRadius: 4, cursor: "pointer",
            fontSize: 10, letterSpacing: 3, textTransform: "uppercase",
          }}
        >See You Tomorrow</div>
      </div>
    </div>
  );
}

// ── EDIT MODAL ────────────────────────────────────────────────
function EditModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [steps, setSteps] = useState([...task.steps]);
  const [unlocks, setUnlocks] = useState([...task.unlocks]);

  const inputStyle = {
    background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 4,
    color: "#e2ddd6", padding: "10px 12px", fontSize: 13, width: "100%",
    fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 9, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 6, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0c0c0dee", zIndex: 800,
      overflowY: "auto", padding: "24px 20px", fontFamily: "'Georgia', serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a96e", textTransform: "uppercase" }}>Edit Task</div>
          <div onClick={onClose} style={{ color: "#555", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</div>
        </div>

        {/* Title */}
        <label style={labelStyle}>Task Title</label>
        <input style={{ ...inputStyle, fontSize: 16, marginBottom: 24 }} value={title} onChange={e => setTitle(e.target.value)} />

        {/* Steps */}
        <label style={labelStyle}>Steps</label>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <textarea
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5, minHeight: 60 }}
              value={s}
              onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }}
            />
            <div onClick={() => setSteps(steps.filter((_, si) => si !== i))}
              style={{ color: "#444", cursor: "pointer", padding: "10px 4px", fontSize: 16, flexShrink: 0 }}>✕</div>
          </div>
        ))}
        <div onClick={() => setSteps([...steps, ""])}
          style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", marginBottom: 24 }}>
          + Add Step
        </div>

        {/* Unlocks */}
        <label style={labelStyle}>Unlocks</label>
        {unlocks.map((u, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <textarea
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5, minHeight: 60 }}
              value={u}
              onChange={e => { const n = [...unlocks]; n[i] = e.target.value; setUnlocks(n); }}
            />
            <div onClick={() => setUnlocks(unlocks.filter((_, ui) => ui !== i))}
              style={{ color: "#444", cursor: "pointer", padding: "10px 4px", fontSize: 16, flexShrink: 0 }}>✕</div>
          </div>
        ))}
        <div onClick={() => setUnlocks([...unlocks, ""])}
          style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", marginBottom: 32 }}>
          + Add Unlock
        </div>

        <div onClick={() => onSave({ ...task, title, steps, unlocks })}
          style={{
            background: "#c8a96e", color: "#0c0c0d", padding: "16px",
            borderRadius: 4, textAlign: "center", cursor: "pointer",
            fontSize: 11, letterSpacing: 3, textTransform: "uppercase",
          }}>Save Task</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function FocusChain() {
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem(ONBOARDED_KEY));
  const [tasks, setTasks] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : EXAMPLE_TASKS; }
    catch { return EXAMPLE_TASKS; }
  });
  const [activeLine, setActiveLine] = useState(0);
  const [panel, setPanel] = useState(PANEL.CENTER);
  const [mode, setMode] = useState("overview");
  const [confetti, setConfetti] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const lastTap = useRef({});
  const startX = useRef(null);
  const startY = useRef(null);
  const mouseStart = useRef(null);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleOnboardDone = (fresh) => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    if (fresh) {
      setTasks([{ id: Date.now(), title: "My First Task", steps: ["First step"], unlocks: ["What this unlocks"] }]);
      setActiveLine(0);
    }
    setOnboarded(true);
  };

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

  const handleTouchStart = (e) => { startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY; };
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
      const next = i + 1;
      setActiveLine(next);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2800);
      if (next >= tasks.length) setTimeout(() => setShowEndOfDay(true), 1200);
    } else if (i < activeLine) {
      setActiveLine(i);
    }
  };

  const saveTask = (updated) => {
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    const remaining = tasks.filter(t => t.id !== id);
    setTasks(remaining);
    setActiveLine(Math.min(activeLine, remaining.length - 1));
    setEditingTask(null);
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: "New Task",
      steps: ["First step to complete this task"],
      unlocks: ["What completing this task opens up"],
    };
    setTasks([...tasks, newTask]);
  };

  const startFresh = () => {
    if (window.confirm("Clear everything and start a fresh chain?")) {
      setTasks([{ id: Date.now(), title: "My First Task", steps: ["First step"], unlocks: ["What this unlocks"] }]);
      setActiveLine(0);
      setMode("overview");
    }
  };

  const arrowColor = (isDone) => isDone ? "#4caf82" : "#2a2a2a";

  if (!onboarded) return <Onboarding onDone={handleOnboardDone} />;

  // ── OVERVIEW ────────────────────────────────────────────────
  if (mode === "overview") {
    return (
      <div style={{ minHeight: "100vh", background: "#0c0c0d", fontFamily: "'Georgia', serif", color: "#e2ddd6", userSelect: "none", paddingBottom: 80, overflowX: "hidden" }}>
        <Confetti active={confetti} />
        {showEndOfDay && <EndOfDayModal progress={activeLine} total={tasks.length} onClose={() => setShowEndOfDay(false)} />}
        {editingTask && <EditModal task={editingTask} onSave={saveTask} onClose={() => setEditingTask(null)} />}

        {/* Header */}
        <div style={{ padding: "36px 16px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
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
              paddingBottom: 4, borderBottom: `1px solid ${li === 1 ? "#c8a96e18" : "#1a1a1a"}`,
            }}>{label}</div>
          ))}
        </div>

        <div style={{ textAlign: "center", fontSize: 8, letterSpacing: 3, color: "#282828", textTransform: "uppercase", padding: "10px 0 4px" }}>
          Double tap to focus · Tap pencil to edit
        </div>

        {/* Rows */}
        <div style={{ padding: "4px 0" }}>
          {tasks.map((task, i) => {
            const isDone = i < activeLine;
            const isActive = i === activeLine;
            const isFuture = i > activeLine;
            const isLast = i === tasks.length - 1;
            return (
              <div key={task.id}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <div
                    onClick={() => handleTaskTap(i)}
                    style={{
                      flex: 1, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 4,
                      padding: "12px 8px", opacity: isFuture ? 0.58 : 1, 
