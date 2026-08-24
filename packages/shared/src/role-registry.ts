// ═══════════════════════════════════════════════════════════════════
//  ROLE REGISTRY — the single place to edit character content.
//
//  • name        : Arabic display name (used everywhere in the UI)
//  • description : Arabic description shown on role reveal & night
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
    name: "العفريت",
    description: "يشوف باقي العفاريت. لو لوحده، يشوف كارت أرض واحدة",
    knows: "أسماء زماعه العفاريت — ولو كنت لوحدك، كارت أرض واحد",
    // snarling wolf head, ears up, red eyes
    roleIcon: `
      <path d="M5 3l3 5-1.5 4L9 19l3 3 3-3 2.5-7L16 8l3-5-4 2.5L12 4 9 5.5 5 3z" fill="rgba(239,68,68,0.18)" stroke="#ef4444" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M10.5 15l1.5 1.5L13.5 15" stroke="#ef4444" stroke-width="${SW}" stroke-linecap="round" />
      <circle cx="9.5" cy="11" r="1.1" fill="#ef4444" />
      <circle cx="14.5" cy="11" r="1.1" fill="#ef4444" />
    `,
  },
  minion: {
    id: "minion",
    name: "التابع",
    description: "يشوف مين العفاريت. يكسب لو اتطرد والعفاريت يكسبوا",
    knows: "أسماء العفاريت (هما مش هيوفوك)",
    // hooded servant bowing
    roleIcon: `
      <path d="M12 3C7 3 4 8 4 13v7h16v-7c0-5-3-10-8-10z" fill="rgba(248,113,113,0.14)" stroke="#f87171" stroke-width="${SW}" />
      <circle cx="9.5" cy="12" r="1" fill="#f87171" />
      <circle cx="14.5" cy="12" r="1" fill="#f87171" />
      <path d="M10 16h4" stroke="#f87171" stroke-width="${SW}" stroke-linecap="round" />
    `,
  },
  clone: {
    id: "clone",
    name: "الشبيه",
    description: "ياخد دور لاعب تاني ويعمل حركته على طول",
    knows: "الدور اللي استنسخته ونتيجة حركته",
    // two overlapping masks
    roleIcon: `
      <rect x="3" y="3" width="12" height="12" rx="3" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="${SW}" />
      <rect x="9" y="9" width="12" height="12" rx="3" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="${SW}" stroke-dasharray="2.5 2" />
      <circle cx="7.5" cy="7.5" r="1" fill="#38bdf8" />
      <circle cx="15" cy="15" r="1" fill="#38bdf8" />
    `,
  },
  seer: {
    id: "seer",
    name: "الرمال",
    description: "يشوف دور لاعب واحد أو كارتين أرض",
    knows: "دور اللاعب اللي اخترته — أو كارتين الأرض بالاسم",
    // all-seeing eye with rays
    roleIcon: `
      <path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="${SW}" />
      <circle cx="12" cy="12" r="3.2" fill="rgba(251,191,36,0.35)" stroke="#fbbf24" stroke-width="${SW}" />
      <circle cx="12" cy="12" r="1" fill="#fbbf24" />
      <path d="M12 2v2M4.5 4.5L6 6M19.5 4.5L18 6" stroke="#fbbf24" stroke-width="${SW_THIN}" stroke-linecap="round" />
    `,
  },
  mason: {
    id: "mason",
    name: "البناي",
    description: "يصحى مع البنايين التانيين يتشافوا",
    knows: "أسماء البنايين التانيين (أو إنك لوحدك)",
    // brick wall
    roleIcon: `
      <rect x="3" y="5" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
      <rect x="12.5" y="5" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
      <rect x="7.75" y="10.5" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
      <rect x="17.25" y="10.5" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
      <rect x="3" y="16" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
      <rect x="12.5" y="16" width="8" height="4.5" rx="1" fill="rgba(132,204,22,0.1)" stroke="#84cc16" stroke-width="${SW_THIN}" />
    `,
  },
  robber: {
    id: "robber",
    name: "الحرامي",
    description: "يسرق دور لاعب تاني ويشوف دوره الجديد",
    knows: "مين سرقت منه ودورك الجديد بالاسم",
    // burglar domino mask
    roleIcon: `
      <path d="M2.5 10c0-1.5 2-2.5 4.5-2.5 2 0 3.5.8 5 .8s3-.8 5-.8c2.5 0 4.5 1 4.5 2.5 0 3-2.5 6-5 6-1.8 0-3-1.5-4.5-1.5S9.3 16 7.5 16c-2.5 0-5-3-5-6z" fill="rgba(167,139,250,0.16)" stroke="#a78bfa" stroke-width="${SW}" />
      <ellipse cx="7.5" cy="11" rx="2.2" ry="1.6" fill="#a78bfa" opacity="0.85" />
      <ellipse cx="16.5" cy="11" rx="2.2" ry="1.6" fill="#a78bfa" opacity="0.85" />
    `,
  },
  troublemaker: {
    id: "troublemaker",
    name: "الشقية",
    description: "يبادل دورين لاعبين من غير ما يشوف",
    knows: "أسماء الاتنين اللي بدلتهم بس — مش الأدوار",
    // swap arrows between two dots
    roleIcon: `
      <circle cx="6.5" cy="6.5" r="2.2" fill="rgba(251,113,133,0.3)" stroke="#fb7185" stroke-width="${SW_THIN}" />
      <circle cx="17.5" cy="17.5" r="2.2" fill="rgba(251,113,133,0.3)" stroke="#fb7185" stroke-width="${SW_THIN}" />
      <path d="M9 17c-2.5 0-4-1.5-4-4M15 7c2.5 0 4 1.5 4 4" stroke="#fb7185" stroke-width="${SW}" stroke-linecap="round" />
      <path d="M5.5 10.5L5 13l2.5-.5M18.5 13.5l.5-2.5-2.5.5" stroke="#fb7185" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round" />
    `,
  },
  drunk: {
    id: "drunk",
    name: "الليم",
    description: "يبدل دوره بكارت أرض عشوائي من غير ما يبص",
    knows: "إنك بدلت بس — مفيش أي معلومات عن كارتك الجديد",
    // tilted tankard with foam
    roleIcon: `
      <path d="M8 8l8-2 1.5 9a4 4 0 01-8 1L8 8z" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="${SW}" stroke-linejoin="round" />
      <path d="M17 8.5l2.5 1a2.5 2.5 0 01-1.5 4.5" stroke="#f59e0b" stroke-width="${SW}" stroke-linecap="round" />
      <circle cx="9.5" cy="5.5" r="1.6" fill="#f59e0b" opacity="0.7" />
      <circle cx="13.5" cy="4" r="1.2" fill="#f59e0b" opacity="0.5" />
      <circle cx="16" cy="5.8" r="1" fill="#f59e0b" opacity="0.6" />
    `,
  },
  warlock: {
    id: "warlock",
    name: "الساحر",
    description: "يبدل دور لاعب بكارت أرض عشوائي من غير ما يبص",
    knows: "مين بدلت دوره بس — لا دوره القديم ولا الجديد",
    // bubbling flask with swap arrow
    roleIcon: `
      <path d="M10 3h4M11 3v5l-4.5 8A3 3 0 009 21h6a3 3 0 002.5-5L13 8V3" fill="rgba(163,230,53,0.1)" stroke="#a3e635" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round" />
      <circle cx="10" cy="17" r="1.1" fill="#a3e635" opacity="0.8" />
      <circle cx="13.5" cy="15.5" r="0.8" fill="#a3e635" opacity="0.6" />
    `,
  },
  insomniac: {
    id: "insomniac",
    name: "الساهر",
    description: "يصحى آخر الليل يتأكد دوره اتغير ولا لأ",
    knows: "دورك النهائي — واتغير من إيه ليه لو اتبدل",
    // eye under crescent + star
    roleIcon: `
      <path d="M15.5 3.5A9 9 0 1120 15.5 7.5 7.5 0 0115.5 3.5z" fill="rgba(148,163,184,0.12)" stroke="#94a3b8" stroke-width="${SW}" />
      <path d="M17 5l.8 1.7L19.5 7.5l-1.7.8L17 10l-.8-1.7-1.7-.8 1.7-.8L17 5z" fill="#fbbf24" />
      <path d="M4 17s2-3.5 5.5-3.5S15 17 15 17" stroke="#94a3b8" stroke-width="${SW}" stroke-linecap="round" />
      <circle cx="9.5" cy="17" r="1.2" fill="#94a3b8" />
    `,
  },
  joker: {
    id: "joker",
    name: "الجوكر",
    description: "يبص على كارت أرض. يكسب لوحدو لو اتصوّت عليه",
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
    name: "الكاهن",
    description: "آخر الليل يستلم نتيجة حركة عشوائية للاعب تاني",
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
