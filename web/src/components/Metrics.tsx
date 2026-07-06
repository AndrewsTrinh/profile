import { metrics } from '../data/resume';

export default function Metrics() {
  return (
    <section className="section section--cream" id="resume">
      <p className="eyebrow eyebrow--dark">RESUME · AT A GLANCE</p>
      <div className="metrics">
        {metrics.map((m) => (
          <div className="metric reveal" key={m.label}>
            <div className="metric__value">{m.value}</div>
            <div className="metric__label">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
