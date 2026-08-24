// ═══════════════════════════════════════════════════════════════════
//  ROLE REGISTRY — the single place to edit character content.
//
//  • name        : Arabic display name (used everywhere in the UI)
//  • title       : short epithet shown next to the name
//  • lore        : flavour text describing the character
//  • description : Arabic ability text shown on role reveal & night
//  • knows       : what the player learns when their action resolves
//  • artPath     : optional image path (e.g. "/art/seer.png" served
//                  from Front-End/public/art/). Takes priority over
//                  roleIcon.
//  • roleIcon    : inline SVG markup (inner elements only — the app
//                  wraps it in an <svg viewBox="0 0 24 24">). Leave both
//                  undefined to get the generic placeholder icon.
//
//  Changing a name here updates the backend role classes, the client
//  role-id mapping and every screen automatically.
// ═══════════════════════════════════════════════════════════════════

export interface RoleDef {
  readonly id: string;
  readonly name: string;
  readonly title?: string;
  readonly lore?: string;
  readonly description: string;
  /** What the player learns when their night action resolves. */
  readonly knows?: string;
  /** Optional image path (e.g. "/art/seer.png" served from Front-End/public/art/).
   *  Takes priority over roleIcon when set. */
  readonly artPath?: string;
  /** Inner SVG markup (no <svg> tag). Rendered inside a 24×24 viewBox wrapper. */
  readonly roleIcon?: string;
}

/* Shared visual language: 24×24 viewBox, rounded strokes,
   blood-red / moon-gold accents on dark translucent fills. */

/** Default stroke width used across all role icons. */
const SW = "1.6";
const SW_THIN = "1.4";

