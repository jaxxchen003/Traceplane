"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitch({ locale }: { locale: "zh" | "en" }) {
  const pathname = usePathname();
  const altLocale = locale === "zh" ? "en" : "zh";
  const nextPath = pathname.replace(/^\/(zh|en)/, `/${altLocale}`);

  return (
    <Link
      href={nextPath || `/${altLocale}/projects`}
      className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-sm text-slate-100 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-cyan-50"
    >
      {locale === "zh" ? "EN" : "中文"}
    </Link>
  );
}
