"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";

export function EpisodeListClient({
  items,
  locale,
  emptyLabel,
  ctaLabel,
  projectLabel,
  dict,
}: any) {
  return items.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-void-700 px-5 py-8 text-sm text-zinc-500">
      {emptyLabel}
    </div>
  ) : (
    <motion.div
      className="grid gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
        hidden: {},
      }}
    >
      {items.map((item: any) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="bg-void-900 rounded-lg border border-void-700 px-6 py-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                <StatusBadge label={dict.statuses[item.status]} raw={item.status} />
              </div>
              <p className="text-sm leading-7 text-zinc-400">{item.goal || item.summary}</p>
              <div className="mt-4 rounded-lg border border-void-700 bg-white/5 px-4 py-3 text-sm leading-6 text-zinc-300">
                <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400">{item.queueHint}</div>
                <div className="mt-1">{item.nextMove}</div>
              </div>
            </div>
            <div className="min-w-[200px] text-right space-y-3">
              <div className="text-xs text-zinc-500">{formatDate(item.updatedAt, locale)}</div>
              <div className="flex justify-end gap-2">
                <Link
                  href={`/${locale}/projects/${item.projectId}/episodes/${item.id}`}
                  className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-100 hover:bg-indigo-500/20"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
