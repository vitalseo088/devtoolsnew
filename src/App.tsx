import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ToolCard } from './components/ToolCard';
import { ToolPageWrapper } from './components/ToolPageWrapper';
import { Footer } from './components/Footer';
import { CATEGORIES, TOOLS } from './data/toolsList';
import { ToolCategory, ToolDefinition } from './types';
import { Search } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle URL hash routing (e.g., #yaml-to-json, #cron-generator)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const found = TOOLS.find(t => t.id === hash);
        if (found) {
          setActiveToolId(found.id);
        } else {
          setActiveToolId(null);
        }
      } else {
        setActiveToolId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectTool = (toolId: string) => {
    window.location.hash = toolId;
    setActiveToolId(toolId);
  };

  const goHome = () => {
    window.location.hash = '';
    setActiveToolId(null);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  // Filter tools for directory view
  const filteredTools = TOOLS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111F35]">
      {/* Top Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (activeToolId) {
            window.location.hash = '';
            setActiveToolId(null);
          }
        }}
        onGoHome={goHome}
      />

      <main className="flex-1">
        {activeTool ? (
          /* Individual Tool Page */
          <div className="app-container">
            <ToolPageWrapper
              tool={activeTool}
              onBack={goHome}
            />
          </div>
        ) : (
          /* Homepage with Simple Hero and Category-Wise Tool Cards */
          <>
            {/* Simple Hero Section: Strictly heading and description only */}
            <Hero />

            {/* Category Wise Tools Cards Section */}
            <div className="app-container py-8">
              {/* Search and Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-4 bg-white card-dev27">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across all 69 online tools..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-[4px] bg-slate-50 focus:outline-none focus:border-[#8A244B]"
                  />
                </div>

                <div className="text-sm text-slate-600 font-medium shrink-0">
                  Showing <strong className="text-slate-900 font-bold">{filteredTools.length}</strong> of {TOOLS.length} utilities
                </div>
              </div>

              {/* Grouped Category Sections */}
              {selectedCategory === 'all' && !searchQuery.trim() ? (
                <div className="space-y-10">
                  {CATEGORIES.map((cat) => {
                    const categoryTools = TOOLS.filter(t => t.category === cat.id);
                    return (
                      <section key={cat.id} className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                          <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#111F35]">
                              {cat.name}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                          <span className="text-xs sm:text-sm font-mono font-bold text-[#8A244B] bg-[#F2EFE7] px-2.5 py-1 rounded-[4px]">
                            {categoryTools.length} tools
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {categoryTools.map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onSelect={selectTool}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* Filtered Flat Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onSelect={selectTool}
                    />
                  ))}
                  {filteredTools.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-white card-dev27 text-slate-500 text-xs">
                      No tools found matching "{searchQuery}". Try another keyword or clear search filter.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
