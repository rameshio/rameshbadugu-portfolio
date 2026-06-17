import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Workflow, ChevronRight, X } from 'lucide-react';

const projectsData = [
  {
    id: 1,
    title: 'AI Portfolio Website',
    icon: <Terminal size={24} className="text-red-500" />,
    description: 'Built and improved my personal portfolio website to present my resume, skills, AI learning journey, projects, and contact information professionally.',
    points: [
      'Built a modern portfolio using React, Vite, Tailwind CSS, and dark red/black UI design.',
      'Connected the project with GitHub and deployed it online using Vercel.',
      'Added a custom domain: rameshbaduguai.com.',
      'Fixed resume download so visitors can download the actual PDF resume.',
      'Improved contact section with email, phone number, and location.',
      'Enabled text copying so visitors can select and copy website content.',
      'Used AI coding tools to debug layout issues, fix broken imports, and improve user experience.'
    ],
    tech: ['React', 'Vite', 'Tailwind CSS', 'GitHub', 'Vercel', 'VS Code', 'Antigravity', 'AI Coding Tools']
  },
  {
    id: 2,
    title: 'AI Tools & Agent Learning',
    icon: <BrainCircuit size={24} className="text-red-500" />,
    description: 'Hands-on learning with AI tools, AI agents, MCP concepts, APIs, and automation workflows.',
    points: [
      'Explored ChatGPT, Claude, Gemini, Google AI Studio, and AI coding assistants.',
      'Learned how AI tools can help with planning, writing prompts, debugging, and project building.',
      'Practiced MCP concepts and AI orchestration ideas.',
      'Studied how agents can connect with tools, APIs, email, browser, and automation workflows.',
      'Used AI to improve resume, portfolio, LinkedIn, and job search preparation.'
    ],
    tech: ['ChatGPT', 'Claude', 'Gemini', 'Google AI Studio', 'MCP', 'APIs', 'Prompt Engineering', 'AI Agents', 'Workflow Automation']
  },
  {
    id: 3,
    title: 'Contact Form Automation',
    icon: <Workflow size={24} className="text-red-500" />,
    description: 'Improved the portfolio contact form so visitors can send messages directly from the website.',
    points: [
      'Added contact form structure with name, email, subject, and message fields.',
      'Connected form logic using EmailJS environment variables.',
      'Added user-friendly success and failure messages.',
      'Added fallback email option if sending fails.',
      'Prepared Vercel environment variables for production deployment.'
    ],
    tech: ['EmailJS', 'React', 'Vercel Environment Variables', 'Contact Automation']
  }
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="py-24 relative z-20 select-text">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism border border-red-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-red-400">Current Focus</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            AI Projects & <span className="text-red-500 glow-text-red">Learning Journey</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto font-sans font-light">
            A transparent look into my ongoing exploration of AI tools, modern web development, and workflow automation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glassmorphism rounded-2xl p-6 border border-red-950/40 hover:border-red-500/30 transition-all duration-500 flex flex-col h-full group hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.15)]"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-950/50 to-black border border-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {project.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 font-display">
                {project.title}
              </h3>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-sans">
                {project.description}
              </p>

              <button 
                onClick={() => setSelectedProject(project)}
                className="inline-flex items-center text-sm font-semibold text-red-400 hover:text-red-300 transition-colors w-fit group/btn"
              >
                View Details
                <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md select-text"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-950/50 to-black border border-red-500/20 flex items-center justify-center">
                      {selectedProject.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">
                      {selectedProject.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Overview</h4>
                    <p className="text-zinc-300 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Key Highlights</h4>
                    <ul className="space-y-2">
                      {selectedProject.points.map((point, idx) => (
                        <li key={idx} className="text-zinc-300 flex items-start">
                          <span className="text-red-500 mr-2 mt-1">&bull;</span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((t, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t border-zinc-900 bg-black/50">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