export const ROLE_REGISTRY: Record<string, RoleDef> = {
  werewolf: {
    id: "werewolf",
    name: "حرامي",
    title: "اللي واخد الفلوس",
    lore: "خد الفلوس وجري، ودلوقتي قاعد وسط الناس عمّال يعيّط زيّهم. كل اللي عايزه إن الليلة تعدّي وهو مستخبّي.",
    description: "بليل بيعرف مين الحرامية التانيين. لو مفيش حد معاه، يبص على كارت واحد من اللي على الأرض.",
    knows: "أسماء زمايلك الحرامية — ولو كنت لوحدك، كارت أرض واحد",
    // money bag with thief mask
    roleIcon: `
      <path d="M9.5 4h5l1 3.2c2 1.6 3.1 3.9 3.1 6.1a6.6 6.6 0 01-13.2 0c0-2.2 1.1-4.5 3.1-6.1L9.5 4z" fill="rgba(239,68,68,0.18)" stroke="#ef4444" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M8.5 7h7" stroke="#ef4444" stroke-width="${SW_THIN}" stroke-linecap="round" />
      <path d="M6.5 11.5c1.8-1 3.6-1.4 5.5-1.4s3.7.4 5.5 1.4" stroke="#ef4444" stroke-width="${SW_THIN}" stroke-linecap="round" />
      <circle cx="9.8" cy="13.2" r="1" fill="#ef4444" />
      <circle cx="14.2" cy="13.2" r="1" fill="#ef4444" />
    `,
  },
  minion: {
    id: "minion",
    name: "عصفورة",
    title: "ودّان الحارة",
    lore: "يعرف كل حارة وزاوية وأسرارها، عينه في كل مكان، يراقب من بعيد وينقل الأخبار لزمايله. المعلومة هي سلاحه الأقوى.",
    description: "بيعرف مين الحرامية، بس هما مش عارفينه. لو اتصوّت عليه، الحرامية تكسب.",
    knows: "أسماء الحرامية (هما مش هيوفوك)",
    // sparrow — informant bird
    roleIcon: `
      <path d="M4 15c0-4.4 3.6-8 8-8 2.5 0 4.7 1.1 6.2 2.9L21 9l-2.3 2.3A8 8 0 0119 13c0 4.1-3.6 7-8 7-2 0-3.8-.6-5.2-1.7L4 20v-5z" fill="rgba(248,113,113,0.14)" stroke="#f87171" stroke-width="${SW}" stroke-linejoin="round" />
      <circle cx="14.5" cy="10.5" r="1" fill="#f87171" />
      <path d="M8.5 12.5c1.5-1 3.5-1 5 0" stroke="#f87171" stroke-width="${SW_THIN}" stroke-linecap="round" />
      <path d="M10 20v1.5M13 20v1.5" stroke="#f87171" stroke-width="${SW_THIN}" stroke-linecap="round" />
    `,
  },
  clone: {
    id: "clone",
    name: "كوافير",
    title: "بيقلّد أي حد",
    lore: "قاعد في الدكان طول اليوم يتفرّج على الناس. مشيتهم، كلامهم، حتى الطريقة اللي بيكدبوا بيها — كلها محفوظة عنده.",
    description: "بيبص على كارت لاعب تاني ويبقى نفس دوره، وبيعمل قدرة الدور ده على طول.",
    knows: "الدور اللي قلّدته ونتيجة حركته",
    // scissors — copying the look
    roleIcon: `
      <circle cx="6" cy="6" r="2.6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="${SW}" />
      <circle cx="6" cy="18" r="2.6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="${SW}" />
      <path d="M20 4L8.2 15.8M14.5 14.5L20 20M8.2 8.2L12 12" stroke="#38bdf8" stroke-width="${SW}" stroke-linecap="round" />
    `,
  },
  seer: {
    id: "seer",
    name: "خالتي اللتاتا",
    title: "مفيش حاجة بتفوتها",
    lore: "قاعدة على الشباك من قبل ما الشمس تطلع. عارفة مين خرج ومين رجع ومين اتأخر ليه.",
    description: "تبص على كارت لاعب واحد، أو على كارتين من اللي على الأرض.",
    knows: "دور اللاعب اللي اخترته — أو كارتين الأرض بالاسم",
    // eye behind a window frame
    roleIcon: `
      <rect x="5" y="3" width="14" height="18" rx="1.5" fill="rgba(251,191,36,0.08)" stroke="#fbbf24" stroke-width="${SW}" />
      <path d="M5 8.5h14M5 15.5h14" stroke="#fbbf24" stroke-width="${SW_THIN}" />
      <path d="M8.8 12s1.4-2.2 3.2-2.2 3.2 2.2 3.2 2.2-1.4 2.2-3.2 2.2S8.8 12 8.8 12z" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" stroke-width="${SW_THIN}" />
      <circle cx="12" cy="12" r="1.1" fill="#fbbf24" />
    `,
  },
  mason: {
    id: "mason",
    name: "غفير",
    title: "حارس الليل",
    lore: "ماشي في الحارة بالعصاية والفانوس. مش بيسيب حتة من غير ما يعدّي عليها.",
    description: "بيشوف الغفير التاني في الحارة. لو ملقاش حد، يبقى هو الوحيد.",
    knows: "أسماء الغفير التانيين (أو إنك لوحدك)",
    // night-watch lantern
    roleIcon: `
      <path d="M9.5 6a2.5 2.5 0 015 0" stroke="#f59e0b" stroke-width="${SW}" />
      <path d="M8.5 6h7l1 3v8a2 2 0 01-2 2h-5a2 2 0 01-2-2V9l1-3z" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M12 10.5c1.2 1.2 1.8 2.2 1.8 3.2a1.8 1.8 0 11-3.6 0c0-1 .6-2 1.8-3.2z" fill="#f59e0b" opacity="0.85" />
      <path d="M9.5 19h5" stroke="#f59e0b" stroke-width="${SW_THIN}" stroke-linecap="round" />
    `,
  },
  robber: {
    id: "robber",
    name: "ديلر",
    title: "بيبدّل ويقلب",
    lore: "كل حاجة عنده قابلة للتبديل. بيدخل بحاجة ويخرج بحاجة تانية، ومحدش واخد باله.",
    description: "بياخد كارت لاعب تاني ويديله كارته، وبعدين يبص يشوف بقى إيه.",
    knows: "مين سرقت منه ودورك الجديد بالاسم",
    // two cards with swap arrows
    roleIcon: `
      <rect x="11" y="7" width="9" height="13" rx="2" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" stroke-width="${SW_THIN}" stroke-dasharray="2.5 2" />
      <rect x="4" y="4" width="9" height="13" rx="2" fill="rgba(167,139,250,0.14)" stroke="#a78bfa" stroke-width="${SW}" />
      <path d="M6.5 8h4M9 6.5L10.5 8 9 9.5" stroke="#a78bfa" stroke-width="${SW_THIN}" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10.5 12h-4m1.5 1.5L6.5 12l1.5-1.5" stroke="#a78bfa" stroke-width="${SW_THIN}" stroke-linecap="round" stroke-linejoin="round" />
    `,
  },
  troublemaker: {
    id: "troublemaker",
    name: "بلطجي",
    title: "بيلخبط الدنيا",
    lore: "مش عايز حاجة لنفسه. بيحب بس إن الحارة تولّع وهو واقف يتفرّج.",
    description: "بيبدّل كارتين لاعبين تانيين مع بعض من غير ما يبص على أي واحد فيهم.",
    knows: "أسماء الاتنين اللي بدلتهم بس — مش الأدوار",
    // flame — setting the hood on fire
    roleIcon: `
      <path d="M12 3c1.2 2.2 3.2 3.6 4.4 5.7.9 1.5 1.3 3 1.1 4.6A5.8 5.8 0 0112 19.5a5.8 5.8 0 01-5.5-6.2c.1-2.3 1.4-4.2 2.7-5.9.3 1.1.9 2 1.8 2.6C10.7 7.6 11.2 5.2 12 3z" fill="rgba(251,113,133,0.18)" stroke="#fb7185" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M12 12.5c.9 1 1.4 1.8 1.4 2.7a1.4 1.4 0 11-2.8 0c0-.9.5-1.7 1.4-2.7z" fill="#fb7185" opacity="0.85" />
    `,
  },
  drunk: {
    id: "drunk",
    name: "حشاش",
    title: "مش فاكر حاجة",
    lore: "كان في الحارة ساعة الحادثة، أكيد. بس هو نفسه مش متأكد هو كان فين.",
    description: "بيبدّل كارته بكارت من اللي على الأرض، من غير ما يعرف بقى إيه.",
    knows: "إنك بدلت بس — مفيش أي معلومات عن كارتك الجديد",
    // dizzy spiral + smoke bubbles
    roleIcon: `
      <path d="M12 12.5a1.5 1.5 0 103 0 3 3 0 10-6 0 4.5 4.5 0 109 0" stroke="#f59e0b" stroke-width="${SW}" stroke-linecap="round" fill="none" />
      <circle cx="17.5" cy="6" r="1.2" fill="#f59e0b" opacity="0.7" />
      <circle cx="14.5" cy="3.8" r="0.9" fill="#f59e0b" opacity="0.5" />
      <circle cx="20.2" cy="9.2" r="0.8" fill="#f59e0b" opacity="0.6" />
    `,
  },
  warlock: {
    id: "warlock",
    name: "شيخ الحارة",
    title: "كلمته نافذة",
    lore: "بيقول كلمة، فتتنفّذ. الناس بتغيّر حياتها عشان قال، وهو نفسه ساعات مش عارف عمل إيه.",
    description: "بيبدّل كارت لاعب تاني بكارت من اللي على الأرض، من غير ما يبص.",
    knows: "مين بدلت دوره بس — لا دوره القديم ولا الجديد",
    // decree scroll with wax seal
    roleIcon: `
      <path d="M7.5 3.5h9a2 2 0 012 2v13a2 2 0 01-2 2h-9a2 2 0 01-2-2v-13a2 2 0 012-2z" fill="rgba(217,164,65,0.12)" stroke="#d9a441" stroke-width="${SW}" />
      <path d="M8.5 8h7M8.5 11h7M8.5 14h3.5" stroke="#d9a441" stroke-width="${SW_THIN}" stroke-linecap="round" />
      <circle cx="14.8" cy="16.8" r="1.6" fill="#d9a441" opacity="0.85" />
      <path d="M14 18.2l-1 2.2M15.6 18.2l1 2.2" stroke="#d9a441" stroke-width="${SW_THIN}" stroke-linecap="round" />
    `,
  },
  insomniac: {
    id: "insomniac",
    name: "جاضض",
    title: "صاحي لآخر الليل",
    lore: "مش بينام. قاعد على القهوة لحد ما الشمس تطلع، ويشوف الحاجات اللي بتحصل بعد ما الكل ينام.",
    description: "آخر الليل بيبص على كارته يشوف اتغيّر ولا لسه زي ما هو.",
    knows: "دورك النهائي — واتغير من إيه ليه لو اتبدل",
    // coffee cup under crescent moon
    roleIcon: `
      <path d="M21 7.2A5 5 0 1115.3 1.5 4 4 0 0021 7.2z" fill="rgba(148,163,184,0.14)" stroke="#94a3b8" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M4 11.5h11v4.5a4 4 0 01-4 4H8a4 4 0 01-4-4v-4.5z" fill="rgba(148,163,184,0.12)" stroke="#94a3b8" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M15 12.5h1.2a2.3 2.3 0 010 4.6H15" stroke="#94a3b8" stroke-width="${SW_THIN}" stroke-linecap="round" />
      <path d="M7.5 8.7c0-.9.8-1 .8-2M10.7 8.7c0-.9.8-1 .8-2" stroke="#94a3b8" stroke-width="1.3" stroke-linecap="round" opacity="0.7" />
    `,
  },
  joker: {
    id: "joker",
    name: "جوكر",
    title: "عايز الشبهة",
    lore: "تعب من إن محدش بياخد باله منه. لو الحارة كلها هتتكلم عنه، يبقى تمام.",
    description: "بيكسب لوحده لو الناس صوّتت عليه هو. بيبص على كارت من اللي على الأرض.",
    knows: "كارت الأرض اللي بصيت عليه بالاسم",
    // jester card with bells
    roleIcon: `
      <rect x="5" y="3" width="14" height="18" rx="2.5" fill="rgba(232,121,249,0.1)" stroke="#e879f9" stroke-width="${SW}" />
      <path d="M8.5 10c1-2.5 2.5-3.5 3.5-3.5s2.5 1 3.5 3.5c-1 1-2 1.5-3.5 1.5s-2.5-.5-3.5-1.5z" fill="rgba(232,121,249,0.3)" stroke="#e879f9" stroke-width="${SW_THIN}" />
      <circle cx="8" cy="9" r="1" fill="#e879f9" />
      <circle cx="16" cy="9" r="1" fill="#e879f9" />
      <circle cx="12" cy="16.5" r="1.1" fill="#e879f9" opacity="0.85" />
    `,
  },
  oracle: {
    id: "oracle",
    name: "دجال",
    title: "بيقرا الغيب",
    lore: "بيفتح الودع ويقول للناس اللي عايزين يسمعوه. مرات بيطلع كلامه صح، ومرات بيطلع صح بالغلط.",
    description: "بيجيله كشف عن دور من الأدوار اللي في اللعبة.",
    knows: "رؤية عشوائية من حركة لاعب تاني (لو حصلت)",
    // crystal ball on stand, sparkle inside
    roleIcon: `
      <circle cx="12" cy="10.5" r="6" fill="rgba(103,232,249,0.12)" stroke="#67e8f9" stroke-width="${SW}" />
      <path d="M12 6.5c1.8 1.5 2.6 3.2 2.4 5" stroke="#67e8f9" stroke-width="1.3" stroke-linecap="round" opacity="0.7" />
      <path d="M8 20h8M12 16.5V20" stroke="#67e8f9" stroke-width="${SW}" stroke-linecap="round" />
      <path d="M12 8.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" fill="#67e8f9" />
    `,
  },
};

/** Arabic name -> role id lookup (derived). */
export const ROLE_ID_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.values(ROLE_REGISTRY).map((r) => [r.name, r.id]),
);
