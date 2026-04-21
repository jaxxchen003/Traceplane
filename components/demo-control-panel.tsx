"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
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

function fieldClass() {
  return "w-full rounded border border-void-700 bg-[linear-gradient(180deg,rgba(2,6,23,0.82),rgba(8,15,32,0.72))] px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent";
}

function labelClass() {
  return "mb-1 block text-xs uppercase tracking-[0.14em] text-ink-faint";
}

function checkItemClass() {
  return "bg-void-800 border border-void-700 rounded flex items-center gap-2 rounded px-3 py-2 text-sm text-ink-muted";
}

function messageClass(message: string) {
  return message.toLowerCase().includes("fail") || message.toLowerCase().includes("error")
    ? "text-signal-error"
    : "text-signal-success";
}

function buttonClass() {
  return "inline-flex items-center px-4 py-2 text-sm font-medium rounded bg-accent text-white hover:bg-accent-glow px-4 py-2 text-sm font-medium disabled:opacity-60";
}

function normalizeI18n(zh: string, en: string) {
  return {
    zh: zh.trim(),
    en: en.trim() || zh.trim()
  };
}

function CheckboxGrid({
  items,
  selected,
  onToggle
}: {
  items: Array<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map((item) => (
        <label key={item.id} className={checkItemClass()}>
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={() => onToggle(item.id)}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  );
}

function SubmitRow({
  message,
  fallback,
  pending,
  pendingLabel,
  submitLabel
}: {
  message: string;
  fallback: string;
  pending: boolean;
  pendingLabel: string;
  submitLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`text-xs ${message ? messageClass(message) : "text-ink-ghost"}`}>
        {message || fallback}
      </div>
      <button type="submit" className={buttonClass()} disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}

function FieldGroup({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass()}>{label}</label>
      {children}
    </div>
  );
}

function BilingualInputPair({
  zhLabel,
  enLabel,
  zhValue,
  enValue,
  onZhChange,
  onEnChange,
  requiredZh = false
}: {
  zhLabel: string;
  enLabel: string;
  zhValue: string;
  enValue: string;
  onZhChange: (value: string) => void;
  onEnChange: (value: string) => void;
  requiredZh?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FieldGroup label={zhLabel}>
        <input className={fieldClass()} value={zhValue} onChange={(event) => onZhChange(event.target.value)} required={requiredZh} />
      </FieldGroup>
      <FieldGroup label={enLabel}>
        <input className={fieldClass()} value={enValue} onChange={(event) => onEnChange(event.target.value)} />
      </FieldGroup>
    </div>
  );
}

function BilingualTextareaPair({
  zhLabel,
  enLabel,
  zhValue,
  enValue,
  onZhChange,
  onEnChange,
  minHeightClass = "min-h-20",
  requiredZh = false
}: {
  zhLabel: string;
  enLabel: string;
  zhValue: string;
  enValue: string;
  onZhChange: (value: string) => void;
  onEnChange: (value: string) => void;
  minHeightClass?: string;
  requiredZh?: boolean;
}) {
  const areaClass = `${fieldClass()} ${minHeightClass}`;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <FieldGroup label={zhLabel}>
        <textarea className={areaClass} value={zhValue} onChange={(event) => onZhChange(event.target.value)} required={requiredZh} />
      </FieldGroup>
      <FieldGroup label={enLabel}>
        <textarea className={areaClass} value={enValue} onChange={(event) => onEnChange(event.target.value)} />
      </FieldGroup>
    </div>
  );
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
    workType: "GENERATE",
    titleZh: "",
    titleEn: "",
    summaryZh: "",
    summaryEn: "",
    goalZh: "",
    goalEn: "",
    successCriteriaZh: "",
    successCriteriaEn: ""
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = {
      projectId,
      primaryAgentId: form.primaryAgentId,
      workType: form.workType,
      titleI18n: normalizeI18n(form.titleZh, form.titleEn),
      summaryI18n: form.summaryZh ? normalizeI18n(form.summaryZh, form.summaryEn) : null,
      goalI18n: form.goalZh ? normalizeI18n(form.goalZh, form.goalEn) : null,
      successCriteriaI18n: normalizeI18n(
        form.successCriteriaZh || form.goalZh || form.titleZh,
        form.successCriteriaEn || form.goalEn || form.titleEn
      ),
      status: "PLANNED",
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
    setMessage(dict.controls.created);
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
        <div>
          <label className={labelClass()}>{dict.controls.workType}</label>
          <select
            className={fieldClass()}
            value={form.workType}
            onChange={(event) => setForm((current) => ({ ...current, workType: event.target.value }))}
          >
            <option value="RESEARCH">RESEARCH</option>
            <option value="GENERATE">GENERATE</option>
            <option value="REVIEW">REVIEW</option>
            <option value="REVISE">REVISE</option>
            <option value="APPROVE">APPROVE</option>
            <option value="SUMMARIZE">SUMMARIZE</option>
          </select>
        </div>
        <BilingualInputPair
          zhLabel={dict.controls.titleZh}
          enLabel={dict.controls.titleEn}
          zhValue={form.titleZh}
          enValue={form.titleEn}
          onZhChange={(value) => setForm((current) => ({ ...current, titleZh: value }))}
          onEnChange={(value) => setForm((current) => ({ ...current, titleEn: value }))}
          requiredZh
        />
        <BilingualTextareaPair
          zhLabel={dict.controls.summaryZh}
          enLabel={dict.controls.summaryEn}
          zhValue={form.summaryZh}
          enValue={form.summaryEn}
          onZhChange={(value) => setForm((current) => ({ ...current, summaryZh: value }))}
          onEnChange={(value) => setForm((current) => ({ ...current, summaryEn: value }))}
          minHeightClass="min-h-24"
        />
        <BilingualTextareaPair
          zhLabel={dict.controls.goalZh}
          enLabel={dict.controls.goalEn}
          zhValue={form.goalZh}
          enValue={form.goalEn}
          onZhChange={(value) => setForm((current) => ({ ...current, goalZh: value }))}
          onEnChange={(value) => setForm((current) => ({ ...current, goalEn: value }))}
          minHeightClass="min-h-24"
        />
        <BilingualTextareaPair
          zhLabel={dict.controls.successCriteriaZh}
          enLabel={dict.controls.successCriteriaEn}
          zhValue={form.successCriteriaZh}
          enValue={form.successCriteriaEn}
          onZhChange={(value) => setForm((current) => ({ ...current, successCriteriaZh: value }))}
          onEnChange={(value) => setForm((current) => ({ ...current, successCriteriaEn: value }))}
          minHeightClass="min-h-24"
        />
        <div className="flex items-center justify-between gap-3 pt-1">
          <SubmitRow
            message={message}
            fallback={dict.controls.refreshHint}
            pending={isPending}
            pendingLabel={dict.controls.creating}
            submitLabel={dict.controls.submit}
          />
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
  const [memoryMessage, setMemoryMessage] = useState("");
  const [traceMessage, setTraceMessage] = useState("");
  const [artifactMessage, setArtifactMessage] = useState("");
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

  async function submitJson(url: string, payload: unknown, kind: "memory" | "trace" | "artifact") {
    const setMessage =
      kind === "memory" ? setMemoryMessage : kind === "trace" ? setTraceMessage : setArtifactMessage;

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
            const ok = await submitJson("/api/memory", {
              episodeId,
              projectId,
              agentId: memoryForm.agentId,
              titleI18n: normalizeI18n(memoryForm.titleZh, memoryForm.titleEn),
              contentI18n: normalizeI18n(memoryForm.contentZh, memoryForm.contentEn),
              type: memoryForm.type,
              source: memoryForm.source,
              importance: Number(memoryForm.importance),
              sensitivity: memoryForm.sensitivity
            }, "memory");
            if (ok) {
              setMemoryForm((current) => ({
                ...current,
                titleZh: "",
                titleEn: "",
                contentZh: "",
                contentEn: ""
              }));
            }
          }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <FieldGroup label={dict.controls.actorAgent}>
              <select className={fieldClass()} value={memoryForm.agentId} onChange={(event) => setMemoryForm((current) => ({ ...current, agentId: event.target.value }))}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label={dict.controls.type}>
                <select className={fieldClass()} value={memoryForm.type} onChange={(event) => setMemoryForm((current) => ({ ...current, type: event.target.value }))}>
                  <option value="SEMANTIC">SEMANTIC</option>
                  <option value="EPISODIC">EPISODIC</option>
                  <option value="PROCEDURAL">PROCEDURAL</option>
                </select>
              </FieldGroup>
              <FieldGroup label={dict.controls.importance}>
                <input className={fieldClass()} type="number" min="1" max="10" value={memoryForm.importance} onChange={(event) => setMemoryForm((current) => ({ ...current, importance: event.target.value }))} />
              </FieldGroup>
            </div>
          </div>
        <BilingualInputPair
          zhLabel={dict.controls.titleZh}
          enLabel={dict.controls.titleEn}
          zhValue={memoryForm.titleZh}
          enValue={memoryForm.titleEn}
          onZhChange={(value) => setMemoryForm((current) => ({ ...current, titleZh: value }))}
          onEnChange={(value) => setMemoryForm((current) => ({ ...current, titleEn: value }))}
          requiredZh
        />
        <BilingualTextareaPair
          zhLabel={dict.controls.contentZh}
          enLabel={dict.controls.contentEn}
          zhValue={memoryForm.contentZh}
          enValue={memoryForm.contentEn}
          onZhChange={(value) => setMemoryForm((current) => ({ ...current, contentZh: value }))}
          onEnChange={(value) => setMemoryForm((current) => ({ ...current, contentEn: value }))}
          requiredZh
        />
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
          <SubmitRow
            message={memoryMessage}
            fallback={dict.controls.refreshHint}
            pending={isPending}
            pendingLabel={dict.controls.creating}
            submitLabel={dict.controls.submit}
          />
        </form>
      </FormCard>

      <FormCard title={dict.controls.addTrace}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await submitJson("/api/traces", {
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
            }, "trace");
            if (ok) {
              setTraceForm((current) => ({
                ...current,
                toolName: "",
                titleZh: "",
                titleEn: "",
                shortResultZh: "",
                shortResultEn: "",
                decisionZh: "",
                decisionEn: "",
                resultZh: "",
                resultEn: "",
                linkedMemoryIds: []
              }));
            }
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
          <BilingualInputPair
            zhLabel={dict.controls.titleZh}
            enLabel={dict.controls.titleEn}
            zhValue={traceForm.titleZh}
            enValue={traceForm.titleEn}
            onZhChange={(value) => setTraceForm((current) => ({ ...current, titleZh: value }))}
            onEnChange={(value) => setTraceForm((current) => ({ ...current, titleEn: value }))}
            requiredZh
          />
          <BilingualTextareaPair
            zhLabel={dict.controls.shortResultZh}
            enLabel={dict.controls.shortResultEn}
            zhValue={traceForm.shortResultZh}
            enValue={traceForm.shortResultEn}
            onZhChange={(value) => setTraceForm((current) => ({ ...current, shortResultZh: value }))}
            onEnChange={(value) => setTraceForm((current) => ({ ...current, shortResultEn: value }))}
            requiredZh
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FieldGroup label={dict.controls.decisionZh}>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.decisionZh} onChange={(event) => setTraceForm((current) => ({ ...current, decisionZh: event.target.value }))} />
            </FieldGroup>
            <FieldGroup label={dict.controls.resultZh}>
              <textarea className={`${fieldClass()} min-h-20`} value={traceForm.resultZh} onChange={(event) => setTraceForm((current) => ({ ...current, resultZh: event.target.value }))} />
            </FieldGroup>
          </div>
          <FieldGroup label={dict.controls.linkedMemoryIds}>
            <CheckboxGrid
              items={memories}
              selected={traceForm.linkedMemoryIds}
              onToggle={(id) =>
                setTraceForm((current) => ({
                  ...current,
                  linkedMemoryIds: toggleSelection(current.linkedMemoryIds, id)
                }))
              }
            />
          </FieldGroup>
          <SubmitRow
            message={traceMessage}
            fallback={dict.controls.refreshHint}
            pending={isPending}
            pendingLabel={dict.controls.creating}
            submitLabel={dict.controls.submit}
          />
        </form>
      </FormCard>

      <FormCard title={dict.controls.addArtifact}>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await submitJson("/api/artifacts", {
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
            }, "artifact");
            if (ok) {
              setArtifactForm((current) => ({
                ...current,
                artifactKey: "",
                titleZh: "",
                titleEn: "",
                contentZh: "",
                contentEn: "",
                linkedMemoryIds: []
              }));
            }
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
          <BilingualInputPair
            zhLabel={dict.controls.titleZh}
            enLabel={dict.controls.titleEn}
            zhValue={artifactForm.titleZh}
            enValue={artifactForm.titleEn}
            onZhChange={(value) => setArtifactForm((current) => ({ ...current, titleZh: value }))}
            onEnChange={(value) => setArtifactForm((current) => ({ ...current, titleEn: value }))}
            requiredZh
          />
          <BilingualTextareaPair
            zhLabel={dict.controls.contentZh}
            enLabel={dict.controls.contentEn}
            zhValue={artifactForm.contentZh}
            enValue={artifactForm.contentEn}
            onZhChange={(value) => setArtifactForm((current) => ({ ...current, contentZh: value }))}
            onEnChange={(value) => setArtifactForm((current) => ({ ...current, contentEn: value }))}
            minHeightClass="min-h-24"
            requiredZh
          />
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
          <FieldGroup label={dict.controls.linkedMemoryIds}>
            <CheckboxGrid
              items={memories}
              selected={artifactForm.linkedMemoryIds}
              onToggle={(id) =>
                setArtifactForm((current) => ({
                  ...current,
                  linkedMemoryIds: toggleSelection(current.linkedMemoryIds, id)
                }))
              }
            />
          </FieldGroup>
          <SubmitRow
            message={artifactMessage}
            fallback={dict.controls.refreshHint}
            pending={isPending}
            pendingLabel={dict.controls.creating}
            submitLabel={dict.controls.submit}
          />
        </form>
      </FormCard>
    </div>
  );
}
