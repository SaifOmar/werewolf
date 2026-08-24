import { useEffect } from "react";
import { SOCKET_EVENTS, type UpdateGamePayload } from "@werewolf/shared";
import { roleIdOf } from "./roleId";
import { RoleIcon, WolfMoon } from "./Art";
import { sfx } from "../sfx";
import type { EmitFn } from "./types";

export default function EndGame({ snapshot, emit }: { snapshot: UpdateGamePayload; emit: EmitFn }) {
  const winners = snapshot.winners;
  const isDraw = snapshot.isDraw;
  const isHost = snapshot.hostId === snapshot.yourPlayerId;

  useEffect(() => {
    if (isDraw || !winners) {
      sfx.play("confirm");
      return;
    }
    const myRole = snapshot.resultsPlayerRoles?.find((r) => r.playerId === snapshot.yourPlayerId)?.role;
    const myTeam = myRole ? (["werewolf", "minion"].includes(roleIdOf(myRole)) ? "villain" : "village") : null;
    sfx.play(!myTeam || myTeam === winners ? "win" : "lose");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let headline = "انتهت اللعبة";
  if (isDraw) headline = "تعادل! 🤝";
  else if (winners === "villain") headline = "الحرامية كسبت 💰";
  else if (winners === "village") headline = "أهل الحارة كسبوا 🏮";
  else if (winners) headline = `الفريق الفائز: ${winners}`;

  const roleOf = (p: { name: string; role: string }) => p.role;

  return (
    <main className="page center-screen">
      <WolfMoon size={110} />
      <h1>{headline}</h1>

      <section className="card">
        <h3>الأدوار</h3>
        <ul className="results-list small">
          {(snapshot.resultsPlayerRoles ?? []).map((r) => (
            <li key={r.playerId}>
              <span>{r.name}</span>
              <span className={`role-cell ${["werewolf", "minion"].includes(roleIdOf(roleOf(r))) ? "wolf-text" : ""}`}>
                <RoleIcon roleId={roleIdOf(roleOf(r))} size={20} />
                {roleOf(r)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>تصويتات</h3>
        <ul className="results-list small">
          {(snapshot.resultsVotes ?? []).map((v, i) => (
            <li key={i}>
              <span>{v.voter}</span>
              <span>← {v.vote}</span>
            </li>
          ))}
          {!snapshot.resultsVotes?.length && <li>—</li>}
        </ul>
      </section>

      {snapshot.actionHistory && snapshot.actionHistory.length > 0 && (
        <section className="card">
          <h3>أحداث الليل</h3>
          <ul className="results-list small">
            {snapshot.actionHistory.map((a, i) => (
              <li key={i}>
                <span>{a.role}</span>
                <span>{a.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row mt">
        {isHost && (
          <button
            className="btn primary big"
            onClick={() => {
              sfx.play("confirm");
              emit(SOCKET_EVENTS.CLIENT.RESTART_GAME, {
                gameCode: snapshot.code,
                playerId: snapshot.yourPlayerId,
              });
            }}
          >
            🔄 نفس الغرفة، جولة جديدة
          </button>
        )}
        <button className="btn ghost" onClick={() => window.location.reload()}>
          العودة للبداية
        </button>
      </div>
    </main>
  );
}
