import { GraduationCap, Download, FileCheck, CheckCircle, Award } from 'lucide-react';

const education = [
  {
    degree: 'M.S. in Artificial Intelligence',
    institution: 'Southwest Baptist University, Bolivar, MO',
    period: 'Jan 2026 – Present',
    description: 'Deep study of machine learning, cognitive systems, neural network designs, and AI agentic automation structures.'
  },
  {
    degree: 'M.S. in Information Technology Management',
    institution: 'Concordia University, St. Paul, MN',
    period: 'Jan 2023 – May 2024',
    description: 'Focus on IT governance, strategic management, enterprise technology alignment, and secure information systems.'
  }
];

const certifications = [
  {
    name: 'Anthropic — Claude 101',
    year: '2026'
  },
  {
    name: 'AI Fluency: Framework & Foundations',
    year: '2026'
  }
];

export default function Resume() {
  return (
    <section id="resume" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto bg-white">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          My Credentials
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">
          Frontend Developer & AI Agent Resume
        </h2>
        <div className="w-12 h-1 bg-gray-900 rounded-full mt-6" />
      </div>

      <div className="max-w-4xl mx-auto mb-16 items-start grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Education */}
        <div className="text-left space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
              <GraduationCap size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-gray-900">Education History</h3>
          </div>

          <div className="relative border-l border-gray-200 pl-6 ml-3 space-y-8">
            {education.map((edu, idx) => (
              <div key={idx} className="relative">
                {/* Timeline node */}
                <div className="absolute -left-[30px] top-2 w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-900" />
                
                <h4 className="font-display font-bold text-base md:text-lg text-gray-900">
                  {edu.degree}
                </h4>
                <div className="flex flex-col text-xs text-gray-600 font-medium mt-1">
                  <span>{edu.institution}</span>
                  <span className="font-mono text-gray-400 mt-1">{edu.period}</span>
                </div>
                <p className="text-gray-500 text-sm mt-3 font-sans leading-relaxed">
                  {edu.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="text-left space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
              <Award size={22} />
            </div>
            <h3 className="font-display font-bold text-xl text-gray-900">Certifications</h3>
          </div>

          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-gray-400" />
                  <span className="font-display font-semibold text-gray-900 text-sm">
                    {cert.name}
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                  {cert.year}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Downloader Section */}
      <div className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left max-w-xl">
          <h3 className="font-display font-bold text-xl md:text-2xl text-gray-900 mb-2">
            Frontend Developer & AI Agent Resume
          </h3>
          <p className="text-gray-600 text-sm font-sans leading-relaxed">
            This resume highlights my frontend development experience, AI agent orchestration project, Igris AI Commander capstone, technical skills, education, and AI learning certifications.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 shrink-0 justify-center md:justify-end">
          <a
            href="/resume/Ramesh_Badugu_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FileCheck size={16} />
            View Resume
          </a>

          <a
            href="/resume/Ramesh_Badugu_Resume.pdf"
            download="Ramesh_Badugu_Resume.pdf"
            className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Download Resume
          </a>
        </div>
      </div>
    </section>
  );
}
