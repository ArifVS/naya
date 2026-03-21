import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2, BookOpen, ChevronRight, Scale } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface SearchLegalProps {
  onClose: () => void;
}

export const SearchLegal: React.FC<SearchLegalProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.ask({
        input: { type: 'text', text: `Search for Indian legal acts or sections related to: ${query}` },
        context: { persona: 'legal_researcher', state: 'IN' },
        options: { search: true }
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col justify-end"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-stone-50 rounded-t-[3rem] p-8 max-w-lg mx-auto w-full min-h-[80vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-stone-800" />
              Search Law
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
              Powered by Google Search Grounding
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search Acts, Sections, or Topics..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-stone-800 text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-stone-800 animate-spin mb-4" />
                <p className="text-stone-500 font-medium italic">Searching Indian Law Database...</p>
              </motion.div>
            )}

            {results && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="p-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-stone-400">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Legal Context</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed mb-6">
                    {results.answer.text}
                  </p>
                  
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-stone-400" />
                      <span className="text-sm font-bold text-stone-600">{results.answer.citation.act}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300" />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <h4 className="text-amber-800 font-bold mb-2">Key Insight</h4>
                  <p className="text-amber-900 text-sm leading-relaxed">
                    {results.answer.action_step}
                  </p>
                </div>
              </motion.div>
            )}

            {!results && !isLoading && (
              <div className="grid grid-cols-1 gap-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Popular Searches</p>
                {['Consumer Rights', 'Property Transfer', 'RTI Act', 'Labor Laws'].map(s => (
                  <button 
                    key={s}
                    onClick={() => { setQuery(s); handleSearch(); }}
                    className="p-4 bg-white rounded-2xl border border-stone-100 text-left flex items-center justify-between group hover:border-stone-300 transition-all"
                  >
                    <span className="font-medium text-stone-700">{s}</span>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-800 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
