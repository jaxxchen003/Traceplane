import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traceplane · Multi-Agent Continuity Layer",
  description: "让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。",
};

const content = {
  hero: {
    badge: "v0.1.0 · MIT 开源 · 已上线",
    title: ["Multi-Agent", "Continuity", "Layer"],
    desc: ["解决多 Agent 协作断档问题。", "让工作流像代码一样可回溯、可复用、可交接。", "不是日志，是 Agent 的意识载体。"],
    cta: { primary: "⌘ GitHub 仓库", secondary: "快速预览 →" },
  },
  terminal: { title: "traceplane session — demo" },
  features: [
    { num: "// 001", title: "Episode 连续性模型", desc: "不仅仅是记录，而是 Agent 的意识载体。每个 Episode 都是一个完整的执行上下文，可随时恢复、复用和交接。" },
    { num: "// 002", title: "Surgical Replay", desc: "从任意执行节点进行状态 Fork。像 git checkout 一样回到过去，从那个点重新开始。" },
    { num: "// 003", title: "Handoff Brief", desc: "自动完成 Agent 间无损交接。上下文不丢失，意图不偏离，就像接力赛一样精准传递。" },
    { num: "// 004", title: "全链路事件流观测", desc: "Agent 行为、Artifact 沉淀、风险指标一体化追踪。每个事件都可回链到来源 trace。" },
  ],
  codeDemo: {
    header: "agent-demo.ts",
    lang: "TypeScript",
    lines: [
      { type: "keyword", text: "import" },
      { text: " { Traceplane } " },
      { type: "keyword", text: "from" },
      { text: " '@traceplane/sdk';" },
      { type: "comment", text: "// 创建 Episode" },
      { type: "keyword", text: "const" },
      { text: " session = " },
      { type: "keyword", text: "new" },
      { text: " Traceplane({" },
      { text: "  project: 'customer-pulse'," },
      { text: "  agent: 'claude-code'" },
      { text: "});" },
      { type: "comment", text: "// 追踪每一步操作" },
      { type: "keyword", text: "const" },
      { text: " ep = " },
      { type: "keyword", text: "await" },
      { text: " session.createEpisode({" },
      { text: "  title: 'Weekly Report Generation'" },
      { text: "});" },
      { type: "comment", text: "✅ Episode 完成" },
    ],
  },
  cta: { title: "开始构建你的 Agent 工作图", desc: "开源、免费、可自托管。告别 Agent 协作的黑盒时代。", primary: "GitHub 仓库", secondary: "阅读文档" },
  quickStart: { title: "克隆并运行", commands: ["git clone https://github.com/jaxxchen003/Traceplane.git", "cd Traceplane", "npm install", "cp .env.example .env", "npm run dev"], link: "http://localhost:3000" },
  agents: ["Claude Code ✓", "OpenCode ✓", "Gemini CLI ✓", "Codex ✓"],
  footer: { brand: "TRACEPLANE", license: "MIT License · 开源免费" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030303] text-[#00ff41] font-mono">
      <style>{`
        body {
          font-family: 'IBM Plex Mono', monospace;
          background: #030303;
          color: #00ff41;
          overflow-x: hidden;
          line-height: 1.6;
        }
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.04) 2px, rgba(0, 0, 0, 0.04) 4px);
          pointer-events: none;
          z-index: 9999;
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes scanbar { 0% { top: -5%; } 100% { top: 105%; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .cursor::after { content:'_'; animation: blink 1s step-end infinite; color: #00ff41; }
        .blink { animation: blink 1s step-end infinite; }
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff41, transparent);
          opacity: 0.15;
          animation: scanbar 8s linear infinite;
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; }
        a { color: #00ff41; text-decoration: none; transition: all 0.15s; }
        a:hover { text-decoration: underline; }
      `}</style>

      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#030303]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#00ff41]">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-bold tracking-wider">{content.footer.brand}</span>
          </div>
          <div className="flex gap-6 text-sm uppercase tracking-widest">
            <Link href="/zh/projects" className="text-[#555] hover:text-[#00ff41] transition-colors">平台</Link>
            <a href="https://github.com/jaxxchen003/Traceplane" className="text-[#555] hover:text-[#00ff41] transition-colors">GitHub</a>
            <a href="https://traceplane.cc" className="text-[#555] hover:text-[#00ff41] transition-colors">文档</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-20">
        <div className="scan-line" />
        <div className="relative max-w-3xl text-center">
          <div className="mb-8 fade-up d1">
            <span className="inline-block rounded border border-[#00ff41]/30 bg-[#00ff41]/10 px-4 py-1 text-xs text-[#00ff41] uppercase tracking-widest">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#00ff41]" />
              {content.hero.badge}
            </span>
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight fade-up d2" style={{ letterSpacing: "-0.02em" }}>
            {content.hero.title.map((t, i) => (
              <span key={i} className={i < 2 ? "text-[#00ff41]" : "text-[#555]"}>{t}{i < 2 && <br />}</span>
            ))}
          </h1>
          <p className="mb-8 text-sm leading-8 text-[#888] fade-up d3" style={{ maxWidth: 560, margin: "0 auto 2rem" }}>
            {content.hero.desc.map((d, i) => (
              <span key={i}>{d}{i < content.hero.desc.length - 1 && <br />}</span>
            ))}
          </p>
          <div className="flex flex-wrap justify-center gap-4 fade-up d4">
            <Link href="/zh/projects" className="rounded border-2 border-[#00ff41] bg-[#00ff41] px-8 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-[#00ff41] transition-colors uppercase tracking-widest">
              {content.hero.cta.primary}
            </Link>
            <a href="https://github.com/jaxxchen003/Traceplane" className="rounded border border-[#1a1a1a] px-8 py-3 text-sm hover:border-[#00ff41]/50 transition-colors uppercase tracking-widest">
              {content.hero.cta.secondary}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-6 mb-16 border border-[#1a1a1a]">
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 flex justify-between items-center text-xs text-[#555]">
          <div className="flex gap-2">
            <span className="w-3 h-3 border border-[#333]"></span>
            <span className="w-3 h-3 border border-[#333]"></span>
            <span className="w-3 h-3 border border-[#333]"></span>
          </div>
          <span>{content.terminal.title}</span>
        </div>
        <div className="p-6 font-mono text-sm">
          <div className="mb-2"><span className="text-[#6366f1]">$</span> <span className="text-[#00ff41]">npx @traceplane/cli init customer-pulse</span></div>
          <div className="mb-4 text-[#888]">&nbsp;</div>
          <div className="mb-1 text-[#10b981]">✓ Episode created: ep_cmn71a7ob</div>
          <div className="mb-1 text-[#3b82f6]">→ Agent: claude-code</div>
          <div className="mb-4 text-[#3b82f6]">→ Status: <span className="text-[#10b981]">active</span></div>
          <div className="mb-2"><span className="text-[#6366f1]">$</span> <span className="text-[#00ff41]">traceplane trace tool.fetch_data --duration 1200ms</span></div>
          <div className="mb-4 text-[#888]">&nbsp;</div>
          <div className="mb-1 text-[#10b981]">✓ Trace recorded: tr_001</div>
          <div className="mb-4 text-[#3b82f6]">→ Duration: 1200ms</div>
          <div className="mb-2"><span className="text-[#6366f1]">$</span> <span className="text-[#00ff41]">traceplane episode complete</span></div>
          <div className="mb-4 text-[#888]">&nbsp;</div>
          <div className="mb-1 text-[#10b981]">✓ Episode completed — context saved</div>
          <div className="text-[#10b981]">✓ Handoff brief ready for next agent</div>
          <div><span className="blink text-[#00ff41]">_</span></div>
        </div>
      </section>

      <section className="mx-6 mb-16">
        <div className="mb-8 text-xs text-[#555] uppercase tracking-widest pb-4 border-b border-[#1a1a1a]">[ 核心能力 ]</div>
        <div className="grid gap-px bg-[#1a1a1a] md:grid-cols-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {content.features.map((f, i) => (
            <div key={i} className={`bg-[#0a0a0a] p-8 ${i === 3 ? "md:col-span-3" : ""}`}>
              <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">{f.num}</div>
              <h3 className="mb-3 text-lg font-bold text-[#00ff41]">{f.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-6 mb-16 border border-[#1a1a1a]">
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 flex justify-between items-center text-xs text-[#555]">
          <span>{content.codeDemo.header}</span>
          <span>{content.codeDemo.lang}</span>
        </div>
        <div className="p-6 font-mono text-sm text-[#888] leading-8">
          {content.codeDemo.lines.map((line, i) => {
            if (line.type === "keyword") return <span key={i} className="text-[#6366f1]">{line.text}</span>;
            if (line.type === "comment") return <span key={i} className="text-[#555]">{line.text}</span>;
            return <span key={i}>{line.text}</span>;
          })}
        </div>
      </section>

      <section className="mx-6 mb-16 border border-[#1a1a1a] p-12 text-center">
        <h2 className="mb-4 text-2xl font-bold">{content.cta.title}</h2>
        <p className="mb-8 text-[#888]">{content.cta.desc}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://github.com/jaxxchen003/Traceplane" className="rounded border-2 border-[#00ff41] bg-[#00ff41] px-8 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-[#00ff41] transition-colors uppercase tracking-widest">
            {content.cta.primary}
          </a>
          <a href="https://github.com/jaxxchen003/Traceplane" className="rounded border border-[#1a1a1a] px-8 py-3 text-sm hover:border-[#00ff41]/50 transition-colors uppercase tracking-widest">
            {content.cta.secondary}
          </a>
        </div>
      </section>

      <section className="mx-6 mb-16">
        <div className="mb-8 text-xs text-[#555] uppercase tracking-widest pb-4 border-b border-[#1a1a1a]">[ 快速开始 ]</div>
        <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 font-mono text-sm">
          <div className="mb-4 text-[#555]"># {content.quickStart.title}</div>
          <pre className="overflow-x-auto text-[#00ff41]">{content.quickStart.commands.join("\n")}</pre>
          <div className="mt-4 text-[#555]">
            <span className="text-[#ffaa00]">→</span> 访问 <span className="text-[#00aaff]">{content.quickStart.link}</span> 查看平台
          </div>
        </div>
      </section>

      <section className="mx-6 mb-16">
        <div className="mb-8 text-xs text-[#555] uppercase tracking-widest pb-4 border-b border-[#1a1a1a]">[ 已支持的 Agent ]</div>
        <div className="flex flex-wrap gap-4 text-sm text-[#555]">
          {content.agents.map((a, i) => <span key={i} className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">{a}</span>)}
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] px-6 py-8 text-sm text-[#555]">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 md:flex-row" style={{ maxWidth: "80rem" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#00ff41]">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-bold tracking-wider">{content.footer.brand}</span>
          </div>
          <p>{content.footer.license}</p>
          <div className="flex gap-6">
            <a href="https://github.com/jaxxchen003/Traceplane" className="hover:text-[#00ff41]">GitHub</a>
            <a href="https://traceplane.cc" className="hover:text-[#00ff41]">官网</a>
          </div>
        </div>
      </footer>
    </div>
  );
}