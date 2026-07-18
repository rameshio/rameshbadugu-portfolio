import { Calendar, Briefcase, ChevronRight } from 'lucide-react';

const experiences = [
  {
    role: 'Junior Frontend Developer',
    company: 'Vanguard — Malvern, PA',
    period: 'Aug 2024 – Sep 2025',
    description: 'Frontend contributions to a financial web application.',
    achievements: [
      'Built and updated user interface components on a financial web application using React.js, JavaScript, HTML, and CSS.',
      'Collaborated with developers in an Agile team on feature work and defect fixes.',
      'Managed code using Git and followed team development practices.'
    ],
    tech: ['React.js', 'JavaScript', 'HTML', 'CSS', 'Git', 'Agile']
  },
  {
    role: 'Software Development Intern',
    company: 'Infosys — Bengaluru, India',
    period: 'Mar 2022 – Dec 2022',
    description: 'Internship focused on frontend web development for a legacy application modernization effort.',
    achievements: [
      'Built and modified UI components using React.js, HTML, CSS, and JavaScript as part of a legacy application modernization effort.',
      'Identified and fixed UI and functionality defects during feature testing.',
      'Used Git for version control within an Agile team.'
    ],
    tech: ['React.js', 'JavaScript', 'HTML', 'CSS', 'Git', 'Agile']
  }
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-24 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          My Journey
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">
          Professional Experience
        </h2>
        <div className="w-12 h-1 bg-gray-900 rounded-full mt-6" />
      </div>

      {/* Timeline track container */}
      <div className="relative border-l border-gray-200 ml-4 md:ml-32 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-[9px] top-8 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-700 z-20 shadow-[0_0_0_5px_rgba(219,234,254,0.75)]" />
            
            {/* Date Tag Left Aligned (Desktop Only) */}
            <div className="hidden md:block absolute -left-36 top-7 w-28 text-right pr-6 font-display font-semibold text-sm text-gray-600 tracking-wide">
              {exp.period}
            </div>

            {/* Content Card container */}
            <div className="liquid-glass ml-8 md:ml-10 p-6 md:p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-200">
              
              {/* Date tag mobile view */}
              <div className="md:hidden flex items-center gap-1.5 font-display text-xs font-semibold text-gray-600 mb-3">
                <Calendar size={14} />
                {exp.period}
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-gray-900">
                    {exp.role}
                  </h3>
                  <span className="font-sans text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                    <Briefcase size={14} className="text-gray-400" />
                    {exp.company}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 font-sans">
                {exp.description}
              </p>

              {/* Achievement Bullet Points */}
              <ul className="space-y-3 font-sans">
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2 text-gray-600 text-xs md:text-sm">
                    <ChevronRight size={14} className="text-gray-400 mt-1 shrink-0" />
                    <span className="leading-relaxed">{ach}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
