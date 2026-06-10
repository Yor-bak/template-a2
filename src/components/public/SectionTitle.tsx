interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export function SectionTitle({ eyebrow, title, subtitle, centered = true, light = false }: SectionTitleProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#70D6C7] mb-3">
          <span className="w-6 h-px bg-[#70D6C7]" />
          {eyebrow}
          <span className="w-6 h-px bg-[#70D6C7]" />
        </p>
      )}
      <h2 className={`text-3xl md:text-4xl font-extrabold leading-tight mb-4 ${light ? "text-white" : "text-[#102A33]"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`max-w-xl ${centered ? "mx-auto" : ""} text-base leading-relaxed ${light ? "text-white/60" : "text-[#5F737C]"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
