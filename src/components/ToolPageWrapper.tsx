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
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-bold text-[#8A244B] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Dev27 Tools</span>
          <span className="text-slate-400">/</span>
          <span className="capitalize text-slate-600">{tool.category}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900">{tool.name}</span>
        </button>

        <button
          onClick={copyToolLink}
          className="px-3 py-1.5 text-xs sm:text-sm bg-[#F2EFE7] hover:bg-slate-200 text-[#111F35] rounded-[4px] flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4 text-[#8A244B]" />}
          {copiedLink ? 'Link Copied!' : 'Share Tool'}
        </button>
      </div>

      {/* Tool Header Box */}
      <div className="p-5 sm:p-6 bg-white card-dev27 space-y-2.5">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <span className="px-2.5 py-0.5 rounded-[4px] bg-[#8A244B] text-white font-bold uppercase text-[11px] tracking-wider">
            {tool.category}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-mono text-xs sm:text-sm flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-700" />
            100% Client-Side Private
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111F35] tracking-tight">
          {tool.name}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {tool.shortDesc}
        </p>
      </div>

      {/* Interactive Tool Implementation */}
      <div className="space-y-4">
        <Component />
      </div>

      {/* Pre-rendered Technical Documentation & SEO Content */}
      <div className="p-4 sm:p-5 bg-white card-dev27 space-y-3 text-xs text-slate-700">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
          <Code className="w-4 h-4 text-[#8A244B]" />
          <span>Documentation, Formulas &amp; Processing Details</span>
        </div>

        <div className="space-y-2 leading-relaxed">
          <p>
            The <strong>{tool.name}</strong> operates completely within your local browser runtime. No uploaded files, input strings, or calculation values are ever transmitted to external servers.
          </p>
          <div className="bg-[#F2EFE7] p-3 rounded-[4px] font-mono text-[11px] text-slate-800">
            <code>
              {`// Dev27 Utility Specification\nModule: ${tool.id}\nCategory: ${tool.category}\nRuntime: Client-side DOM / WebAssembly / Web Audio API\nData Privacy: Zero telemetry, pure browser processing`}
            </code>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="font-semibold text-slate-600 mr-1">Tags:</span>
            {tool.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
