import { useState } from "react";
import { ROLE_REGISTRY } from "@werewolf/shared";

// Contextual help tips per game phase
const TIPS: Record<string, string[]> = {
  lobby: [
    "الوحوش لازم تفتكر: كلامكم بالليل مينفعش، بس وشوشكم بتحكي.",
    "جرب تحط اسم يشبه أسماء أصحابك عشان تلخبطهم 😏",
    "لو معرفتش حد دورك اخرج من اللعبة صح — استنى النهاية.",
  ],
  roleReveal: [
    "خد وقتك في قراية وصف الدور قبل ما تأكد.",
    "لو دورك حرامي — افتكر إن ممكن حد يتبادل معاك بالليل!",
    "الكروت اللي على الأرض ليها دور مهم… استنى وتعرف.",
  ],
  night: [
    "لو صوتك وقع، متقلقش — هتترجع تلقائي لما النت يرجع.",
    `${ROLE_REGISTRY.seer.name} تقدر تشوف كارتين الأرض بدل لاعب واحد.`,
    `${ROLE_REGISTRY.robber.name} بيتبادل دوره مع هدفه — فكر مين نفسه يستاهل سرقة دوره.`,
  ],
  discussion: [
    "اسمع اللي قالوا قبل ما تتكلم — المعلومات أهم من الدفاع.",
    "الصمت سلاح… بس مش دايماً. قول حاجة قبل التصويت!",
    "لو حد اتغير سلوكه بعد الليل، اسأل نفسه ليه.",
  ],
  vote: [
    "التصويت للحرامية لو خسرت يعني الحارة كسبت — متضغطش عالفاضي.",
    "مفيش تغيير رأي هنا — صوتك نهائي!",
  ],
};

export default function HelpTip({ phase }: { phase: keyof typeof TIPS | string }) {
  const [open, setOpen] = useState(false);
  const tips = TIPS[phase] ?? [];
  if (!tips.length) return null;
  const tip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="help-wrap">
      <button
        className="help-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="مساعدة"
        title="نصيحة"
      >
        ?
      </button>
      {open && (
        <div className="help-pop" role="tooltip">
          💡 {tip}
        </div>
      )}
    </div>
  );
}
