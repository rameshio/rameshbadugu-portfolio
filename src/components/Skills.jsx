import SplitText from './SplitText';
import { Code2, Cpu, Eye, Terminal } from 'lucide-react';

const skillCategories = [
  {
    title: 'Frontend',
    icon: <Cpu className="text-gray-700" size={24} />,
    description: 'Building modern and responsive interfaces.',
    skills: ['React.js', 'JavaScript', 'HTML', 'CSS']
  },
  {
    title: 'AI & Agents',
    icon: <Eye className="text-gray-700" size={24} />,
    description: 'Orchestrating practical AI systems.',
    skills: ['AI agents', 'agent orchestration', 'human-in-the-loop workflows', 'prompt engineering', 'tool use', 'task decomposition', 'local LLMs', 'Ollama', 'gemma3']
  },
  {
    title: 'Backend & Automation',
    icon: <Terminal className="text-gray-700" size={24} />,
    description: 'Connecting tools and APIs securely.',
    skills: ['Node.js', 'TypeScript', 'Telegram Bot API', 'Gmail API', 'OAuth 2.0', 'Playwright', 'browser automation']
  },
  {
    title: 'Tools & Practices',
    icon: <Code2 className="text-gray-700" size={24} />,
    description: 'Development, deployment, and process.',
    skills: ['Git', 'GitHub', 'Google Antigravity', 'PM2', 'VS Code', 'Agile', 'Scrum']
  }
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Core Competencies
        </span>
        <SplitText text="My Skills" className="font-display font-bold text-3xl md:text-4xl text-gray-900 tracking-tight" tag="h2" delay={30} />
        <div className="w-12 h-1 bg-gray-900 rounded-full mt-6" />
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {skillCategories.map((category, idx) => (
          <div
            key={idx}
            className="liquid-glass p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-gray-900">
                    {category.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Skills Tags Grid */}
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="glass-chip px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
