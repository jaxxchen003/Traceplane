"use client";

import React, { useState } from "react";
import { Panel } from "./panel";
import { StatusBadge } from "./status-badge";
import { ActionLink } from "./continuity-primitives";
import { useRouter } from "next/navigation";

interface StateDiffItem {
  key: string;
  oldValue: any;
  newValue: any;
  type: "added" | "modified" | "removed";
}

export function StateInspector({
  traceId,
  snapshot,
  prevSnapshot,
  episodeId,
  locale
}: {
  traceId: string;
  snapshot: any;
  prevSnapshot: any;
  episodeId: string;
  locale: string;
}) {
  const router = useRouter();
  const [forkInput, setForkInput] = useState("");

  const calculateDiff = () => {
    if (!prevSnapshot) return [];
    const diffs: StateDiffItem[] = [];
    const allKeys = new Set([...Object.keys(prevSnapshot), ...Object.keys(snapshot || {})]);

    allKeys.forEach(key => {
      const oldVal = prevSnapshot[key];
      const newVal = snapshot?.[key];
      if (oldVal === undefined) diffs.push({ key, oldValue: undefined, newValue: newVal, type: "added" });
      else if (newVal === undefined) diffs.push({ key, oldValue: oldVal, newValue: undefined, type: "removed" });
      else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({ key, oldValue: oldVal, newValue: newVal, type: "modified" });
      }
    });
    return diffs;
  };

  const handleFork = async () => {
    const res = await fetch("/api/episodes/fork", {
      method: "POST",
      body: JSON.stringify({
        parentEpisodeId: episodeId,
        traceId: traceId,
        titleI18n: { zh: `分叉实验: ${forkInput || "未命名"}` },
      })
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/${locale}/projects/current/episodes/${data.id}`);
    }
  };

  const diffs = calculateDiff();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">State Inspector</h3>
        <button
          onClick={handleFork}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-full transition-all"
        >
          Fork from here
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 overflow-auto max-h-60">
          <pre>{JSON.stringify(snapshot, null, 2)}</pre>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">State Changes</p>
          {diffs.length === 0 ? (
            <p className="text-sm text-slate-600 italic">No state changes detected from previous step.</p>
          ) : (
            <div className="grid gap-2">
              {diffs.map(d => (
                <div key={d.key} className="p-2 text-xs rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="font-bold text-slate-300">{d.key}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-rose-400 line-through">{String(d.oldValue)}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400">{String(d.newValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <label className="text-xs text-slate-500 block mb-2">Fork Experiment Name</label>
        <input
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-emerald-500 transition-colors"
          placeholder="e.g. Try with better prompt..."
          value={forkInput}
          onChange={(e) => setForkInput(e.target.value)}
        />
      </div>
    </div>
  );
}
