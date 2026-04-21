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
    return <div className="border border-dashed border-void-700 rounded rounded px-5 py-8 text-sm text-ink-ghost">No preview content</div>;
  }

  if (type === "JSON") {
    return (
      <pre className="tp-code-block overflow-x-auto rounded p-5 text-sm leading-7">
        {tryFormatJson(content)}
      </pre>
    );
  }

  if (type === "MARKDOWN") {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);
    return (
      <article className="bg-void-800 border border-void-700 rounded rounded p-6">
        <div className="space-y-3">
          {lines.map((line, index) =>
            line.startsWith("#") ? (
              <h3 key={`${line}-${index}`} className="text-xl font-semibold text-white">
                {line.replace(/^#+\s*/, "")}
              </h3>
            ) : line.startsWith("- ") || /^\d+\.\s/.test(line) ? (
              <div key={`${line}-${index}`} className="text-sm leading-7 text-ink-muted">
                {line}
              </div>
            ) : (
              <p key={`${line}-${index}`} className="text-sm leading-7 text-ink-muted">
                {line}
              </p>
            )
          )}
        </div>
      </article>
    );
  }

  return (
    <pre className="tp-code-block overflow-x-auto rounded p-5 text-sm leading-7">
      {content}
    </pre>
  );
}
