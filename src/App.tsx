import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ToolCard } from './components/ToolCard';
import { ToolPageWrapper } from './components/ToolPageWrapper';
import { Footer } from './components/Footer';
import { CATEGORIES, TOOLS } from './data/toolsList';
import { Search, ArrowRight } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle URL hash routing (e.g., #yaml-to-json, #category-developer)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) {
        setActiveToolId(null);
        return;
      }
      if (hash.startsWith('category-')) {
        const catId = hash.replace('category-', '');
        setSelectedCategory(catId);
        setActiveToolId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const found = TOOLS.find(t => t.id === hash);
      if (found) {
        setActiveToolId(found.id);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (catId: string) => {
    setSelectedCategory(catId);
    window.location.hash = `category-${catId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.location.hash = '';
    setActiveToolId(null);
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;
  const currentCategoryInfo = selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory) : null;

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
          if (cat === 'all') {
            window.location.hash = '';
          } else {
            window.location.hash = `category-${cat}`;
          }
          if (activeToolId) {
            setActiveToolId(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
          /* Homepage or Category Page */
          <>
            {/* Top Heading & Description: Category-specific when viewing a category, or general when on homepage */}
            <Hero
              category={currentCategoryInfo}
              toolCount={selectedCategory !== 'all' ? filteredTools.length : undefined}
              onGoHome={goHome}
            />

            {/* Main Tools Section */}
            <div className="app-container py-8">
              {/* Search and Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 p-5 bg-white card-dev27 shadow-md">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      currentCategoryInfo
                        ? `Search within ${currentCategoryInfo.name}...`
                        : "Search across all 69 online tools..."
                    }
                    className="w-full pl-12 pr-4 py-3 text-base border border-[#111F35] rounded-[4px] bg-white focus:bg-white focus:outline-none focus:border-[#8A244B] focus:ring-1 focus:ring-[#8A244B]"
                  />
                </div>

                <div className="text-base text-slate-600 font-semibold shrink-0">
                  Showing <strong className="text-slate-900 font-extrabold">{filteredTools.length}</strong> of {selectedCategory === 'all' ? TOOLS.length : TOOLS.filter(t => t.category === selectedCategory).length} utilities
                </div>
              </div>

              {/* Grouped Category Sections for Homepage */}
              {selectedCategory === 'all' && !searchQuery.trim() ? (
                <div className="space-y-12">
                  {CATEGORIES.map((cat) => {
                    const categoryTools = TOOLS.filter(t => t.category === cat.id);
                    return (
                      <section key={cat.id} className="space-y-4">
                        {/* Category Header with unique title & description and view all tools link */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-200 pb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#8A244B] bg-[#F2EFE7] px-2.5 py-0.5 rounded-[4px]">
                                {cat.name}
                              </span>
                              <span className="text-xs font-mono text-slate-500 font-semibold">
                                {categoryTools.length} tools
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#111F35] tracking-tight">
                              {cat.title}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
                              {cat.description}
                            </p>
                          </div>

                          {/* View all tools link to category page */}
                          <button
                            onClick={() => navigateToCategory(cat.id)}
                            className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 px-3.5 py-1.5 text-xs font-bold text-[#8A244B] hover:text-white bg-[#F2EFE7] hover:bg-[#8A244B] rounded-[4px] transition-colors cursor-pointer group"
                            title={`View all ${categoryTools.length} ${cat.name} tools`}
                          >
                            <span>View all {cat.name} tools</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>

                        {/* Top 6 tools preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {categoryTools.slice(0, 6).map((tool) => (
                            <ToolCard
                              key={tool.id}
                              tool={tool}
                              onSelect={selectTool}
                            />
                          ))}
                        </div>

                        {/* Bottom link to view all tools in category if more than 6 */}
                        {categoryTools.length > 6 && (
                          <div className="text-center pt-1">
                            <button
                              onClick={() => navigateToCategory(cat.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#8A244B] bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-[4px] shadow-sm transition-colors cursor-pointer group"
                            >
                              <span>View all {categoryTools.length} {cat.name} tools</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#8A244B] group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              ) : (
                /* Dedicated Category Page View or Flat Filtered Search Grid */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={selectTool}
                      />
                    ))}
                    {filteredTools.length === 0 && (
                      <div className="col-span-full p-8 text-center bg-white card-dev27 text-slate-500 text-sm">
                        No tools found matching "{searchQuery}". Try another keyword or clear search filter.
                      </div>
                    )}
                  </div>
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
