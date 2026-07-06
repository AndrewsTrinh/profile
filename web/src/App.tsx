import BrowserBar from './components/BrowserBar';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Metrics from './components/Metrics';
import Skills from './components/Skills';
import Work from './components/Work';
import Experience from './components/Experience';
import Footer from './components/Footer';
import { useScrollReveal } from './lib/reveal';

export default function App() {
  useScrollReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <BrowserBar />
      <Nav />
      <main id="main">
        <Hero />
        <Metrics />
        <Skills />
        <Work />
        <Experience />
      </main>
      <Footer />
    </>
  );
}
