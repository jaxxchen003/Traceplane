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
      className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:border-slate-900 hover:text-slate-950"
    >
      {locale === "zh" ? "EN" : "中文"}
    </Link>
  );
}
