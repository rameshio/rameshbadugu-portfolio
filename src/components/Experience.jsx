import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, ChevronRight } from 'lucide-react';

const experiences = [
  {
    role: 'Senior Java Full Stack & AI Solutions Engineer',
    company: 'NextGen Automation Corp',
    period: '2024 - Present',
    description: 'Spearheading the fusion of enterprise Spring Boot services with autonomous AI pipelines. Architecting modular system backends while integrating generative AI flows.',
    achievements: [
      'Orchestrated custom LangGraph microservices to automate data processing, decreasing workflow runtime by 42%.',
      'Designed high-performance Spring Boot APIs interacting with vector databases (Pinecone/Chroma) for contextual semantic search.',
      'Led a team of 4 engineers deploying cloud infrastructure on AWS using Docker, ECS, and Jenkins CI/CD pipelines.'
    ]
  },
  {
    role: 'Java Full Stack Developer',
    company: 'Enterprise Solutions Ltd',
    period: '2021 - 2024',
    description: 'Designed and deployed secure web portals and transaction processing backends for financial and retail sectors using Java 17 and Spring Boot.',
    achievements: [
      'Refactored legacy monolith into RESTful microservices, increasing transaction throughput by 30%.',
      'Engineered state management and interactive layouts on React frontends, improving user engagement rate.',
      'Optimized database indexing and caching layouts in PostgreSQL/Redis, shaving query latencies by 200ms.'
    ]
  },
  {
    role: 'Associate Software Developer',
    company: 'Core Systems Inc',
    period: '2019 - 2021',
    description: 'Collaborated on developing web interfaces and backend server routines, implementing test scripts, and debugging relational integrations.',
    achievements: [
      'Built core data migration utilities using Spring Batch, processing millions of legacy rows daily.',
      'Participated in unit testing using JUnit & Mockito, raising code coverage across backend services to over 85%.',
      'Created custom automation scrapers in Python, saving team members 10+ manual research hours per week.'
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-24 px-6 md:px-12 max-w-5xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          My Journey
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          Work <span className="gradient-text-red">Experience</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      {/* Timeline track container */}
      <div className="relative border-l border-red-950/40 ml-4 md:ml-32 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#030303] border border-red-500 timeline-dot z-20 flex items-center justify-center" />
            
            {/* Date Tag Left Aligned (Desktop Only) */}
            <div className="hidden md:block absolute -left-36 top-5 w-28 text-right pr-6 font-display font-bold text-sm text-red-500/80 tracking-wide">
              {exp.period}
            </div>

            {/* Content Card container */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ 
                x: 4, 
                borderColor: 'rgba(239, 68, 68, 0.25)', 
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.08)' 
              }}
              className="glassmorphism ml-8 md:ml-10 p-6 md:p-8 rounded-2xl border border-red-950/20 text-left transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle top left bar accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-600 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Date tag mobile view */}
              <div className="md:hidden flex items-center gap-1.5 font-display text-xs font-bold text-red-500 mb-2">
                <Calendar size={12} />
                {exp.period}
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-white group-hover:text-red-400 transition-colors">
                    {exp.role}
                  </h3>
                  <span className="font-sans text-sm font-semibold text-zinc-400 flex items-center gap-1.5 mt-1">
                    <Briefcase size={13} className="text-zinc-600" />
                    {exp.company}
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-sans font-light">
                {exp.description}
              </p>

              {/* Achievement Bullet Points */}
              <ul className="space-y-3 font-sans">
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2 text-zinc-400 hover:text-zinc-300 transition-colors text-xs md:text-sm">
                    <ChevronRight size={14} className="text-red-500/80 mt-1 shrink-0" />
                    <span className="leading-relaxed font-light">{ach}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
