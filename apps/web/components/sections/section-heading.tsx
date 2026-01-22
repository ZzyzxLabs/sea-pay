type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`space-y-3 max-w-2xl ${alignment}`}>
      <p className="text-sm font-medium tracking-[0.18em] text-sky-700">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-lg text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

