"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormCard } from "@/components/form-card";
import { getDictionary, type Locale } from "@/lib/i18n";

type AgentOption = {
  id: string;
  name: string;
  role: string;
};

type TraceOption = {
  id: string;
  label: string;
};

type MemoryOption = {
  id: string;
  label: string;
};

type ArtifactOption = {
  id: string;
  label: string;
};

function fieldClass() {
  return "w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900";
}

function labelClass() {
  return "mb-1 block text-xs uppercase tracking-[0.14em] text-slate-500";
}

function normalizeI18n(zh: string, en: string) {
  return {
    zh: zh.trim(),
    en: en.trim() || zh.trim()
  };
}

export function ProjectControlPanel({
  locale,
  projectId,
  policyVersion,
  agents
}: {
  locale: Locale;
  projectId: string;
  policyVersion: string;
  agents: AgentOption[];
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    primaryAgentId: agents[0]?.id ?? "",
    titleZh: "",
    titleEn: "",
    summaryZh: "",
    summaryEn: "",
    goalZh: "",
    goalEn: ""
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = {
      projectId,
      primaryAgentId: form.primaryAgentId,
      titleI18n: normalizeI18n(form.titleZh, form.titleEn),
      summaryI18n: form.summaryZh ? normalizeI18n(form.summaryZh, form.summaryEn) : null,
      goalI18n: form.goalZh ? normalizeI18n(form.goalZh, form.goalEn) : null,
      status: "RUNNING",
      policyVersion
    };

    const response = await fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setMessage("Failed to create episode.");
      return;
    }

    const created = await response.json();
    startTransition(() => {
      router.push(`/${locale}/projects/${projectId}/episodes/${created.id}`);
      router.refresh();
    });
  }

  return (
    <FormCard title={dict.controls.createEpisode}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className={labelClass()}>{dict.controls.primaryAgent}</label>
          <select
            className={fieldClass()}
            value={form.primaryAgentId}
            onChange={(event) => setForm((current) => ({ ...current, primaryAgentId: event.target.value }))}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} · {agent.role}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass()}>{dict.controls.titleZh}</label>
            <input className={fieldClass()} value={form.titleZh} onChange={(event) => setForm((current) => ({ ...current, titleZh: event.target.value }))} required />
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.titleEn}</label>
            <input className={fieldClass()} value={form.titleEn} onChange={(event) => setForm((current) => ({ ...current, titleEn: event.target.value }))} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass()}>{dict.controls.summaryZh}</label>
            <textarea className={`${fieldClass()} min-h-24`} value={form.summaryZh} onChange={(event) => setForm((current) => ({ ...current, summaryZh: event.target.value }))} />
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.summaryEn}</label>
            <textarea className={`${fieldClass()} min-h-24`} value={form.summaryEn} onChange={(event) => setForm((current) => ({ ...current, summaryEn: event.target.value }))} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass()}>{dict.controls.goalZh}</label>
            <textarea className={`${fieldClass()} min-h-24`} value={form.goalZh} onChange={(event) => setForm((current) => ({ ...current, goalZh: event.target.value }))} />
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.goalEn}</label>
            <textarea className={`${fieldClass()} min-h-24`} value={form.goalEn} onChange={(event) => setForm((current) => ({ ...current, goalEn: event.target.value }))} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500">{message || dict.controls.refreshHint}</div>
          <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" disabled={isPending}>
            {isPending ? dict.controls.creating : dict.controls.submit}
          </button>
        </div>
      </form>
    </FormCard>
  );
}

