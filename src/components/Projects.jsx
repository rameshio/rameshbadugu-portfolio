import SplitText from './SplitText';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, BrainCircuit, ChevronRight, X } from 'lucide-react';

const projectsData = [
  {
    id: 2,
    title: 'Frontend Portfolio Redesign',
    icon: <Terminal size={24} className="text-gray-700" />,
    description: 'Created a personal portfolio website to present my AI agent work, resume, frontend experience, contact information, and learning journey.',
    points: [
      'Designed a responsive, minimalist interface with clear content hierarchy and accessible interactions.',
      'Connected GitHub, Vercel, and custom domain workflow.',
      'Added a validated backend contact API, health checks, rate limiting, and server-side EmailJS delivery.',
      'Used AI coding tools to improve layout, debug UI issues, and keep content aligned with my resume.'
    ],
    tech: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Serverless API', 'EmailJS']
  },
  {
    id: 3,
    title: 'AI Tools & Automation Learning',
    icon: <BrainCircuit size={24} className="text-gray-700" />,
    description: 'Hands-on learning focused on AI agents, orchestration, prompt engineering, tool use, and automation workflows.',
    points: [
      'Practiced using Claude, ChatGPT, Gemini, local LLMs, and AI coding assistants.',
      'Explored task decomposition, tool use, and human approval workflows.',
      'Learned how AI agents can support email summaries, job tracking, browser tasks, and productivity workflows.'
    ],
    tech: ['Claude', 'ChatGPT', 'Gemini', 'Local LLMs', 'Prompt Engineering', 'AI Agents']
  }
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!selectedProject) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedProject(null);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="py-24 relative z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="glass-chip inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-600">Current Focus</span>
          </div>
          <SplitText text="AI Projects & Learning Journey" className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight mb-4" tag="h2" delay={30} />
          <p className="text-gray-500 max-w-2xl mx-auto font-sans">
            A transparent look into my ongoing exploration of AI tools, modern web development, and workflow automation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <article
              key={project.id}
              className="liquid-glass rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200 flex flex-col h-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                {project.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-display">
                {project.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow font-sans">
                {project.description}
              </p>

              <button 
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setSelectedProject(project);
                }}
                className="inline-flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors w-fit group/btn"
              >
                View Details
                <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </article>
          ))}
        </div>
      </div>

      {selectedProject && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    {selectedProject.icon}
                  </div>
                  <h3 id="project-dialog-title" className="text-2xl font-bold text-gray-900 font-display">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Overview</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key Highlights</h4>
                  <ul className="space-y-2">
                    {selectedProject.points.map((point, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start">
                        <span className="text-gray-400 mr-2 mt-0.5">&bull;</span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((t, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full py-2.5 rounded-lg font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
