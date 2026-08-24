import { useCallback, useState } from "react";

// Invite-link share button (ported from old ShareButton.tsx):
// native share sheet on mobile, clipboard fallback, /?code=XXXX deep link
export default function ShareButton({ gameCode }: { gameCode: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?code=${gameCode}`;
  const shareText = `اتفضل العب معايا لعب وحوش! الكود: ${gameCode.toUpperCase()}`;

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "لعبة الحرامية", text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl, shareText]);

  return (
    <button className={`btn ghost ${copied ? "picked" : ""}`} onClick={handleShare}>
      {copied ? "اللينك اتنسخ!" : "🔗 ادعُ أصحابك"}
    </button>
  );
}
