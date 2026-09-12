interface SectionLabelProps {
  num: string;
  title: string;
  className?: string;
}

export default function SectionLabel({ num, title, className = "" }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">{num}</span>
      <span className="h-px w-10 bg-gold/60" aria-hidden="true" />
      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-mute">{title}</span>
    </div>
  );
}
