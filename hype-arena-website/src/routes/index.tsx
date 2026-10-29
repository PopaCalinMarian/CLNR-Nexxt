import { createFileRoute } from "@tanstack/react-router";
import { Bars, Panel, Shell } from "@/components/Shell";
import { allFacts, countBy, lexicon, rows } from "@/lib/hooly";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hooly Lab — Practice data overview" },
      { name: "description", content: "How the Hype or Truth practice data is organised and tokenised." },
      { property: "og:title", content: "Hooly Lab — Practice data overview" },
      { property: "og:description", content: "How the Hype or Truth practice data is organised and tokenised." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const labels = countBy(rows, (r) => r.label);
  const kinds = countBy(allFacts, (f) => f.value.kind);
  const subjects = countBy(allFacts, (f) => f.subject).slice(0, 15);
  const attrs = countBy(allFacts, (f) => f.attribute).slice(0, 15);
  const months = countBy(rows, (r) => r.date.slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0]));
  const stats = [
    ["Rows", rows.length],
    ["Facts", allFacts.length],
    ["Dates", new Set(rows.map((r) => r.date)).size],
    ["Subjects", lexicon.subjects.length],
    ["Events", lexicon.events.length],
  ] as const;
  return (
    <Shell title="How the practice data is organised" sub="Each row is one sentence, judged on its date, already broken into facts: subject · attribute · value. Truth changes over time, so every fact is keyed by (subject, attribute, date).">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-4">
            <div className="font-display text-3xl font-bold text-primary">{v}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
          </div>
        ))}
      </div>
      <div className="mt-4" /><Panel title="Anatomy of a row">
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{`id    p-1
text  "Holdan started at Hooly on 12 January 2026."
date  2026-01-12            ← the day the claim is judged
label true | false | unsure ← the answer you must predict
form  [{ subject: "Holdan", attribute: "joined",
         value: { kind: "date", value: "2026-01-12" } }]   ← the tokens`}</pre>
      </Panel>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Labels"><Bars data={labels} /></Panel>
        <Panel title="Value kinds"><Bars data={kinds} /></Panel>
        <Panel title="Top subjects"><Bars data={subjects} /></Panel>
        <Panel title="Top attributes"><Bars data={attrs} /></Panel>
        <Panel title="Rows per month"><Bars data={months} /></Panel>
        <Panel title="Tokenising strategy">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Resolve subject through lexicon aliases (Hooly AI → Hooly).</li>
            <li>Check the attribute is allowed for that subject.</li>
            <li>Normalise the value by kind (money, duration, percent…).</li>
            <li>Build a dated timeline per subject+attribute from true rows.</li>
            <li>Label new rows: matches timeline → true, contradicts → false, no evidence → unsure.</li>
            <li>Generate claims: changes between timeline steps, comparisons across subjects, relations via name values (CEO, CTO).</li>
          </ol>
        </Panel>
      </div>
    </Shell>
  );
}
