import React from 'react';
import GlowEffect from './components/GlowEffect';
import BackgroundParticles from './components/BackgroundParticles';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Resume from './components/Resume';
import Contact from './components/Contact';

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen text-zinc-100 flex flex-col font-sans select-none bg-[#030303]">
      {/* Background Interactive visual systems */}
      <GlowEffect />
      <BackgroundParticles />

      {/* Floating Navigation Header */}
      <Navbar />

      {/* Page Content sections */}
      <main className="flex-grow">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Resume />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-950 bg-black/40 py-12 px-6 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <a href="#home" className="font-display font-bold text-lg text-white">
              Ramesh<span className="text-red-500 font-extrabold">Badugu</span>
            </a>
            <p className="text-xs text-zinc-600 mt-2 max-w-sm leading-relaxed font-sans font-light">
              Java Full Stack &amp; AI Automation Engineer. Crafting highly optimized backend architectures and automated workflow pipelines.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2 font-mono text-[10px] text-zinc-500">
            <span className="font-semibold text-zinc-400">
              Designed &amp; Built by Ramesh Badugu
            </span>
            <span>
              &copy; {currentYear} &bull; Built with React, Vite, Tailwind v4, Three.js &amp; GSAP.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
