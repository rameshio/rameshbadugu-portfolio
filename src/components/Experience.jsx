import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Laptop, ChevronRight, Workflow, Users } from 'lucide-react';

const experiences = [
  {
    role: 'AI Assistant Workflow Design',
    icon: <Workflow size={16} className="text-zinc-600" />,
    description: 'Learning how to orchestrate multiple AI models and external tools to build practical, real-world assistants.',
    achievements: [
      'Learning how to connect AI models (Claude, ChatGPT, Gemini) with APIs and tools.',
      'Practicing the Model Context Protocol (MCP) to allow AI agents to safely access files and web services.',
      'Building the Igris personal assistant to automate email summaries and track jobs.',
      'Implementing human-in-the-loop approvals for important automated actions.'
    ]
  },
  {
    role: 'AI Portfolio Development',
    icon: <Laptop size={16} className="text-zinc-600" />,
    description: 'Building and maintaining a modern web application to showcase my learning journey and projects.',
    achievements: [
      'Built a personal portfolio website from scratch using React, Vite, and Tailwind CSS.',
      'Practiced using AI coding tools to debug layouts and improve responsive design.',
      'Learned how to deploy applications on Vercel and connect custom domains.',
      'Integrated an automated contact form using EmailJS and secure environment variables.'
    ]
  },
  {
    role: 'AI Tools and Automation Practice',
    icon: <BookOpen size={16} className="text-zinc-600" />,
    description: 'Hands-on practice with prompt engineering, local models, and automation scripts.',
    achievements: [
      'Exploring how to automate daily workflows like sending Telegram notifications and processing Gmail data.',
      'Testing different prompt engineering techniques to get reliable responses from language models.',
      'Evaluating local AI models versus cloud-based models for different automation tasks.',
      'Breaking down complex tasks into smaller, testable automation steps.'
    ]
  },
  {
    role: 'Communication and Documentation',
    icon: <Users size={16} className="text-zinc-600" />,
    description: 'Developing soft skills to effectively share knowledge and build trust with users.',
    achievements: [
      'Practicing how to explain technical AI concepts simply to non-technical audiences.',
      'Writing clear documentation for personal projects to understand them better later.',
      'Learning how to structure information effectively for potential teammates and recruiters.',
      'Focusing on transparency and responsible AI usage in all projects.'
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
          Learning & Building <span className="gradient-text-red">Experience</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      {/* Timeline track container */}
      <div className="relative border-l border-red-950/40 ml-4 md:ml-8 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#030303] border border-red-500 timeline-dot z-20 flex items-center justify-center" />

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

              {/* Title & Metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-white group-hover:text-red-400 transition-colors">
                    {exp.role}
                  </h3>
                  <span className="font-sans text-sm font-semibold text-zinc-400 flex items-center gap-1.5 mt-1">
                    {exp.icon}
                    Learning & Practice
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
