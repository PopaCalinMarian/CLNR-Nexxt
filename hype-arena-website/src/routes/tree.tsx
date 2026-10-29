import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LabelPill, Panel, Shell } from "@/components/Shell";
import { rows, type Row } from "@/lib/hooly";
import { buildTree, checkRow, events, subjectNodes } from "@/lib/tree";

export const Route = createFileRoute("/tree")({
  head: () => ({
    meta: [
      { title: "Hooly Lab — Fact tree and checker" },
      { name: "description", content: "Navigate Hooly facts as a tree anchored on the event timeline and check sentences true, false or unsure." },
      { property: "og:title", content: "Hooly Lab — Fact tree and checker" },
      { property: "og:description", content: "Navigate Hooly facts as a tree anchored on the event timeline and check sentences true, false or unsure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TreePage,
});

const nodes = subjectNodes();

function TreePage() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Row>(rows.find((r) => r.form.length > 1)!);
  const [blind, setBlind] = useState(true);
  const filtered = nodes.filter((n) => !q || `${n.subject} ${n.aliases.join(" ")} ${n.attrs.map((a) => a.attribute).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const result = useMemo(() => checkRow(sel, blind ? buildTree(rows, sel.id) : undefined), [sel, blind]);

  return (
    <Shell title="Fact tree" sub="Subject → attribute → value period → observations. Each period is anchored between Hooly events. A sentence is true only when every fact in it is true.">
      <Panel title="Event timeline (anchors)">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {events.map((e) => (
            <span key={e.name} className={e.date ? "chip" : "chip chip-empty"} title={`${e.mentions} mentions`}>
              {e.date ?? "undated"} · {e.name}
            </span>
          ))}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_26rem]">
        <div>
          <input className="field mb-3 w-full" placeholder="Find subject or attribute…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="max-h-[75vh] space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-3 font-mono text-xs">
            {filtered.map((n) => (
              <details key={n.subject} open={!!q}>
                <summary className="cursor-pointer py-1 font-bold text-primary">{n.subject} <span className="text-muted-foreground">({n.attrs.length})</span></summary>
                <div className="ml-4 border-l border-border pl-3">
                  {n.attrs.map((a) => (
                    <details key={a.attribute}>
                      <summary className="cursor-pointer py-0.5">{a.attribute} <span className="text-muted-foreground">· {a.segments.length} periods · {a.falseValues.length} hype</span></summary>
                      <div className="ml-4 space-y-1 border-l border-border pl-3 pb-2">
                        {a.segments.map((s, i) => (
                          <details key={i}>
                            <summary className="cursor-pointer">
                              <span className="text-primary">{s.value}</span> <span className="text-muted-foreground">{s.from} → {s.to ?? "now"} · after {s.era.after ?? "start"}</span>
                            </summary>
                            <ul className="ml-4">
                              {s.obs.map((o) => <li key={o.rowId}><button className="hover:text-primary" onClick={() => setSel(rows.find((r) => r.id === o.rowId)!)}>{o.date} {o.rowId}</button></li>)}
                            </ul>
                          </details>
                        ))}
                        {[...a.falseValues, ...a.unsure].map((o) => (
                          <button key={o.rowId} className="flex items-center gap-2 hover:text-primary" onClick={() => setSel(rows.find((r) => r.id === o.rowId)!)}>
                            <LabelPill label={o.label} /> {o.value} <span className="text-muted-foreground">{o.date}</span>
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <Panel title={`Checker · ${sel.id} · ${sel.date}`}>
            <p className="text-sm">{sel.text}</p>
            <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} /> Hide this row's own answer while checking
            </label>
            {result.facts.map((f, i) => (
              <div key={i} className="mt-3 border-t border-border pt-3 font-mono text-xs">
                <div className="flex items-center gap-2"><LabelPill label={f.verdict} /> {f.fact.subject} · {f.fact.attribute}</div>
                <div className="mt-1 text-muted-foreground">{f.reason}</div>
                <div className="mt-1 text-muted-foreground">era: after {f.era.after ?? "start"} · before {f.era.before ?? "end"}</div>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm">
              Sentence (AND): <LabelPill label={result.verdict} /> <span className="font-mono text-xs">conf {result.confidence.toFixed(2)}</span>
              <span className="ml-auto text-xs text-muted-foreground">actual</span> <LabelPill label={sel.label} />
            </div>
          </Panel>
          <button className="field mt-3 w-full" onClick={() => setSel(rows[Math.floor(Math.random() * rows.length)]!)}>Random row</button>
        </div>
      </div>
    </Shell>
  );
}
