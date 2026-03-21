import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

const languages = [
  { code: 'hi', name: 'हिन्दी', native: 'Hindi' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ta', name: 'தமிழ்', native: 'Tamil' },
  { code: 'te', name: 'తెలుగు', native: 'Telugu' },
  { code: 'bn', name: 'বাংলা', native: 'Bengali' },
  { code: 'mr', name: 'मराठी', native: 'Marathi' },
];

export const LanguageSelection: React.FC = () => {
  const { setLanguage, language: currentLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-3xl font-serif">⚖️</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">NyayMitra</h1>
          <p className="text-stone-500 text-center">Select your preferred language</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200",
                currentLanguage === lang.code 
                  ? "border-stone-800 bg-stone-50 shadow-md" 
                  : "border-stone-100 hover:border-stone-300 bg-white"
              )}
            >
              <span className="text-xl font-bold text-stone-900 mb-1">{lang.name}</span>
              <span className="text-xs text-stone-400 uppercase tracking-widest">{lang.native}</span>
              {currentLanguage === lang.code && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          disabled={!currentLanguage}
          onClick={() => {
            // Language is already set in the context
            window.location.reload(); // Simple way to trigger re-render of App
          }}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg",
            currentLanguage 
              ? "bg-stone-800 text-white hover:bg-stone-700" 
              : "bg-stone-200 text-stone-400 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </motion.div>
      
      <p className="mt-8 text-stone-400 text-sm italic">
        "Build for Kamla Devi first."
      </p>
    </div>
  );
};
