export function CommandCenterView() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Bento Grid layout for high density */}
      <div className="col-span-8 glass p-6 rounded-3xl h-[400px]">指挥中心：核心数据概览</div>
      <div className="col-span-4 glass p-6 rounded-3xl h-[400px]">实时事件流</div>
      <div className="col-span-4 glass p-6 rounded-3xl h-[200px]">Metrics 1</div>
      <div className="col-span-4 glass p-6 rounded-3xl h-[200px]">Metrics 2</div>
      <div className="col-span-4 glass p-6 rounded-3xl h-[200px]">Metrics 3</div>
    </div>
  );
}
