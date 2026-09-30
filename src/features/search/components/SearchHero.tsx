import { Sparkles } from 'lucide-react';

export function SearchHero() {
  return (
    <section className="text-center pt-6 pb-8 mb-6">
      <div className="inline-flex items-center gap-2 px-[0.85rem] py-[0.35rem] rounded-full text-[0.775rem] font-semibold bg-primary-light text-primary border border-line mb-4">
        <Sparkles size={14} />
        <span>Real-time GitHub Developer Analytics</span>
      </div>
      <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] mb-[0.65rem] text-fg">
        Explore the <span className="text-gradient">Open Source</span> Universe
      </h1>
      <p className="text-[clamp(0.95rem,2vw,1.125rem)] text-fg-2 max-w-[580px] mx-auto">
        Search millions of repositories, explore developer profiles, and track recent issues.
      </p>
    </section>
  );
}
