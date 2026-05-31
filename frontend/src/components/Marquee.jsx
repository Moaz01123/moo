export default function Marquee({ text }) {
  const content = text || "KAVO · LIMITED DROPS · WORLDWIDE SHIPPING ·";
  return (
    <div className="overflow-hidden border-y hairline bg-ink py-3 text-bone">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[0, 1].map((k) => (
          <span
            key={k}
            className="px-6 font-display text-sm uppercase tracking-ultra"
            aria-hidden={k === 1}
          >
            {content.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  );
}
