import React, { useEffect } from 'react';
import { ArrowLeft, Share2, Check, Code, Info, ShieldCheck } from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolPageWrapperProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export const ToolPageWrapper: React.FC<ToolPageWrapperProps> = ({ tool, onBack }) => {
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);

  // Dynamic SEO and Meta Tags synchronization
  useEffect(() => {
    document.title = `${tool.seoTitle} | Dev27`;

    const setMeta = (name: string, content: string, isProperty = false) => {
      let el = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', tool.seoDescription);
    setMeta('og:title', `${tool.seoTitle} | Dev27`, true);
    setMeta('og:description', tool.seoDescription, true);
    setMeta('twitter:title', `${tool.seoTitle} | Dev27`);
    setMeta('twitter:description', tool.seoDescription);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = 'Dev27 - Online Developer & Productivity Tools Suite';
    };
  }, [tool]);

  const copyToolLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${tool.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const Component = tool.component;

  return (
    <div className="py-6 space-y-6">
      {/* Breadcrumb Navigation & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-base">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 font-bold text-[#8A244B] hover:underline cursor-pointer text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>All Dev27 Tools</span>
          <span className="text-slate-400">/</span>
          <span className="capitalize text-slate-600">{tool.category}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900">{tool.name}</span>
        </button>

        <button
          onClick={copyToolLink}
          className="px-3.5 py-2 text-sm bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-2 font-bold transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4 text-[#8A244B]" />}
          <span>{copiedLink ? 'Link Copied!' : 'Share Tool'}</span>
        </button>
      </div>

      {/* Tool Header Box */}
      <div className="p-6 bg-white card-dev27 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 rounded-[4px] bg-[#8A244B] text-white font-extrabold uppercase text-xs tracking-wider">
            {tool.category}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111F35] tracking-tight">
          {tool.name}
        </h2>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          {tool.shortDesc}
        </p>
      </div>

      {/* Interactive Tool Implementation */}
      <div className="space-y-4">
        <Component />
      </div>

      {/* Pre-rendered Technical Documentation & SEO Content */}
      <div className="p-6 sm:p-8 bg-white card-dev27 space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-extrabold text-lg sm:text-xl text-slate-900">
          <Code className="w-5 h-5 text-[#8A244B]" />
          <span>Complete Guide, Formulas &amp; Use Cases: {tool.name}</span>
        </div>

        {/* Private Execution Notice included in article */}
        <div className="p-4 bg-[#F2EFE7] rounded-[4px] border border-[#E2E8F0] text-xs sm:text-sm font-semibold text-[#111F35] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-700 shrink-0" />
          <span>Private &amp; In-Browser Execution: All processing runs entirely inside your local web browser session with zero server telemetry or data logging.</span>
        </div>

        {/* Semantic SEO Article Content */}
        <div className="space-y-4 text-slate-700 text-sm sm:text-base">
          {tool.seoArticle ? (
            tool.seoArticle.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))
          ) : (
            <>
              <p>
                Welcome to the comprehensive guide for the <strong>{tool.name}</strong>, a precision online utility engineered for high-performance browser workflows. Whether you are scaling an enterprise software pipeline, designing digital media assets, or estimating project resources, having access to deterministic, client-side tools ensures maximum speed and uncompromising data privacy. This utility is built from the ground up to operate instantaneously without external network requests or backend server roundtrips.
              </p>
              <p>
                <strong>Understanding How to Use This Tool:</strong> To get started, simply input your primary parameters, raw datasets, or configuration values into the interactive input form on the left. The engine processes your inputs in real time, rendering instant results, formatted outputs, and itemized calculations on the right dashboard. You can copy results instantly to your clipboard or export detailed reports as CSV files or plain text documents for offline record-keeping.
              </p>
              <p>
                <strong>Mathematical Formulas &amp; Processing Logic:</strong> The underlying computation adheres to strict mathematical models and industry standards. By eliminating floating-point drift and utilizing optimized browser memory buffers, the system guarantees 100% precision for every calculation. Intermediate variables are dynamically evaluated so that adjusting any single input immediately cascades through the entire model to update your final metrics and margins.
              </p>
              <p>
                <strong>Practical Use Cases &amp; Professional Applications:</strong> Professionals across software engineering, content creation, ecommerce management, and construction estimation rely on this utility daily. Common use cases include rapid prototyping, debugging complex data structures, auditing financial profit margins, verifying building code compliance, and generating standardized documentation ready for production publishing.
              </p>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          <span className="font-bold text-slate-700 text-xs mr-1">Related Tags:</span>
          {tool.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-mono text-xs font-semibold">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
