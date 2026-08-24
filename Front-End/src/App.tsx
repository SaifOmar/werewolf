import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SOCKET_EVENTS } from "@werewolf/shared";
import { getSocket, connectAndJoin, markInGame } from "./socket";
import { useStore, loadSession, clearSession } from "./store";
import Lobby from "./pages/Lobby";
import RoleReveal from "./pages/RoleReveal";
import Night from "./pages/Night";
import Discussion from "./pages/Discussion";
import Vote from "./pages/Vote";
import EndGame from "./pages/EndGame";
import { WolfMoon, ClawMarks } from "./pages/Art";
import SoundToggle from "./SoundToggle";
import HowToPlay from "./pages/HowToPlay";
import { initSfx, sfx } from "./sfx";

export default function App() {
  const { snapshot, connected, error, setError } = useStore();
  const navigate = useNavigate();
  const [hasSession] = useState(() => loadSession() !== null);
  const prevPhase = useRef<string | null>(null);

  useEffect(() => {
    initSfx();
  }, []);

  useEffect(() => {
    if (!error) return;
    sfx.play("error");
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error, setError]);

  // eerie sting whenever the game moves to a new phase
  useEffect(() => {
    if (!snapshot) return;
    if (prevPhase.current && snapshot.phase !== prevPhase.current) {
      sfx.play(snapshot.phase === "night" ? "phase" : "click");
    }
    prevPhase.current = snapshot.phase;
  }, [snapshot?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const emit = useCallback((event: string, payload: Record<string, unknown>) => {
    const s = getSocket();
    if (!s.connected) s.connect();
    (s.emit as (...args: unknown[]) => void)(event, payload);
  }, []);

  const leave = useCallback(() => {
    if (snapshot) {
      emit(SOCKET_EVENTS.CLIENT.LEAVE_GAME, { gameCode: snapshot.code, playerId: snapshot.yourPlayerId });
    }
    markInGame(false);
    getSocket().disconnect();
    clearSession();
    navigate("/");
    window.location.reload();
  }, [snapshot, emit, navigate]);

  // no game yet → join screen (or invite-link prefill via ?code=)
  if (!snapshot) {
    return (
      <>
        <JoinScreen canRejoin={hasSession} />
        <ErrorToast />
      </>
    );
  }

  const phase = snapshot.phase;

  return (
    <div className="app">
      <header className="topbar">
        <span className="room-code">غرفة {snapshot.code}</span>
        <span className={`conn ${connected ? "on" : "off"}`}>{connected ? "متصل" : "غير متصل"}</span>
        <SoundToggle />
        <button className="link danger" onClick={leave}>خروج</button>
      </header>

      {phase === "waiting" && <Lobby snapshot={snapshot} emit={emit} />}
      {phase === "role" && <RoleReveal snapshot={snapshot} emit={emit} />}
      {phase === "night" && <Night snapshot={snapshot} emit={emit} />}
      {phase === "discussion" && <Discussion snapshot={snapshot} emit={emit} />}
      {phase === "vote" && <Vote snapshot={snapshot} emit={emit} />}
      {phase === "endGame" && <EndGame snapshot={snapshot} emit={emit} />}

      {!connected && snapshot && (
        <div className="banner">انقطع الاتصال — جاري إعادة الاتصال…</div>
      )}
      <ErrorToast />
    </div>
  );
}

function ErrorToast() {
  const { error } = useStore();
  if (!error) return null;
  return <div className="toast">{error}</div>;
}

export function setErrorExternally(msg: string | null): void {
  // set by JoinScreen via store bridge below
  bridgeSetError?.(msg);
}
let bridgeSetError: ((m: string | null) => void) | null = null;

function JoinScreen({ canRejoin }: { canRejoin: boolean }) {
  const { setError } = useStore();
  const params = new URLSearchParams(window.location.search);
  const [name, setName] = useState(() => sessionStorage.getItem("werewolf_playerName") ?? "");
  const [code, setCode] = useState(() => (params.get("code") ?? "").toUpperCase().slice(0, 6));
  const [busy, setBusy] = useState<"join" | "create" | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    bridgeSetError = setError;
    return () => {
      bridgeSetError = null;
    };
  }, [setError]);

  const doJoin = async () => {
    if (!code.trim()) return;
    sfx.play("confirm");
    setBusy("join");
    sessionStorage.setItem("werewolf_playerName", name.trim());
    try {
      await connectAndJoin({ gameCode: code.trim(), playerName: name.trim() });
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  };

  const doCreate = async () => {
    sfx.play("click");
    setBusy("create");
    try {
      const res = await fetch(
        `${(import.meta.env.VITE_BACKEND_URL as string) || `${location.protocol}//${location.hostname}:3000`}/api/games/create`,
        { method: "POST" },
      );
      const json = await res.json();
      if (json?.data?.code) setCode(json.data.code.toUpperCase());
      else throw new Error(json?.error ?? "تعذر إنشاء الغرفة");
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(null);
  };

  const doRejoin = async () => {
    const s = loadSession();
    if (!s) return;
    sfx.play("confirm");
    setBusy("join");
    try {
      await connectAndJoin(s);
    } catch {
      setError("تعذر استعادة الجلسة، ادخل من جديد");
      clearSession();
    }
    setBusy(null);
  };

  return (
    <main className="center-screen">
      <div className="join-art"><WolfMoon size={140} /></div>
      <h1 className="title">💰 الحرامية</h1>
      <ClawMarks width={170} />
      <p className="subtitle">حارة… ليلة واحدة</p>

      <label className="field">
        <span>اسمك</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="اسم اللاعب" />
      </label>
      <label className="field">
        <span>كود الغرفة</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ABC123"
          className="code-input"
          autoCapitalize="characters"
        />
      </label>

      <button className="btn primary big" disabled={busy !== null || code.length !== 6} onClick={doJoin}>
        {busy === "join" ? "…" : "ادخل"}
      </button>
      <div className="row">
        <button className="btn ghost" disabled={busy !== null} onClick={doCreate}>أنشئ غرفة جديدة</button>
        {canRejoin && (
          <button className="btn ghost" disabled={busy !== null} onClick={doRejoin}>استعادة الجلسة</button>
        )}
      </div>
      <button className="htp-btn" onClick={() => { sfx.play("click"); setShowHowTo(true); }}>؟ إزاي تلعب</button>
      <SoundToggle />
      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
    </main>
  );
}