export function EpisodeControlPanel({
  locale,
  episodeId,
  projectId,
  agents,
  traces,
  memories
}: {
  locale: Locale;
  episodeId: string;
  projectId: string;
  agents: AgentOption[];
  traces: TraceOption[];
  memories: MemoryOption[];
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [memoryForm, setMemoryForm] = useState({
    agentId: agents[0]?.id ?? "",
    type: "SEMANTIC",
    source: "manual",
    importance: "5",
    sensitivity: "Internal",
    titleZh: "",
    titleEn: "",
    contentZh: "",
    contentEn: ""
  });
  const [traceForm, setTraceForm] = useState({
    actorAgentId: agents[0]?.id ?? "",
    eventType: "SYNTHESIS",
    toolName: "",
    status: "SUCCESS",
    titleZh: "",
    titleEn: "",
    shortResultZh: "",
    shortResultEn: "",
    decisionZh: "",
    decisionEn: "",
    resultZh: "",
    resultEn: "",
    linkedMemoryIds: [] as string[]
  });
  const [artifactForm, setArtifactForm] = useState({
    createdByAgentId: agents[0]?.id ?? "",
    artifactKey: "",
    fileType: "MARKDOWN",
    shareScope: "project",
    sensitivity: "Internal",
    sourceTraceEventId: traces[0]?.id ?? "",
    linkedMemoryIds: [] as string[],
    titleZh: "",
    titleEn: "",
    contentZh: "",
    contentEn: ""
  });

  async function submitJson(url: string, payload: unknown) {
    setMessage("");
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(data?.error ?? "Request failed.");
      return false;
    }
    startTransition(() => router.refresh());
    setMessage(dict.controls.created);
    return true;
  }

  function toggleSelection(current: string[], value: string) {
    return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  }

  return (
    <div className="space-y-4">
      <FormCard title={dict.controls.addMemory}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await submitJson("/api/memory", {
              episodeId,
              projectId,
              agentId: memoryForm.agentId,
              titleI18n: normalizeI18n(memoryForm.titleZh, memoryForm.titleEn),
              contentI18n: normalizeI18n(memoryForm.contentZh, memoryForm.contentEn),
              type: memoryForm.type,
              source: memoryForm.source,
              importance: Number(memoryForm.importance),
              sensitivity: memoryForm.sensitivity
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.actorAgent}</label>
              <select className={fieldClass()} value={memoryForm.agentId} onChange={(event) => setMemoryForm((current) => ({ ...current, agentId: event.target.value }))}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>{dict.controls.type}</label>
                <select className={fieldClass()} value={memoryForm.type} onChange={(event) => setMemoryForm((current) => ({ ...current, type: event.target.value }))}>
                  <option value="SEMANTIC">SEMANTIC</option>
                  <option value="EPISODIC">EPISODIC</option>
                  <option value="PROCEDURAL">PROCEDURAL</option>
                </select>
              </div>
              <div>
                <label className={labelClass()}>{dict.controls.importance}</label>
                <input className={fieldClass()} type="number" min="1" max="10" value={memoryForm.importance} onChange={(event) => setMemoryForm((current) => ({ ...current, importance: event.target.value }))} />
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.titleZh}</label>
              <input className={fieldClass()} value={memoryForm.titleZh} onChange={(event) => setMemoryForm((current) => ({ ...current, titleZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.titleEn}</label>
              <input className={fieldClass()} value={memoryForm.titleEn} onChange={(event) => setMemoryForm((current) => ({ ...current, titleEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.contentZh}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={memoryForm.contentZh} onChange={(event) => setMemoryForm((current) => ({ ...current, contentZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.contentEn}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={memoryForm.contentEn} onChange={(event) => setMemoryForm((current) => ({ ...current, contentEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.source}</label>
              <input className={fieldClass()} value={memoryForm.source} onChange={(event) => setMemoryForm((current) => ({ ...current, source: event.target.value }))} />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.sensitivity}</label>
              <select className={fieldClass()} value={memoryForm.sensitivity} onChange={(event) => setMemoryForm((current) => ({ ...current, sensitivity: event.target.value }))}>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">{message || dict.controls.refreshHint}</div>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" disabled={isPending}>
              {isPending ? dict.controls.creating : dict.controls.submit}
            </button>
          </div>
        </form>
      </FormCard>

      <FormCard title={dict.controls.addTrace}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await submitJson("/api/traces", {
              episodeId,
              projectId,
              actorAgentId: traceForm.actorAgentId,
              eventType: traceForm.eventType,
              toolName: traceForm.toolName,
              stepTitleI18n: normalizeI18n(traceForm.titleZh, traceForm.titleEn),
              status: traceForm.status,
              shortResultI18n: normalizeI18n(traceForm.shortResultZh, traceForm.shortResultEn),
              decisionSummaryI18n: traceForm.decisionZh ? normalizeI18n(traceForm.decisionZh, traceForm.decisionEn) : null,
              resultSummaryI18n: traceForm.resultZh ? normalizeI18n(traceForm.resultZh, traceForm.resultEn) : null,
              linkedMemoryIds: traceForm.linkedMemoryIds
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.actorAgent}</label>
              <select className={fieldClass()} value={traceForm.actorAgentId} onChange={(event) => setTraceForm((current) => ({ ...current, actorAgentId: event.target.value }))}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass()}>{dict.controls.eventType}</label>
                <select className={fieldClass()} value={traceForm.eventType} onChange={(event) => setTraceForm((current) => ({ ...current, eventType: event.target.value }))}>
                  <option value="TASK_STARTED">TASK_STARTED</option>
                  <option value="SYNTHESIS">SYNTHESIS</option>
                  <option value="HANDOFF">HANDOFF</option>
                  <option value="ACCESS_CHECK">ACCESS_CHECK</option>
                </select>
              </div>
              <div>
                <label className={labelClass()}>{dict.common.status}</label>
                <select className={fieldClass()} value={traceForm.status} onChange={(event) => setTraceForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.toolName}</label>
            <input className={fieldClass()} value={traceForm.toolName} onChange={(event) => setTraceForm((current) => ({ ...current, toolName: event.target.value }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.titleZh}</label>
              <input className={fieldClass()} value={traceForm.titleZh} onChange={(event) => setTraceForm((current) => ({ ...current, titleZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.titleEn}</label>
              <input className={fieldClass()} value={traceForm.titleEn} onChange={(event) => setTraceForm((current) => ({ ...current, titleEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.shortResultZh}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.shortResultZh} onChange={(event) => setTraceForm((current) => ({ ...current, shortResultZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.shortResultEn}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.shortResultEn} onChange={(event) => setTraceForm((current) => ({ ...current, shortResultEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.decisionZh}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.decisionZh} onChange={(event) => setTraceForm((current) => ({ ...current, decisionZh: event.target.value }))} />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.resultZh}</label>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.resultZh} onChange={(event) => setTraceForm((current) => ({ ...current, resultZh: event.target.value }))} />
            </div>
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.linkedMemoryIds}</label>
            <div className="grid gap-2 md:grid-cols-2">
              {memories.map((memory) => (
                <label key={memory.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={traceForm.linkedMemoryIds.includes(memory.id)}
                    onChange={() =>
                      setTraceForm((current) => ({
                        ...current,
                        linkedMemoryIds: toggleSelection(current.linkedMemoryIds, memory.id)
                      }))
                    }
                  />
                  <span>{memory.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">{message || dict.controls.refreshHint}</div>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" disabled={isPending}>
              {isPending ? dict.controls.creating : dict.controls.submit}
            </button>
          </div>
        </form>
      </FormCard>

      <FormCard title={dict.controls.addArtifact}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await submitJson("/api/artifacts", {
              episodeId,
              projectId,
              createdByAgentId: artifactForm.createdByAgentId,
              sourceTraceEventId: artifactForm.sourceTraceEventId || null,
              artifactKey: artifactForm.artifactKey,
              titleI18n: normalizeI18n(artifactForm.titleZh, artifactForm.titleEn),
              contentI18n: normalizeI18n(artifactForm.contentZh, artifactForm.contentEn),
              fileType: artifactForm.fileType,
              shareScope: artifactForm.shareScope,
              sensitivity: artifactForm.sensitivity,
              linkedMemoryIds: artifactForm.linkedMemoryIds
            });
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.actorAgent}</label>
              <select className={fieldClass()} value={artifactForm.createdByAgentId} onChange={(event) => setArtifactForm((current) => ({ ...current, createdByAgentId: event.target.value }))}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.artifactKey}</label>
              <input className={fieldClass()} value={artifactForm.artifactKey} onChange={(event) => setArtifactForm((current) => ({ ...current, artifactKey: event.target.value }))} required />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.titleZh}</label>
              <input className={fieldClass()} value={artifactForm.titleZh} onChange={(event) => setArtifactForm((current) => ({ ...current, titleZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.titleEn}</label>
              <input className={fieldClass()} value={artifactForm.titleEn} onChange={(event) => setArtifactForm((current) => ({ ...current, titleEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass()}>{dict.controls.contentZh}</label>
              <textarea className={`${fieldClass()} min-h-24`} value={artifactForm.contentZh} onChange={(event) => setArtifactForm((current) => ({ ...current, contentZh: event.target.value }))} required />
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.contentEn}</label>
              <textarea className={`${fieldClass()} min-h-24`} value={artifactForm.contentEn} onChange={(event) => setArtifactForm((current) => ({ ...current, contentEn: event.target.value }))} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className={labelClass()}>{dict.controls.fileType}</label>
              <select className={fieldClass()} value={artifactForm.fileType} onChange={(event) => setArtifactForm((current) => ({ ...current, fileType: event.target.value }))}>
                <option value="MARKDOWN">MARKDOWN</option>
                <option value="JSON">JSON</option>
                <option value="HTML">HTML</option>
                <option value="SVG">SVG</option>
              </select>
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.shareScope}</label>
              <select className={fieldClass()} value={artifactForm.shareScope} onChange={(event) => setArtifactForm((current) => ({ ...current, shareScope: event.target.value }))}>
                <option value="project">project</option>
                <option value="workspace">workspace</option>
                <option value="private">private</option>
              </select>
            </div>
            <div>
              <label className={labelClass()}>{dict.controls.sensitivity}</label>
              <select className={fieldClass()} value={artifactForm.sensitivity} onChange={(event) => setArtifactForm((current) => ({ ...current, sensitivity: event.target.value }))}>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.sourceTraceEvent}</label>
            <select className={fieldClass()} value={artifactForm.sourceTraceEventId} onChange={(event) => setArtifactForm((current) => ({ ...current, sourceTraceEventId: event.target.value }))}>
              <option value="">None</option>
              {traces.map((trace) => (
                <option key={trace.id} value={trace.id}>
                  {trace.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass()}>{dict.controls.linkedMemoryIds}</label>
            <div className="grid gap-2 md:grid-cols-2">
              {memories.map((memory) => (
                <label key={memory.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={artifactForm.linkedMemoryIds.includes(memory.id)}
                    onChange={() =>
                      setArtifactForm((current) => ({
                        ...current,
                        linkedMemoryIds: toggleSelection(current.linkedMemoryIds, memory.id)
                      }))
                    }
                  />
                  <span>{memory.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">{message || dict.controls.refreshHint}</div>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" disabled={isPending}>
              {isPending ? dict.controls.creating : dict.controls.submit}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
