import Hero from './components/Hero';
import TimelineChart from './components/TimelineChart';
import SkillsTable from './components/SkillsTable';
import ProjectGallery from './components/ProjectGallery';

export default function App() {
  return (
    <main>
      <Hero />
      <TimelineChart />
      <SkillsTable />
      <ProjectGallery />
      <footer className="mx-auto max-w-5xl px-4 py-10 text-cream/60" style={{ fontSize: 16 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>★</span> Built with React +
        Vite · References available upon request.
      </footer>
    </main>
  );
}
