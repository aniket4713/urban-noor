export function AnnouncementBar({ text }: { text: string }) {
  const parts = text.split("✦").map((p) => p.trim()).filter(Boolean);
  const row = [...parts, ...parts, ...parts];
  return (
    <div className="relative overflow-hidden animate-gradient-x bg-gradient-to-r from-royal via-magenta to-royal bg-[length:200%_200%] text-white">
      <div className="flex w-max animate-marquee whitespace-nowrap py-2 text-[11px] font-medium uppercase tracking-[0.25em]">
        {[0, 1].map((k) => (
          <div key={k} className="flex" aria-hidden={k === 1}>
            {row.map((p, i) => (
              <span key={i} className="mx-6 flex items-center gap-6">
                {p}
                <span className="text-gold-light">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
