import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LabelPill, Panel, Shell } from "@/components/Shell";
import { allFacts, buildTimeline, lexicon, resolveSubject, rows, trueChanges } from "@/lib/hooly";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Hooly Lab — Fact timelines" },
      { name: "description", content: "See how each Hooly fact changes over time, with true, false and unsure observations." },
      { property: "og:title", content: "Hooly Lab — Fact timelines" },
      { property: "og:description", content: "See how each Hooly fact changes over time, with true, false and unsure observations." },
    ],
  }),
  component: TimelinePage,
});

const used = new Set(allFacts.map((f) => `${resolveSubject(f.subject) ?? f.subject}|${f.attribute}`));

function TimelinePage() {
  const [subject, setSubject] = useState("Hooly AI Pro");
  const subj = lexicon.subjects.find((s) => s.name === subject);
  const attrs = (subj?.attributes ?? []).filter((a) => used.has(`${subject}|${a}`));
  const [attr, setAttr] = useState("price");
  const a = attrs.includes(attr) ? attr : attrs[0] ?? "";
  const pts = buildTimeline(rows, subject, a);
  const steps = trueChanges(pts);
  return (
    <Shell title="Timelines" sub="Truth depends on the date. True observations form the timeline; false ones are the hype; changes between steps are ready-made 'change' claims.">
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {lexicon.subjects.map((s) => <option key={s.name}>{s.name}</option>)}
        </select>
        <select className="field" value={a} onChange={(e) => setAttr(e.target.value)}>
          {attrs.map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <Panel title="True value steps (change claims)">
        {steps.length ? (
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            {steps.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">→</span>}
                <span className="chip">{s.value} <span className="text-muted-foreground">from {s.date}</span></span>
              </span>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No true observations.</p>}
      </Panel>
      <div className="mt-4 space-y-2">
        {pts.map((p, i) => (
          <div key={i} className="grid grid-cols-[6.5rem_5rem_10rem_1fr] items-start gap-3 rounded-md border border-border bg-card p-3 text-sm">
            <span className="font-mono text-xs">{p.date}</span>
            <LabelPill label={p.label} />
            <span className="font-mono text-xs text-primary">{p.value}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
