import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LabelPill, Panel, Shell } from "@/components/Shell";
import { rows, tokenise, type Row } from "@/lib/hooly";

export const Route = createFileRoute("/rows")({
  head: () => ({
    meta: [
      { title: "Hooly Lab — Rows and tokens" },
      { name: "description", content: "Search practice rows and see each one tokenised into facts." },
      { property: "og:title", content: "Hooly Lab — Rows and tokens" },
      { property: "og:description", content: "Search practice rows and see each one tokenised into facts." },
    ],
  }),
  component: RowsPage,
});

function RowsPage() {
  const [q, setQ] = useState("");
  const [label, setLabel] = useState("all");
  const [sel, setSel] = useState<Row>(rows[0]!);
  const list = useMemo(() => {
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        (label === "all" || r.label === label) &&
        (!s || r.text.toLowerCase().includes(s) || r.form.some((f) => `${f.subject} ${f.attribute}`.toLowerCase().includes(s)) || r.date.includes(s)),
    );
  }, [q, label]);
  const tokens = tokenise(sel);
  return (
    <Shell title="Rows & tokens" sub="Filter by text, subject, attribute or date. Click a row to see how it becomes (subject, attribute, date) → value.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="field flex-1" placeholder="Search… e.g. Hooly AI Pro, price, 2026-04" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" value={label} onChange={(e) => setLabel(e.target.value)}>
          {["all", "true", "false", "unsure"].map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-border">
          <div className="sticky top-0 bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">{list.length} rows</div>
          {list.slice(0, 400).map((r) => (
            <button key={r.id} onClick={() => setSel(r)} className={`row-item ${sel.id === r.id ? "row-active" : ""}`}>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                {r.id} · {r.date} <LabelPill label={r.label} />
              </div>
              <div className="mt-1 text-sm">{r.text}</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {r.form.map((f, i) => <span key={i} className="chip">{f.subject} · {f.attribute}</span>)}
              </div>
            </button>
          ))}
        </div>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Panel title={`Tokeniser · ${sel.id}`}>
            <p className="text-sm">{sel.text}</p>
            <div className="mt-2"><LabelPill label={sel.label} /></div>
            {tokens.map((t, i) => (
              <dl key={i} className="mt-4 grid grid-cols-[6rem_1fr] gap-y-1 border-t border-border pt-3 font-mono text-xs">
                <dt className="text-muted-foreground">subject</dt>
                <dd>{t.subject}{t.canonical && t.canonical !== t.subject ? ` → ${t.canonical}` : ""}{!t.canonical && <span className="text-destructive"> (not in lexicon)</span>}</dd>
                <dt className="text-muted-foreground">attribute</dt>
                <dd>{t.attribute}{!t.attributeKnown && <span className="text-destructive"> (not in lexicon)</span>}</dd>
                <dt className="text-muted-foreground">date</dt><dd>{t.date}</dd>
                <dt className="text-muted-foreground">kind</dt><dd>{t.kind}</dd>
                <dt className="text-muted-foreground">value</dt><dd className="text-primary">{t.value}</dd>
              </dl>
            ))}
            <pre className="mt-4 overflow-x-auto rounded bg-muted p-2 font-mono text-[10px]">{JSON.stringify(sel.form, null, 1)}</pre>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
