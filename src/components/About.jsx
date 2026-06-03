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
    { value: '5+', label: 'Years Experience', icon: <Award className="text-red-500" size={20} /> },
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Detail Narrative Paragraphs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <h3 className="about-reveal text-xl md:text-2xl font-display font-bold text-white leading-snug">
            Bridging robust Enterprise Java development with state-of-the-art AI agent workflows.
          </h3>
          
          <p className="about-reveal text-zinc-400 font-sans leading-relaxed font-light text-base">
            As a <strong className="text-white font-medium">Java Full Stack Developer &amp; AI Automation Engineer</strong>, I specialize in crafting secure, highly performant systems. My core expertise lies in designing robust distributed services, optimizing relational and NoSQL databases, and engineering seamless frontend interfaces using modern framework technologies.
          </p>
          
          <p className="about-reveal text-zinc-400 font-sans leading-relaxed font-light text-base">
            Driven by a passion for efficiency, I have expanded my development horizons into <strong className="text-white font-medium">AI Engineering</strong>. I design intelligent agents, deploy LLM-orchestrated tools, and automate manual enterprise workflows. By integrating smart automations directly into backend systems, I empower businesses to eliminate redundancy and accelerate operational velocity.
          </p>

          {/* Key pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="about-reveal flex items-start gap-3 p-4 rounded-xl glassmorphism border border-red-950/20">
              <div className="p-2 rounded-lg bg-red-950/40 text-red-500 border border-red-500/10">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">Scalable Architecture</h4>
                <p className="text-xs text-zinc-400 mt-1">High throughput RESTful APIs and distributed message-driven systems.</p>
              </div>
            </div>

            <div className="about-reveal flex items-start gap-3 p-4 rounded-xl glassmorphism border border-red-950/20">
              <div className="p-2 rounded-lg bg-red-950/40 text-red-500 border border-red-500/10">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">AI Agents &amp; LLMs</h4>
                <p className="text-xs text-zinc-400 mt-1">Developing custom RAG loops, vector search utilities, and AI pipelines.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Grid Stat Blocks */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ 
                scale: 1.03,
                borderColor: 'rgba(239, 68, 68, 0.35)',
                boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.2)' 
              }}
              className="glassmorphism p-6 rounded-2xl border border-red-950/20 text-center flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group"
            >
              {/* Subtle background red glow on hover */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/5 mb-3 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <span className="font-display font-black text-3xl text-white glow-text-red block mb-1">
                {stat.value}
              </span>
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
