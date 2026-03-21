import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, Mic, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface RightsFeedProps {
  onClose: () => void;
}

const rights = [
  { id: '1', title: 'Widow Land Rights', act: 'Hindu Succession Act 1956', section: 'Section 14', summary: 'A widow has full ownership of property inherited from her husband, not just a life interest.', category: 'Family' },
  { id: '2', title: 'Minimum Wage', act: 'Minimum Wages Act 1948', section: 'Section 12', summary: 'Every worker is entitled to the minimum wage set by the state government for their sector.', category: 'Labor' },
  { id: '3', title: 'Domestic Violence Protection', act: 'Protection of Women from DV Act 2005', section: 'Section 18', summary: 'Women can seek protection orders from courts against any form of domestic violence.', category: 'Safety' },
];

export const RightsFeed: React.FC<RightsFeedProps> = ({ onClose }) => {
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
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-stone-800" />
            My Rights
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {rights.map((right, idx) => (
            <motion.div 
              key={right.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                    {right.category}
                  </span>
                  <button className="text-stone-300 hover:text-stone-600 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{right.title}</h3>
                <p className="text-stone-600 mb-4 leading-relaxed">{right.summary}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-400">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium">{right.act}, {right.section}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-white shadow-md">
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
          <div>
            <h4 className="text-emerald-800 font-bold">Knowledge is Power</h4>
            <p className="text-emerald-600 text-sm">You've learned 3 rights this week.</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            3/7
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
