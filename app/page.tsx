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
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff41, transparent);
          opacity: 0.15;
          animation: scanbar 8s linear infinite;
        }
        @keyframes scanbar { 0% { top: -5%; } 100% { top: 105%; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .d1 { animation-delay: 0.1s; }
        .d2 { animation-delay: 0.2s; }
        .d3 { animation-delay: 0.3s; }
        .d4 { animation-delay: 0.4s; }
        .d5 { animation-delay: 0.5s; }
        a { color: #00ff41; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .text-amber { color: #ffaa00; }
        .text-blue { color: #00aaff; }
      `}</style>

      <nav className="sticky top-0 z-50 border-b-2 border-[#1a2a1a] bg-[#030303]/90 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#00ff41]">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="font-bold tracking-wider">TRACEPLANE</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/zh/projects" className="text-[#5a7a5a] hover:text-[#00ff41] transition-colors">平台</Link>
            <a href="https://github.com/jaxxchen003/Traceplane" className="text-[#5a7a5a] hover:text-[#00ff41] transition-colors">GitHub</a>
            <a href="https://traceplane.cc" className="text-[#5a7a5a] hover:text-[#00ff41] transition-colors">文档</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-20">
        <div className="scan-line" />
        <div className="relative max-w-3xl text-center">
          <div className="mb-8 fade-up d1">
            <span className="inline-block rounded border border-[#00ff41]/30 bg-[#00ff41]/10 px-4 py-1 text-xs text-[#00ff41]">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#00ff41]" />
              Multi-Agent Continuity Layer
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight fade-up d2" style={{ letterSpacing: "-0.02em" }}>
            Agent 工作<br />
            <span className="text-[#00ff41]">不再断档</span>
          </h1>
          <p className="mb-8 text-sm leading-8 text-[#5a7a5a] fade-up d3" style={{ maxWidth: 480, margin: "0 auto 2rem" }}>
            让 Claude Code、OpenCode、Gemini CLI 的工作接成一条不断档、可回看、可交接的主线。<br />
            一个 Episode 记录完整上下文，下一个 Agent 直接继续。
          </p>
          <div className="flex flex-wrap justify-center gap-4 fade-up d4">
            <Link
              href="/zh/projects"
              className="rounded bg-[#00ff41] px-6 py-3 text-sm font-bold text-black hover:bg-[#00cc55] transition-colors"
            >
              查看平台演示 →
            </Link>
            <a
              href="https://github.com/jaxxchen003/Traceplane"
              className="rounded border border-[#1a2a1a] px-6 py-3 text-sm hover:border-[#00ff41]/50 transition-colors"
            >
              开源代码
            </a>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#1a2a1a] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded border border-[#1a2a1a] bg-[#0a0a0a] p-6">
              <div className="mb-3 text-2xl">⚡</div>
              <h3 className="mb-2 text-lg font-bold">Episode 连续性</h3>
              <p className="text-sm text-[#5a7a5a] leading-relaxed">
                不仅是记录，而是 Agent 的意识载体。每个 Episode 都是完整的执行上下文，可随时恢复、复用和交接。
              </p>
            </div>
            <div className="rounded border border-[#1a2a1a] bg-[#0a0a0a] p-6">
              <div className="mb-3 text-2xl">↔</div>
              <h3 className="mb-2 text-lg font-bold">无损交接</h3>
              <p className="text-sm text-[#5a7a5a] leading-relaxed">
                自动生成 Handoff Brief：目标、步骤、产物、注意事项压缩成文档，交给下一个 Agent 直接继续。
              </p>
            </div>
            <div className="rounded border border-[#1a2a1a] bg-[#0a0a0a] p-6">
              <div className="mb-3 text-2xl">◉</div>
              <h3 className="mb-2 text-lg font-bold">全链路可观测</h3>
              <p className="text-sm text-[#5a7a5a] leading-relaxed">
                Agent 行为、Artifact、风险在同一视图被看到。每个事件可回链到来源 Trace，形成完整证据链。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#1a2a1a] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-xl font-bold">快速开始</h2>
          <div className="rounded border border-[#1a2a1a] bg-[#0a0a0a] p-6 font-mono text-sm">
            <div className="mb-4 text-[#5a7a5a]"># 克隆并运行</div>
            <pre className="overflow-x-auto text-[#00ff41]">{`git clone https://github.com/jaxxchen003/Traceplane.git
cd Traceplane
npm install
cp .env.example .env
npm run dev`}</pre>
            <div className="mt-4 text-[#5a7a5a]">
              <span className="text-[#ffaa00]">→</span> 访问 <span className="text-[#00aaff]">http://localhost:3000</span> 查看平台
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-[#1a2a1a] px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-xl font-bold">已支持的 Agent</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#5a7a5a]">
            <span className="rounded border border-[#1a2a1a] bg-[#0a0a0a] px-4 py-2">Claude Code ✓</span>
            <span className="rounded border border-[#1a2a1a] bg-[#0a0a0a] px-4 py-2">OpenCode ✓</span>
            <span className="rounded border border-[#1a2a1a] bg-[#0a0a0a] px-4 py-2">Gemini CLI ✓</span>
            <span className="rounded border border-[#1a2a1a] bg-[#0a0a0a] px-4 py-2">Codex ✓</span>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#1a2a1a] px-6 py-8 text-center text-sm text-[#5a7a5a]">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row" style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-[#00ff41]">
              <span className="text-sm font-bold">T</span>
            </div>
            <span className="font-bold tracking-wider">TRACEPLANE</span>
          </div>
          <p>MIT License · 开源免费</p>
          <div className="flex gap-4">
            <a href="https://github.com/jaxxchen003/Traceplane" className="hover:text-[#00ff41]">GitHub</a>
            <a href="https://traceplane.cc" className="hover:text-[#00ff41]">官网</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
