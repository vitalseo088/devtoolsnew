import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 text-center border-b border-slate-200 bg-white">
      <div className="app-container">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111F35] tracking-tight">
          Dev27 Online Tools Suite
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A collection of reliable, browser-based online utilities covering developer tools, creator utilities, ecommerce calculators, productivity suites, construction estimators, and pet name generators. All processing runs privately in your browser without requiring a server.
        </p>
      </div>
    </section>
  );
};
