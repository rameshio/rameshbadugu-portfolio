import SplitText from './SplitText';
export default function About() {
  return (
    <section 
      id="about" 
      className="liquid-glass relative my-10 mx-6 md:mx-auto py-20 px-6 md:px-12 max-w-6xl rounded-[2rem]"
    >
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="glass-chip inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-600">My Background</span>
        </div>
        <SplitText text="About Me" className="font-display font-bold text-3xl md:text-4xl text-gray-900 tracking-tight" tag="h2" delay={30} />
        <div className="w-12 h-1 bg-gray-900 rounded-full mt-6" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 text-center md:text-left">
        <p className="text-gray-600 font-sans leading-relaxed text-lg">
          I am a developer pursuing an M.S. in Artificial Intelligence, with frontend web development experience using React.js, JavaScript, HTML, and CSS. My current focus is AI agents, agent orchestration, human-in-the-loop workflows, and practical AI systems that are safe and explainable.
        </p>
        
        <p className="text-gray-600 font-sans leading-relaxed text-lg">
          My main project, Igris AI Commander, is a Telegram-based AI agent orchestrator that manages Gmail summaries, job scouting, and approvals from a single control center. It combines Node.js, TypeScript, Telegram Bot API, Gmail API, OAuth, Playwright browser automation, local LLMs, and PM2.
        </p>

        <p className="text-gray-600 font-sans leading-relaxed text-lg">
          I am interested in building practical AI systems where agents, tools, APIs, and humans work together responsibly.
        </p>
      </div>
    </section>
  );
}
