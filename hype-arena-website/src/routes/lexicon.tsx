import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, Shell } from "@/components/Shell";
import { allFacts, lexicon, resolveSubject } from "@/lib/hooly";

export const Route = createFileRoute("/lexicon")({
  head: () => ({
    meta: [
      { title: "Hooly Lab — Lexicon browser" },
      { name: "description", content: "Every Hooly subject, alias, attribute and event, with practice-data coverage." },
      { property: "og:title", content: "Hooly Lab — Lexicon browser" },
      { property: "og:description", content: "Every Hooly subject, alias, attribute and event, with practice-data coverage." },
    ],
  }),
  component: LexiconPage,
});

function LexiconPage() {
  const [q, setQ] = useState("");
  const cov = new Map<string, number>();
  for (const f of allFacts) {
    const k = `${resolveSubject(f.subject) ?? f.subject}|${f.attribute}`;
    cov.set(k, (cov.get(k) ?? 0) + 1);
  }
  const subs = lexicon.subjects.filter((s) => !q || [s.name, ...s.aliases, ...s.attributes].join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell title="Lexicon" sub="The vocabulary of Hooly's world. Numbers show how many practice facts hit each attribute; dashed attributes never appear in practice — a hint they may show up in the hidden rows.">
      <Panel title={`Events (${lexicon.events.length})`}>
        <div className="flex flex-wrap gap-1.5">{lexicon.events.map((e) => <span key={e} className="chip">{e}</span>)}</div>
      </Panel>
      <input className="field my-4 w-full" placeholder="Filter subjects or attributes…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2">
        {subs.map((s) => (
          <Panel key={s.name} title={s.name}>
            {s.aliases.length > 0 && <p className="mb-3 text-xs text-muted-foreground">aka {s.aliases.join(", ")}</p>}
            <div className="flex flex-wrap gap-1.5">
              {s.attributes.map((a) => {
                const n = cov.get(`${s.name}|${a}`) ?? 0;
                return <span key={a} className={n ? "chip" : "chip chip-empty"}>{a} <b>{n}</b></span>;
              })}
            </div>
          </Panel>
        ))}
      </div>
    </Shell>
  );
}
