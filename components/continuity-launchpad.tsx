import { Panel } from "@/components/panel";
import {
  ActionLink,
  CodePathBlock,
  ContinuityCard,
  EmptyPanelState,
  SurfacePill
} from "@/components/continuity-primitives";

export type ContinuityLaunchpadModel = {
  modeLabel: string;
  episodeTitle: string;
  projectName: string;
  nextMove: string;
  briefHref: string;
  packetPath: string;
  handoffJsonPath: string;
  packetExists: boolean;
  packetInstruction: string;
  recommendedHost: string;
};

export function ContinuityLaunchpad({
  locale,
  title,
  eyebrow = "Launchpad",
  launchpad,
  emptyMessage,
  layout = "hero",
  secondaryHref,
  secondaryLabel
}: {
  locale: "zh" | "en";
  title: string;
  eyebrow?: string;
  launchpad: ContinuityLaunchpadModel | null;
  emptyMessage: string;
  layout?: "hero" | "compact";
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  if (!launchpad) {
    return (
      <Panel title={title} eyebrow={eyebrow}>
        <EmptyPanelState>{emptyMessage}</EmptyPanelState>
      </Panel>
    );
  }

  if (layout === "compact") {
    return (
      <Panel title={title} eyebrow={eyebrow}>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.78fr]">
          <ContinuityCard
            label={locale === "zh" ? "直接打开 brief" : "Open the brief directly"}
            title={launchpad.episodeTitle}
            detail={launchpad.nextMove}
            className="bg-void-900 border border-void-700 rounded"
          >
            <p className="mt-2 text-sm text-ink-faint">{launchpad.projectName}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionLink href={launchpad.briefHref}>
                {locale === "zh" ? "打开 episode brief" : "Open episode brief"}
              </ActionLink>
            </div>
          </ContinuityCard>

          <ContinuityCard
            label={locale === "zh" ? "把本地 packet 交给下一个 Agent" : "Pass the local packet to the next agent"}
            className="bg-void-800 border border-void-700 rounded"
          >
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SurfacePill tone={launchpad.packetExists ? "emerald" : "neutral"}>
                {launchpad.packetExists
                  ? "packet ready"
                  : locale === "zh"
                    ? "等待投影"
                    : "awaiting projection"}
              </SurfacePill>
            </div>
            <div className="mt-4 space-y-3 text-sm text-ink-muted">
              <CodePathBlock label="continuation-packet.txt" code={launchpad.packetPath} />
              <CodePathBlock label="handoff-brief.json" code={launchpad.handoffJsonPath} />
            </div>
          </ContinuityCard>

          <ContinuityCard
            label={locale === "zh" ? "建议接力方式" : "Suggested handoff mode"}
            title={launchpad.recommendedHost}
            detail={launchpad.packetInstruction}
            tone="amber"
          >
            <div className="bg-void-900 border border-void-700 rounded mt-3 rounded px-3 py-3 text-sm leading-7 text-ink-muted">
              {launchpad.modeLabel}
            </div>
          </ContinuityCard>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title={title} eyebrow={eyebrow}>
      <div className="tp-launchpad-shell rounded-[28px] px-5 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <SurfacePill tone="cyan">{launchpad.modeLabel}</SurfacePill>
          <SurfacePill tone="amber">{launchpad.recommendedHost}</SurfacePill>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <ContinuityCard
            label={locale === "zh" ? "继续当前 brief" : "Continue from the brief"}
            title={launchpad.episodeTitle}
            detail={launchpad.nextMove}
            className="bg-void-900 border border-void-700 rounded"
          >
            <p className="mt-2 text-sm text-ink-faint">{launchpad.projectName}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionLink href={launchpad.briefHref}>
                {locale === "zh" ? "打开 episode brief" : "Open episode brief"}
              </ActionLink>
              {secondaryHref && secondaryLabel ? (
                <ActionLink href={secondaryHref} tone="secondary">
                  {secondaryLabel}
                </ActionLink>
              ) : null}
            </div>
          </ContinuityCard>

          <ContinuityCard
            label={locale === "zh" ? "从本地 packet 继续" : "Continue from the local packet"}
            className="bg-void-800 border border-void-700 rounded"
          >
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SurfacePill tone={launchpad.packetExists ? "emerald" : "neutral"}>
                {launchpad.packetExists
                  ? "packet ready"
                  : locale === "zh"
                    ? "等待投影"
                    : "awaiting projection"}
              </SurfacePill>
            </div>
            <div className="mt-4 space-y-3 text-sm text-ink-muted">
              <CodePathBlock label="continuation-packet.txt" code={launchpad.packetPath} />
              <CodePathBlock label="handoff-brief.json" code={launchpad.handoffJsonPath} />
            </div>
          </ContinuityCard>
        </div>

        <div className="bg-void-800 border border-void-700 rounded mt-4 rounded px-4 py-4 text-sm leading-7 text-ink-muted">
          {launchpad.packetInstruction}
        </div>
      </div>
    </Panel>
  );
}
