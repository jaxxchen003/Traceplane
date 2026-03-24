function tryFormatJson(content: string) {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

export function ArtifactPreview({
  type,
  content
}: {
  type: string;
  content: string;
}) {
  if (!content) {
    return <div className="rounded-[24px] border border-dashed border-white/16 px-5 py-8 text-sm text-slate-500">No preview content</div>;
  }

  if (type === "JSON") {
    return (
      <pre className="overflow-x-auto rounded-[24px] bg-slate-950 p-5 text-sm leading-7 text-slate-100">
        {tryFormatJson(content)}
      </pre>
    );
  }

  if (type === "MARKDOWN") {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    return (
      <article className="rounded-[24px] bg-white/5 p-6 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
        <div className="space-y-3">
          {lines.map((line, index) =>
            line.startsWith("#") ? (
              <h3 key={`${line}-${index}`} className="text-xl font-semibold text-white">
                {line.replace(/^#+\s*/, "")}
              </h3>
            ) : line.startsWith("- ") || /^\d+\.\s/.test(line) ? (
              <div key={`${line}-${index}`} className="text-sm leading-7 text-slate-300">
                {line}
              </div>
            ) : (
              <p key={`${line}-${index}`} className="text-sm leading-7 text-slate-300">
                {line}
              </p>
            )
          )}
        </div>
      </article>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-[24px] bg-slate-950 p-5 text-sm leading-7 text-slate-100">
      {content}
    </pre>
  );
}
