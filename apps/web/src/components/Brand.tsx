export function Brand({ size = "md", dark = false }: { size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  const markSize = size === "lg" ? "w-10 h-10 text-lg" : size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span className={`${markSize} rounded-xl bg-brand-gradient text-white font-black flex items-center justify-center shadow-soft`}>P</span>
      <span className={`${textSize} font-display font-extrabold tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
        Procure<span className={dark ? "text-accent-300" : "text-brand-600"}>mintra</span>
      </span>
    </span>
  );
}
