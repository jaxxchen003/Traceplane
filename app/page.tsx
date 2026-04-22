import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traceplane · Multi-Agent Continuity Layer",
  description: "让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030303] text-[#00ff41] font-mono">
      
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-3K6BSYFM2V" />
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3K6BSYFM2V');
        `
      }} />

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
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.04) 2px,
            rgba(0, 0, 0, 0.04) 4px
          );
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
        .text-amber { color: #ffaa00; }
        .text-blue { color: #00aaff; }
        .text-accent { color: #6366f1; }
      `}</style>

      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#030303]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#00ff41]">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-bold tracking-wider">TRACEPLANE</span>
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
              v0.1.0 · MIT 开源 · 已上线
            </span>
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight fade-up d2" style={{ letterSpacing: "-0.02em" }}>
            <span className="text-[#00ff41]">Multi-Agent</span>
            <br />
            <span className="text-[#00ff41]">Continuity</span>
            <br />
            <span className="text-[#555]">Layer</span>
          </h1>
          <p className="mb-8 text-sm leading-8 text-[#888] fade-up d3" style={{ maxWidth: 560, margin: "0 auto 2rem" }}>
            解决多 Agent 协作断档问题。
            <br />
            让工作流像代码一样可回溯、可复用、可交接。
            <br />
            <span className="text-[#555]">不是日志，是 Agent 的意识载体。</span>
          </p>
          <div className="flex flex-wrap justify-center gap-4 fade-up d4">
            <Link
              href="/zh/projects"
              className="rounded border-2 border-[#00ff41] bg-[#00ff41] px-8 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-[#00ff41] transition-colors uppercase tracking-widest"
            >
              ⌘ GitHub 仓库
            </Link>
            <a
              href="https://github.com/jaxxchen003/Traceplane"
              className="rounded border border-[#1a1a1a] px-8 py-3 text-sm hover:border-[#00ff41]/50 transition-colors uppercase tracking-widest"
            >
              快速预览 →
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
          <span>traceplane session — demo</span>
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
          <div className="bg-[#0a0a0a] p-8">
            <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">// 001</div>
            <h3 className="mb-3 text-lg font-bold text-[#00ff41]">Episode 连续性模型</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              不仅仅是记录，而是 Agent 的意识载体。每个 Episode 都是一个完整的执行上下文，可随时恢复、复用和交接。
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-8">
            <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">// 002</div>
            <h3 className="mb-3 text-lg font-bold text-[#00ff41]">Surgical Replay</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              从任意执行节点进行状态 Fork。像 git checkout 一样回到过去，从那个点重新开始。
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-8">
            <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">// 003</div>
            <h3 className="mb-3 text-lg font-bold text-[#00ff41]">Handoff Brief</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              自动完成 Agent 间无损交接。上下文不丢失，意图不偏离，就像接力赛一样精准传递。
            </p>
          </div>
          <div className="bg-[#0a0a0a] p-8 md:col-span-3">
            <div className="mb-4 text-xs text-[#6366f1] uppercase tracking-widest">// 004</div>
            <h3 className="mb-3 text-lg font-bold text-[#00ff41]">全链路事件流观测</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              Agent 行为、Artifact 沉淀、风险指标一体化追踪。每个事件都可回链到来源 trace。
            </p>
          </div>
        </div>
      </section>

      
      <section className="mx-6 mb-16 border border-[#1a1a1a]">
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2 flex justify-between items-center text-xs text-[#555]">
          <span>agent-demo.ts</span>
          <span>TypeScript</span>
        </div>
        <div className="p-6 font-mono text-sm text-[#888] leading-8">
          <div>
            <span className="text-[#6366f1]">import</span> {"{ Traceplane }"} <span className="text-[#6366f1]">from</span> <span className="text-[#10b981]">'@traceplane/sdk'</span>;
          </div>
          <div className="mt-4 text-[#555]">// 创建 Episode — 一个完整的执行上下文</div>
          <div>
            <span className="text-[#6366f1]">const</span> session = <span className="text-[#6366f1]">new</span> <span className="text-[#3b82f6]">Traceplane</span>({"{"}
          </div>
          <div className="pl-4">project: <span className="text-[#10b981]">'customer-pulse'</span>,</div>
          <div className="pl-4">agent: <span className="text-[#10b981]">'claude-code'</span></div>
          <div>{"}"});</div>
          <div className="mt-4 text-[#555]">// 追踪每一步操作</div>
          <div>
            <span className="text-[#6366f1]">const</span> ep = <span className="text-[#6366f1]">await</span> session.<span className="text-[#3b82f6]">createEpisode</span>({"{"}
          </div>
          <div className="pl-4">title: <span className="text-[#10b981]">'Weekly Report Generation'</span></div>
          <div>{"}"});</div>
          <div className="mt-4">
            <span className="text-[#555]">// ✅ Episode 完成 — 上下文已保存，随时可交接</span>
          </div>
        </div>
      </section>

      <section className="mx-6 mb-16 border border-[#1a1a1a] p-12 text-center">
        <h2 className="mb-4 text-2xl font-bold">开始构建你的 Agent 工作图</h2>
        <p className="mb-8 text-[#888]">开源、免费、可自托管。告别 Agent 协作的黑盒时代。</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/jaxxchen003/Traceplane"
            className="rounded border-2 border-[#00ff41] bg-[#00ff41] px-8 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-[#00ff41] transition-colors uppercase tracking-widest"
          >
            GitHub 仓库
          </a>
          <a
            href="https://github.com/jaxxchen003/Traceplane"
            className="rounded border border-[#1a1a1a] px-8 py-3 text-sm hover:border-[#00ff41]/50 transition-colors uppercase tracking-widest"
          >
            阅读文档
          </a>
        </div>
      </section>

      
      <section className="mx-6 mb-16">
        <div className="mb-8 text-xs text-[#555] uppercase tracking-widest pb-4 border-b border-[#1a1a1a]">[ 快速开始 ]</div>
        <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 font-mono text-sm">
          <div className="mb-4 text-[#555]"># 克隆并运行</div>
          <pre className="overflow-x-auto text-[#00ff41]">{`git clone https://github.com/jaxxchen003/Traceplane.git
cd Traceplane
npm install
cp .env.example .env
npm run dev`}</pre>
          <div className="mt-4 text-[#555]">
            <span className="text-[#ffaa00]">→</span> 访问 <span className="text-[#00aaff]">http://localhost:3000</span> 查看平台
          </div>
        </div>
      </section>

      
      <section className="mx-6 mb-16">
        <div className="mb-8 text-xs text-[#555] uppercase tracking-widest pb-4 border-b border-[#1a1a1a]">[ 已支持的 Agent ]</div>
        <div className="flex flex-wrap gap-4 text-sm text-[#555]">
          <span className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">Claude Code ✓</span>
          <span className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">OpenCode ✓</span>
          <span className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">Gemini CLI ✓</span>
          <span className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">Codex ✓</span>
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] px-6 py-8 text-sm text-[#555]">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 md:flex-row" style={{ maxWidth: "80rem" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border border-[#00ff41]">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="font-bold tracking-wider">TRACEPLANE</span>
          </div>
          <p>MIT License · 开源免费</p>
          <div className="flex gap-6">
            <a href="https://github.com/jaxxchen003/Traceplane" className="hover:text-[#00ff41]">GitHub</a>
            <a href="https://traceplane.cc" className="hover:text-[#00ff41]">官网</a>
          </div>
        </div>
      </footer>
    </div>
  );
}