import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Msg, Title } from '@/components/ui';
import { WORKFLOWS } from '@/data/workflows';

export function WorkflowsView() {
  const [id, setId] = useState(WORKFLOWS[0]!.id);
  const w = WORKFLOWS.find((x) => x.id === id)!;
  const L = ({ t, a }: { t: string; a: string[] }) => (
    <div>
      <h4 className="gp-label">{t}</h4>
      <ul className="list-disc pl-4 space-y-0.5">
        {a.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <section className="space-y-3 gp-fade">
      <Title sub="Educational references, not analytical results.">Workflow Guides</Title>
      <select className="gp-input" aria-label="Workflow" value={id} onChange={(e) => setId(e.target.value)}>
        {WORKFLOWS.map((x) => (
          <option key={x.id} value={x.id}>
            {x.title}
          </option>
        ))}
      </select>
      <article className="gp-card space-y-3">
        <h3 className="font-semibold">{w.title}</h3>
        <p>{w.objective}</p>
        <L t="Datasets" a={w.datasets} />
        <L t="Preprocessing" a={w.preprocessing} />
        <L t="Methods" a={w.methods} />
        <L t="Validation" a={w.validation} />
        <L t="Limitations" a={w.limitations} />
        <div>
          <h4 className="gp-label">Documentation</h4>
          <div className="flex flex-wrap gap-1.5">
            {w.docs.map((d) => (
              <a key={d.url} className="gp-btn" href={d.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={12} />
                {d.label}
              </a>
            ))}
          </div>
        </div>
      </article>
      <Msg kind="info">Method choices depend on data, scale and study goals; adapt and validate for your context.</Msg>
    </section>
  );
}
