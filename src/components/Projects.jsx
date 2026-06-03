import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Terminal, Server, Bot, HelpCircle } from 'lucide-react';

const GitHubIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const projects = [
  {
    title: 'AetherAgent Workflows',
    category: 'AI & Automation',
    description: 'An autonomous multi-agent platform automating enterprise ticketing. Orchestrated using LangGraph, Python, FastAPI, and vector indexing.',
    technologies: ['Python', 'LangGraph', 'FastAPI', 'Pinecone', 'OpenAI API'],
    icon: <Bot size={20} className="text-red-500" />,
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    title: 'CloudScale Microservices',
    category: 'Java / Backend',
    description: 'Resilient microservices cluster managing real-time inventory. Features Spring Cloud Eureka, Redis cache, and PostgreSQL partitioning.',
    technologies: ['Java 21', 'Spring Boot', 'Spring Cloud', 'Redis', 'PostgreSQL', 'Docker'],
    icon: <Server size={20} className="text-red-500" />,
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    title: 'Cognitive Enterprise Search',
    category: 'Java / Backend',
    description: 'A semantic search pipeline integrating Spring AI and Elasticsearch, providing context-aware document processing and vector embeddings.',
    technologies: ['Java 17', 'Spring AI', 'Elasticsearch', 'HuggingFace', 'Docker'],
    icon: <Terminal size={20} className="text-red-500" />,
    github: 'https://github.com',
    demo: 'https://example.com'
  },
  {
    title: 'AutoETL Agentic Pipeline',
    category: 'AI & Automation',
    description: 'Scrapes data from various sources, parses documents using LLMs, structures schemas, and posts analytical summaries to team wikis.',
    technologies: ['Python', 'LangChain', 'n8n', 'FastAPI', 'MongoDB'],
    icon: <Bot size={20} className="text-red-500" />,
    github: 'https://github.com',
    demo: 'https://example.com'
  }
];

const categories = ['All', 'Java / Backend', 'AI & Automation'];

export default function Projects() {
  const [filter, setFilter] = useState('All');

  const filteredProjects = projects.filter(proj => 
    filter === 'All' || proj.category === filter
  );

  return (
    <section id="projects" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          My Creations
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          Featured <span className="gradient-text-red">Projects</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative border ${
              filter === cat
                ? 'text-white border-red-500/40 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] glow-text-red'
                : 'text-zinc-500 border-red-950/10 hover:border-red-950/30 hover:text-zinc-300'
            }`}
          >
            {filter === cat && (
              <motion.span
                layoutId="activeFilterBg"
                className="absolute inset-0 rounded-xl bg-red-950/10 border border-red-500/10 -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* Grid containing project cards with animations */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              whileHover={{ 
                y: -5,
                borderColor: 'rgba(239, 68, 68, 0.35)',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(239, 68, 68, 0.1)'
              }}
              key={project.title}
              className="glassmorphism p-6 md:p-8 rounded-2xl border border-red-950/20 text-left transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Card visual accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-radial-[circle_at_center,rgba(220,38,38,0.06)_0%,transparent_70%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/15 text-red-500 group-hover:scale-105 transition-transform duration-300">
                    {project.icon}
                  </div>
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-red-400 bg-red-950/30 border border-red-500/15 px-3 py-1 rounded-full uppercase">
                    {project.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-extrabold text-xl text-white group-hover:text-red-400 transition-colors mb-3">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-sans font-light">
                  {project.description}
                </p>
              </div>

              {/* Technologies & Links */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.map((tech, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="px-2.5 py-1 rounded bg-[#030303] text-zinc-500 text-[10px] font-mono border border-zinc-900/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-900/60">
                  <motion.a 
                    href={project.github}
                    target="_blank" 
                    rel="noreferrer"
                    whileHover={{ y: -2, textShadow: '0 0 10px rgba(255,255,255,0.4)' }}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-medium font-sans"
                  >
                    <GitHubIcon size={14} /> GitHub
                  </motion.a>
                  
                  <motion.a 
                    href={project.demo} 
                    target="_blank" 
                    rel="noreferrer"
                    whileHover={{ y: -2, textShadow: '0 0 10px rgba(239,68,68,0.4)' }}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors font-medium font-sans"
                  >
                    <ExternalLink size={14} /> Live Demo
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
