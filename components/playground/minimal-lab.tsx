export function MinimalLabView() {
  return (
    <div className="flex flex-col items-center gap-12 py-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-light">Laboratory</h2>
        <p className="text-zinc-500">Focus on the task, ignore the noise.</p>
      </div>
      <div className="glass w-full max-w-lg p-12 rounded-3xl text-center border-dashed border-2 border-white/10 hover:border-indigo-500/50 transition cursor-pointer">
        <p className="text-xl text-zinc-300">+ Start New Episode</p>
      </div>
    </div>
  );
}
