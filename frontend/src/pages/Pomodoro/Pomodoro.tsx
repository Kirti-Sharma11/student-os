import { useEffect, useRef, useState } from "react";

type Mode = "focus" | "short" | "long";

const SESSION_STORAGE_KEY = "pomodoro_sessions";

const MODE_SECONDS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const quotes = [
  "Focus on being productive instead of busy.",
  "Little by little, a little becomes a lot.",
  "The secret of getting ahead is getting started.",
  "Do the hard things while they are easy.",
];

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function Pomodoro() {
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(MODE_SECONDS["focus"]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessions, setSessions] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // load sessions from localStorage
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) setSessions(Number(raw) || 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // keep seconds in sync when mode changes (reset timer for new mode)
    setSecondsLeft(MODE_SECONDS[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    // persist sessions
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, String(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          // finished
          window.setTimeout(() => handleFinish(), 200);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 500);
    } catch {
      // fallback no-op
    }
  };

  const handleFinish = () => {
    setIsRunning(false);
    if (mode === "focus") {
      setSessions((s) => s + 1);
      if (soundEnabled) playBeep();
      // automatically switch to short break
      setMode("short");
    } else {
      if (soundEnabled) playBeep();
      // after break, go back to focus
      setMode("focus");
    }
  };

  const handleStart = () => {
    if (secondsLeft <= 0) setSecondsLeft(MODE_SECONDS[mode]);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(MODE_SECONDS[mode]);
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
  };

  const duration = MODE_SECONDS[mode];
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / duration));

  return (
    <div className="min-h-screen bg-[#050814] py-12 px-4 text-white">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 rounded-2xl border border-white/8 bg-white/2 p-6 backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-yellow-300 text-center">
            Pomodoro Focus Timer 🍅
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-300">Stay focused with simple, beautiful productivity sessions.</p>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-white/6 bg-gradient-to-b from-white/3 to-transparent p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-zinc-300">Mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeChange("focus")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "focus" ? "bg-rose-500/90 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    Focus
                  </button>
                  <button
                    onClick={() => handleModeChange("short")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "short" ? "bg-cyan-500/90 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    Short Break
                  </button>
                  <button
                    onClick={() => handleModeChange("long")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "long" ? "bg-emerald-500/90 text-white" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    Long Break
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-zinc-300">Sessions</p>
                <p className="text-xl font-semibold">{sessions}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 120 120">
                  <defs></defs>
                  <circle cx="60" cy="60" r="54" strokeWidth={8} stroke="#111827" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    strokeWidth={8}
                    stroke="#f97316"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={Math.PI * 2 * 54}
                    strokeDashoffset={Math.PI * 2 * 54 * (1 - progress)}
                    transform="rotate(-90 60 60)"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <div className="text-6xl font-extrabold tracking-tight">{formatTime(secondsLeft)}</div>
                  <div className="mt-2 text-sm text-zinc-300">{mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="rounded-2xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:brightness-105"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="rounded-2xl bg-zinc-800 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700"
                >
                  Pause
                </button>
              )}

              <button
                onClick={handleReset}
                className="rounded-2xl bg-zinc-900 px-5 py-3 font-medium text-zinc-200 transition hover:bg-zinc-800"
              >
                Reset
              </button>

              <button
                onClick={() => setSoundEnabled((s) => !s)}
                className={`rounded-2xl px-4 py-3 font-medium transition ${soundEnabled ? "bg-amber-400 text-black" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
              >
                {soundEnabled ? "Sound On" : "Sound Off"}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-zinc-400">{quote}</div>
          </section>

          <aside className="rounded-2xl border border-white/6 bg-gradient-to-b from-white/3 to-transparent p-6 shadow-lg">
            <div className="mb-4">
              <p className="text-sm text-zinc-300">Quick Controls</p>
              <p className="text-xs text-zinc-400">Jump to a preset duration</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMode("focus");
                  setSecondsLeft(MODE_SECONDS["focus"]);
                }}
                className="w-full rounded-xl bg-rose-600/90 px-4 py-3 font-semibold text-white hover:brightness-105"
              >
                25:00 Focus
              </button>

              <button
                onClick={() => {
                  setMode("short");
                  setSecondsLeft(MODE_SECONDS["short"]);
                }}
                className="w-full rounded-xl bg-cyan-600/90 px-4 py-3 font-semibold text-white hover:brightness-105"
              >
                05:00 Short Break
              </button>

              <button
                onClick={() => {
                  setMode("long");
                  setSecondsLeft(MODE_SECONDS["long"]);
                }}
                className="w-full rounded-xl bg-emerald-600/90 px-4 py-3 font-semibold text-white hover:brightness-105"
              >
                15:00 Long Break
              </button>

              <div className="mt-4 rounded-xl border border-white/6 bg-zinc-900 p-4 text-sm text-zinc-300">
                <p className="font-medium text-white">Sessions completed</p>
                <p className="mt-1 text-2xl font-semibold">{sessions}</p>
                <p className="mt-2 text-xs text-zinc-400">Sessions persist across refresh.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
