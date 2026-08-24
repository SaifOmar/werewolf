import { useState } from "react";
import { SOCKET_EVENTS } from "@werewolf/shared";
import type { PageProps } from "./types";
import HelpTip from "./HelpTip";
import MyRoleBadge from "./MyRoleBadge";
import { ClawMarks, Spinner } from "./Art";
import { sfx } from "../sfx";

export default function Vote({ snapshot, emit }: PageProps) {
  const priv = snapshot.playerPrivateData;
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  // optimistic lock: block re-vote between tapping confirm and the next snapshot
  const [votedLocally, setVotedLocally] = useState(false);
  const others = snapshot.players.filter((p) => p.id !== snapshot.yourPlayerId);
  const votedCount = snapshot.players.filter((p) => p.hasVoted).length;
  const done = !!priv?.hasVoted || votedLocally;

  const castVote = (id: string) => {
    if (votedLocally || priv?.hasVoted) return;
    setVotedLocally(true);
    setConfirmTarget(null);
    sfx.play("vote");
    emit(SOCKET_EVENTS.CLIENT.VOTE, {
      gameCode: snapshot.code,
      playerId: snapshot.yourPlayerId,
      votedPlayerId: id,
    });
  };

  return (
    <main className="page center-screen">
      <HelpTip phase="vote" />
      <ClawMarks width={150} />
      <h2>🗳️ التصويت</h2>
      <MyRoleBadge currentRole={priv?.currentRole} />
      {done ? (
        <>
          <p className="hint ok">صوّتت — في انتظار الباقي ({votedCount}/{snapshot.players.length})</p>
          <Spinner />
        </>
      ) : (
        <>
          <p className="hint">مين في الحرامية؟ اختار بعناية — صوتك نهائي</p>
          <ul className="player-list selectable">
            {others.map((p) =>
              confirmTarget === p.id ? (
                <li key={p.id} className="selected vote-confirm">
                  <span>تأكيد تصويتك على {p.name}؟</span>
                  <span className="badges">
                    <button className="link" onClick={() => castVote(p.id)}>أيوه</button>
                    <button
                      className="link danger"
                      onClick={() => {
                        sfx.play("click");
                        setConfirmTarget(null);
                      }}
                    >
                      لأ
                    </button>
                  </span>
                </li>
              ) : (
                <li
                  key={p.id}
                  onClick={() => {
                    sfx.play("select");
                    setConfirmTarget(p.id);
                  }}
                >
                  <span>{p.name}</span>
                </li>
              ),
            )}
          </ul>
        </>
      )}
    </main>
  );
}
