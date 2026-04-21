"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 导入三种不同的视图方案
import { CommandCenterView } from "@/components/playground/command-center";
import { SpineView } from "@/components/playground/spine-view";
import { MinimalLabView } from "@/components/playground/minimal-lab";

export default function PlaygroundPage() {
  const [view, setView] = useState<"command" | "spine" | "minimal">("command");

  const views = {
    command: <CommandCenterView />,
    spine: <SpineView />,
    minimal: <MinimalLabView />,
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      {/* 控制器 */}
      <nav className="flex justify-center gap-2 mb-8 glass p-2 rounded-full w-fit mx-auto">
        {(["command", "spine", "minimal"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              view === v ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {v === "command" ? "指挥中心" : v === "spine" ? "连续体" : "极简实验室"}
          </button>
        ))}
      </nav>

      {/* 视图容器 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {views[view]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
