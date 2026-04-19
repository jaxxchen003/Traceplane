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
    return <div className="tp-empty-state rounded-[24px] px-5 py-8 text-sm text-slate-500">No preview content</div>;
  }

  if (type === "JSON") {
    return (
      <pre className="tp-code-block overflow-x-auto rounded-[24px] p-5 text-sm leading-7">
        {tryFormatJson(content)}
      </pre>
    );
  }

  if (type === "MARKDOWN") {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    return (
      <article className="tp-soft-card rounded-[24px] p-6">
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
    <pre className="tp-code-block overflow-x-auto rounded-[24px] p-5 text-sm leading-7">
      {content}
    </pre>
  );
}
