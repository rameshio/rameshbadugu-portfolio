import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Database, Eye, Terminal } from 'lucide-react';

const skillCategories = [
  {
    title: 'Backend & Java Ecosystem',
    icon: <Code2 className="text-red-500" size={24} />,
    description: 'Building secure, fault-tolerant enterprise services.',
    skills: [
      'Java 17 / 21', 'Spring Boot', 'Spring Cloud', 'Hibernate / JPA', 
      'Microservices', 'RESTful APIs', 'gRPC & WebSockets', 'JUnit & Mockito'
    ]
  },
  {
    title: 'AI & Automation Engineering',
    icon: <Cpu className="text-red-500" size={24} />,
    description: 'Designing autonomous workflows and LLM applications.',
    skills: [
      'LLM Integration (GPT, Claude)', 'LangChain & LangGraph', 'Vector Databases (Chroma, Pinecone)', 
      'n8n / Make Workflow Automation', 'Multi-Agent Systems (CrewAI)', 'Python & FastAPI', 
      'Web Scraping & ETL', 'Semantic Search & RAG'
    ]
  },
  {
    title: 'Databases & Infrastructure',
    icon: <Database className="text-red-500" size={24} />,
    description: 'Managing cloud systems and data persistence.',
    skills: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis Caching', 
      'Docker & Containers', 'AWS (S3, EC2, RDS)', 'Kubernetes', 'CI/CD (Jenkins, GitHub Actions)'
    ]
  },
  {
    title: 'Frontend & Interactive Web',
    icon: <Eye className="text-red-500" size={24} />,
    description: 'Crafting responsive, immersive user interfaces.',
    skills: [
      'React & Vite', 'JavaScript (ES6+)', 'Tailwind CSS', 'Redux Toolkit',
      'Framer Motion', 'Three.js / React Three Fiber', 'GSAP Animations', 'Responsive UI/UX'
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

export default function Skills() {
  return (
    <section id="skills" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          Core Competencies
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          My <span className="gradient-text-red">Skills</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      {/* Grid container with staggering reveals */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {skillCategories.map((category, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ 
              y: -5,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              boxShadow: '0 15px 45px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.1)'
            }}
            className="glassmorphism p-8 rounded-2xl border border-red-950/20 text-left transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
          >
            {/* Subtle card glow overlay */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-600/10 to-transparent blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

            <div>
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/15 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] group-hover:scale-105 transition-transform duration-300">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">
                    {category.title}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed font-light">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Skills Tags Grid */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                {category.skills.map((skill, sIdx) => (
                  <motion.span
                    key={sIdx}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderColor: 'rgba(239, 68, 68, 0.4)' 
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-red-950/10 border border-red-950/40 hover:text-white shadow-sm cursor-default transition-all duration-200"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Micro-terminal decorative highlight */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-900/60">
              <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1.5">
                <Terminal size={10} className="text-red-500/60" />
                system_ready.sh
              </span>
              <span className="text-[9px] font-mono text-red-600/40 uppercase tracking-widest font-semibold">
                ACTIVE
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
