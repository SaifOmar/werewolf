import { useState } from "react";
import { ROLE_REGISTRY } from "@werewolf/shared";
import { RoleIcon } from "./Art";

const ORDER = ["werewolf", "minion", "clone", "seer", "mason", "robber", "troublemaker", "drunk", "warlock", "insomniac", "joker", "oracle"];

const BASE_DECK = [
  { id: "werewolf", count: 2 },
  { id: "mason", count: 2 },
  { id: "minion", count: 1 },
  { id: "seer", count: 1 },
  { id: "robber", count: 1 },
  { id: "troublemaker", count: 1 },
  { id: "drunk", count: 1 },
];

const EXPANSION = [
  { players: "اللاعب السابع", id: "clone" },
  { players: "اللاعب الثامن", id: "insomniac" },
  { players: "اللاعب التاسع", id: "joker" },
  { players: "اللاعب العاشر", id: "werewolf" },
  { players: "اللاعب الحادي عشر", id: "warlock" },
  { players: "اللاعب الثاني عشر", id: "oracle" },
];

const TEAM_LABEL: Record<string, { text: string; cls: string }> = {
  villain: { text: "الحرامية", cls: "team-villain" },
  village: { text: "أهل الحارة", cls: "team-village" },
  neutral: { text: "محايد", cls: "team-neutral" },
};

const ROLE_TEAM: Record<string, string> = {
  werewolf: "villain",
  minion: "villain",
  joker: "neutral",
};

type Tab = "guide" | "order" | "deck" | "roles";

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("guide");

  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-modal" onClick={(e) => e.stopPropagation()} dir="rtl">
        <header className="htp-header">
          <h2>☽ إزاي تلعب</h2>
          <button className="htp-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </header>

        <nav className="htp-tabs">
          {([["guide", "الدليل"], ["order", "ترتيب الليل"], ["deck", "التشكيلة"], ["roles", "الأدوار"]] as [Tab, string][]).map(
            ([id, label]) => (
              <button key={id} className={`htp-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
                {label}
              </button>
            ),
          )}
        </nav>

        <div className="htp-content">
          {tab === "guide" && (
            <>
              <p className="htp-flavor">أهلاً بيك في الحارة… اللي مش كل اللي فيها بيقول الحقيقة.</p>
              {[
                ["جمعوا الشلة", "محتاجين ٦ لاعبين على الأقل عشان نبدأ."],
                ["الأدوار توزعت", "كل لاعب بياخد دور سرّي، و٣ كروت زيادة بتتحط على الأرض وشها لتحت. متقولش حد دورك."],
                ["الليل", "الأدوار تصحى واحد ورا التاني بالترتيب وكل واحد يعمل حركته السرية. ركّز كويس في اللي بتعرفه."],
                ["النقاش", "الكل يفتح عينه ويتكلم. اتهم، دافع، اكدب، اعمل بلوف — استخدم اللي عرفته عشان توصل للحرامية."],
                ["التصويت", "الكل يصوت لحد يتصوّد. الأكتر أصوات يخرج بره. صوتك مرة واحدة بس!"],
              ].map(([title, desc], i) => (
                <div className="htp-step" key={i}>
                  <span className="htp-step-num">{i + 1}</span>
                  <div>
                    <b className="htp-step-title">{title}</b>
                    <p className="htp-step-desc">{desc}</p>
                  </div>
                </div>
              ))}
              <div className="htp-win">
                <span className="htp-win-label">مين يكسب؟</span>
                <p><span className="htp-team village">أهل الحارة</span> يكسبوا لو حرامي واحد اتطرد.</p>
                <p><span className="htp-team villain">الحرامية</span> يكسبوا لو كلهم عاشوا بعد التصويت.</p>
                <p><span className="htp-team neutral">{ROLE_REGISTRY.joker.name}</span> يكسب لوحده لو الحارة صوّتت عليه.</p>
              </div>
            </>
          )}

          {tab === "order" && (
            <>
              <p className="htp-flavor">بالليل الأدوار تصحى بالترتيب ده، ولكل دور وقته المحدد.</p>
              <ol className="htp-order">
                {ORDER.map((id, i) => (
                  <li key={id}>
                    <span className="htp-order-num">{i + 1}</span>
                    <RoleIcon roleId={id} size={22} />
                    <span>{ROLE_REGISTRY[id].name}</span>
                  </li>
                ))}
              </ol>
              <p className="htp-note">الأدوار اللي مش في اللعبة بتتخطى — واللي على الأرض بس بيمر عليها الدور في صمت.</p>
            </>
          )}

          {tab === "deck" && (
            <>
              <div className="htp-block">
                <b>اللعبة الأساسية — ٦ لاعبين + ٣ أرض</b>
                {BASE_DECK.map((r) => (
                  <div className="htp-row" key={r.id}>
                    <RoleIcon roleId={r.id} size={20} />
                    <span>{ROLE_REGISTRY[r.id].name}</span>
                    <em>×{r.count}</em>
                  </div>
                ))}
              </div>
              <div className="htp-block">
                <b>إضافات حسب عدد اللاعبين</b>
                {EXPANSION.map((e) => (
                  <div className="htp-row" key={e.players}>
                    <span className="htp-dim">{e.players}</span>
                    <span>←</span>
                    <RoleIcon roleId={e.id} size={20} />
                    <span>{ROLE_REGISTRY[e.id].name}</span>
                  </div>
                ))}
              </div>
              <p className="htp-note">دايماً عدد الكروت = عدد اللاعبين + ٣. الكروت الزيادة بتتحط على الأرض وشها لتحت.</p>
            </>
          )}

          {tab === "roles" && (
            <div className="htp-roles">
              {Object.values(ROLE_REGISTRY).map((r) => {
                const team = ROLE_TEAM[r.id] ?? "village";
                const t = TEAM_LABEL[team];
                return (
                  <div className="htp-char" key={r.id}>
                    <div className="htp-char-head">
                      <RoleIcon roleId={r.id} size={26} />
                      <b>{r.name}</b>
                      <span className={`htp-team-pill ${t.cls}`}>{t.text}</span>
                    </div>
                    <p className="htp-char-desc">{r.description}</p>
                    {r.knows && <p className="htp-char-knows">👁 هتعرف: {r.knows}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
