import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, Cpu, Award, Zap, Code, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

export default function About() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      // GSAP fade and slide effects
      gsap.from('.about-reveal', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }
  }, [isInView]);

  const stats = [
    { value: '4+', label: 'Years Experience', icon: <Award className="text-red-500" size={20} /> },
    { value: '30+', label: 'Projects Completed', icon: <Code className="text-red-500" size={20} /> },
    { value: '100k+', label: 'Lines of Code', icon: <Database className="text-red-500" size={20} /> },
    { value: '50+', label: 'Automations Built', icon: <Zap className="text-red-500" size={20} /> }
  ];

  return (
    <section 
      id="about" 
      ref={containerRef}
      className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10"
    >
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          My Background
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          About <span className="gradient-text-red">Me</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 text-center md:text-left">
        <p className="about-reveal text-zinc-300 font-sans leading-relaxed font-light text-lg md:text-xl">
          I am an AI Master’s student who builds the things I study. My main personal project, Igris, connects Claude, MCP, APIs, and automation tools into a working assistant concept that supports email summaries, job tracking, Telegram notifications, browser tasks, and human-approved workflows.
        </p>
        
        <p className="about-reveal text-zinc-300 font-sans leading-relaxed font-light text-lg md:text-xl">
          I am drawn to the orchestration layer: how AI tools talk to each other, how workflows are designed, and how organizations like nonprofits, schools, and small teams can use AI without it feeling overwhelming or risky.
        </p>

        <p className="about-reveal text-zinc-300 font-sans leading-relaxed font-light text-lg md:text-xl">
          My goal is to grow into someone who can design, explain, and run useful AI systems at real-world scale.
        </p>
      </div>
    </section>
  );
}
