export function SpineView() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Linear Timeline View */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-indigo-500" />
            <div className="w-px flex-1 bg-white/10 my-2" />
          </div>
          <div className="glass p-6 rounded-3xl flex-1">
            <h3 className="text-lg font-medium">Spine Node {i}</h3>
            <p className="text-zinc-400 text-sm mt-2">Agent 工作节点执行详情...</p>
          </div>
        </div>
      ))}
    </div>
  );
}
