"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const terminalLines = [
  { type: "prompt", text: "$ " },
  { type: "cmd", text: "sdk.startEpisode({ title: 'Weekly report' })" },
  { type: "output", text: "" },
  { type: "success", text: "✓ Episode created: ep_cmn71a7ob" },
  { type: "info", text: " → Agent: claude-code" },
  { type: "info", text: " → Status: active" },
  { type: "output", text: "" },
  { type: "prompt", text: "$ " },
  { type: "cmd", text: "session.toolUse('fetch-data', 'pull feedback', '500 rows')" },
  { type: "output", text: "" },
  { type: "success", text: "✓ Trace recorded: tr_001" },
  { type: "info", text: " → Duration: 1200ms" },
  { type: "output", text: "" },
  { type: "prompt", text: "$ " },
  { type: "cmd", text: "session.complete('handoff brief ready')" },
  { type: "output", text: "" },
  { type: "success", text: "✓ Episode completed — context saved" },
  { type: "success", text: "✓ Handoff brief ready for next agent" },
];

function TerminalOutput() {
  const [displayedLines, setDisplayedLines] = useState<Array<{ type: string; text: string }>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let lineIdx = 0;
    let charIdx = 0;
    let currentText = "";
    let isMounted = true;

    const schedule = (callback: () => void, delay: number) => {
      timeoutRef.current = setTimeout(callback, delay);
    };

    const typeNext = () => {
      if (!isMounted) return;

      if (lineIdx >= terminalLines.length) {
        setDisplayedLines((prev) => [...prev, { type: "prompt", text: "_" }]);
        return;
      }

      const line = terminalLines[lineIdx];

      if (line.text === "") {
        setDisplayedLines((prev) => [...prev, { type: line.type, text: "\u00A0" }]);
        lineIdx++;
        charIdx = 0;
        schedule(typeNext, 300);
        return;
      }

      if (charIdx < line.text.length) {
        currentText += line.text[charIdx];
        setDisplayedLines((prev) => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = { type: line.type, text: currentText };
          return newLines;
        });
        charIdx++;
        const speed = line.type === "prompt" ? 0 : line.type === "cmd" ? 35 : 15;
        schedule(typeNext, speed);
      } else {
        lineIdx++;
        charIdx = 0;
        currentText = "";
        setDisplayedLines((prev) => [...prev, { type: line.type, text: "" }]);
        schedule(typeNext, 200);
      }
    };

    setDisplayedLines([{ type: "prompt", text: "" }]);
    schedule(typeNext, 800);

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 font-mono text-sm">
      {displayedLines.map((line, i) => (
        <div
          key={i}
          className={
            line.type === "prompt"
              ? "text-[#6366f1]"
              : line.type === "cmd"
              ? "text-[#00ff41]"
              : line.type === "success"
              ? "text-[#10b981]"
              : line.type === "info"
              ? "text-[#3b82f6]"
              : "text-[#888]"
          }
          style={line.text === "_" ? { animation: "blink 1s step-end infinite" } : {}}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

const features = [
  { num: "// 001", title: "Episode 连续性模型", desc: "不仅仅是记录，而是 Agent 的意识载体。每个 Episode 都是一个完整的执行上下文，可随时恢复、复用和交接。" },
  { num: "// 002", title: "Surgical Replay", desc: "从任意执行节点进行状态 Fork。像 git checkout 一样回到过去，从那个点重新开始。" },
  { num: "// 003", title: "Handoff Brief", desc: "自动完成 Agent 间无损交接。上下文不丢失，意图不偏离，就像接力赛一样精准传递。" },
  { num: "// 004", title: "全链路事件流观测", desc: "Agent 行为、Artifact 沉淀、风险指标一体化追踪。每个事件都可回链到来源 trace。" },
];

const codeLines = [
  { type: "keyword", text: "import" },
  { text: " { TraceplaneSDK } " },
  { type: "keyword", text: "from" },
  { text: " '@traceplane/agent-sdk';" },
  { text: "\n\n" },
  { type: "comment", text: "// 创建 Episode — 一个完整的执行上下文" },
  { text: "\n" },
  { type: "keyword", text: "const" },
  { text: " sdk = " },
  { type: "keyword", text: "new" },
  { text: " TraceplaneSDK({" },
  { text: "\n  baseUrl: 'http://localhost:3000'," },
  { text: "\n  projectId: 'customer-pulse'," },
  { text: "\n  agentId: 'claude-code'" },
  { text: "\n});" },
  { text: "\n\n" },
  { type: "comment", text: "// 追踪每一步操作" },
  { text: "\n" },
  { type: "keyword", text: "const" },
  { text: " session = " },
  { type: "keyword", text: "await" },
  { text: " sdk.startEpisode({" },
  { text: "\n  title: 'Weekly Report Generation'," },
  { text: "\n  goal: 'Generate customer feedback report'," },
  { text: "\n  successCriteria: 'Report approved and delivered'" },
  { text: "\n});" },
  { text: "\n\n" },
  { type: "keyword", text: "await" },
  { text: " session.toolUse('fetch-data', 'pull feedback', '500 rows');" },
  { text: "\n" },
  { type: "keyword", text: "await" },
  { text: " session.artifact('weekly-report', 'Report', '# Summary...');" },
  { text: "\n" },
  { type: "keyword", text: "await" },
  { text: " session.complete('Report delivered');" },
  { text: "\n\n" },
  { type: "comment", text: "// ✅ Episode 完成 — 上下文已保存" },
];

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
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        a { color: #00ff41; text-decoration: none; transition: all 0.15s; }
        a:hover { text-decoration: underline; }
      `}</style>

      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#030303]/90 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center border-2 border-[#00ff41] text-sm font-bold">⚡</div>
            <span className="font-bold text-sm tracking-wider">TRACEPLANE</span>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest">
            <a href="https://traceplane.cc" className="text-[#555] hover:text-[#00ff41]">文档</a>
            <a href="https://github.com/jaxxchen003/Traceplane" className="text-[#555] hover:text-[#00ff41]">GitHub</a>
            <a href="https://traceplane.cc" className="text-[#6366f1] hover:text-[#818cf8]">登录 →</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[85vh] flex flex-col justify-center px-8 py-32 overflow-hidden" style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-20" style={{ top: "-5%", animation: "scanbar 8s linear infinite" }} />

        <div className="relative fade-up d1">
          <div className="flex items-center gap-4 mb-8 text-xs text-[#6366f1] uppercase tracking-widest">
            <div className="w-10 h-px bg-[#6366f1]"></div>
            <span>v0.1.0 · MIT 开源 · 已上线</span>
          </div>
        </div>

        <h1 className="mb-8 fade-up d2" style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)", fontWeight: 700, lineHeight: 1.05 }}>
          <span className="text-[#00ff41]">Multi-Agent</span>
          <br />
          <span className="text-[#00ff41]">Continuity</span>
          <br />
          <span className="text-[#555]" style={{ fontSize: "0.55em", display: "block", marginTop: "0.3em" }}>Layer</span>
        </h1>

        <p className="mb-12 text-base text-[#a0a0a0] fade-up d3" style={{ maxWidth: 560, borderLeft: "2px solid #1a1a1a", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          解决多 Agent 协作断档问题。<br />
          让工作流像代码一样可回溯、可复用、可交接。<br />
          不是日志，是 Agent 的意识载体。
        </p>

        <div className="flex gap-4 fade-up d4 flex-wrap">
          <a href="https://github.com/jaxxchen003/Traceplane" className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest bg-[#00ff41] text-[#030303] border-2 border-[#00ff41] hover:bg-transparent hover:text-[#00ff41] transition-all">
            ⌘ GitHub 仓库
          </a>
          <a href="https://traceplane.cc/zh/projects" className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#a0a0a0] border border-[#1a1a1a] hover:border-[#555] hover:text-[#00ff41] transition-all">
            快速预览 →
          </a>
        </div>
      </section>

      <section className="mx-8 mb-20 border border-[#1a1a1a]" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <div className="flex items-center justify-between px-4 py-2.5 text-xs text-[#555] bg-[#0a0a0a] border-b border-[#1a1a1a]">
          <div className="flex gap-2">
            <span className="w-2.5 h-2.5 border border-[#333]"></span>
            <span className="w-2.5 h-2.5 border border-[#333]"></span>
            <span className="w-2.5 h-2.5 border border-[#333]"></span>
          </div>
          <span>traceplane session — demo</span>
        </div>
        <TerminalOutput />
      </section>

      <section className="mx-8 mb-20" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <div className="mb-12 pb-4 text-xs text-[#555] uppercase tracking-widest border-b border-[#1a1a1a]">[ 核心能力 ]</div>
        <div className="grid gap-px bg-[#1a1a1a]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {features.map((f, i) => (
            <div key={i} className={`bg-[#0a0a0a] p-8 transition-colors hover:bg-[#111] ${i === 3 ? "md:col-span-4" : ""}`}>
              <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">{f.num}</div>
              <h3 className="mb-3 text-lg font-semibold text-[#00ff41]">{f.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-8 mb-20 border border-[#1a1a1a]" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <div className="flex items-center justify-between px-4 py-2.5 text-xs text-[#555] bg-[#0a0a0a] border-b border-[#1a1a1a]">
          <span>agent-demo.ts</span>
          <span>TypeScript</span>
        </div>
        <div className="p-8 font-mono text-sm text-[#a0a0a0] leading-8 overflow-x-auto">
          {codeLines.map((line, i) => (
            <span
              key={i}
              className={
                line.type === "keyword"
                  ? "text-[#6366f1]"
                  : line.type === "comment"
                  ? "text-[#555]"
                  : ""
              }
            >
              {line.text}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-8 mb-20 border border-[#1a1a1a] p-16 text-center" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <h2 className="mb-4 text-2xl font-bold">开始构建你的 Agent 工作图</h2>
        <p className="mb-8 text-base text-[#a0a0a0]">开源、免费、可自托管。告别 Agent 协作的黑盒时代。</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://github.com/jaxxchen003/Traceplane" className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest bg-[#00ff41] text-[#030303] border-2 border-[#00ff41] hover:bg-transparent hover:text-[#00ff41] transition-all">
            GitHub 仓库
          </a>
          <a href="https://github.com/jaxxchen003/Traceplane" className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#a0a0a0] border border-[#1a1a1a] hover:border-[#555] hover:text-[#00ff41] transition-all">
            阅读文档
          </a>
        </div>
      </section>

      <section className="mx-8 mb-20" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <div className="mb-12 pb-4 text-xs text-[#555] uppercase tracking-widest border-b border-[#1a1a1a]">[ 快速开始 ]</div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] p-6 font-mono text-sm">
          <div className="mb-4 text-[#555]"># 克隆并运行</div>
          <pre className="overflow-x-auto text-[#00ff41]">{"git clone https://github.com/jaxxchen003/Traceplane.git\ncd Traceplane\nnpm install\ncp .env.example .env\nnpm run dev"}</pre>
          <div className="mt-4 text-[#555]">
            <span className="text-[#ffaa00]">→</span> 访问 <span className="text-[#00aaff]">http://localhost:3000</span> 查看平台
          </div>
        </div>
      </section>

      <section className="mx-8 mb-20" style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", marginBottom: "5rem" }}>
        <div className="mb-12 pb-4 text-xs text-[#555] uppercase tracking-widest border-b border-[#1a1a1a]">[ 已支持的 Agent ]</div>
        <div className="flex flex-wrap gap-4 text-sm text-[#555]">
          {["Claude Code ✓", "OpenCode ✓", "Gemini CLI ✓", "Codex ✓"].map((a, i) => (
            <span key={i} className="border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">{a}</span>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] px-8 py-8 mt-4 text-xs text-[#555]" style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#00ff41]">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-bold tracking-wider">TRACEPLANE</span>
          </div>
          <p>© 2025 Traceplane · MIT License</p>
          <div className="flex gap-8">
            <a href="https://github.com/jaxxchen003/Traceplane" className="hover:text-[#00ff41]">GitHub</a>
            <a href="https://traceplane.cc" className="hover:text-[#00ff41]">文档</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
