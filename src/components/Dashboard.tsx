import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { auth, signOut } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Search, BookOpen, ShieldAlert, Scale, 
  User as UserIcon, LogOut, Bell, ChevronRight, Volume2, MessageSquare 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AskQuestion } from './AskQuestion';
import { MisinfoCheck } from './MisinfoCheck';
import { CaseTracker } from './CaseTracker';
import { RightsFeed } from './RightsFeed';
import { NyayMitraLive } from './NyayMitraLive';
import { NyayMitraChat } from './NyayMitraChat';
import { SearchLegal } from './SearchLegal';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isMisinfoModalOpen, setIsMisinfoModalOpen] = useState(false);
  const [isCasesModalOpen, setIsCasesModalOpen] = useState(false);
  const [isRightsModalOpen, setIsRightsModalOpen] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const features = [
    { id: 'ask', icon: Mic, label: 'Ask a Question', color: 'bg-stone-800', action: () => setIsAskModalOpen(true) },
    { id: 'live', icon: Volume2, label: 'Live Assist', color: 'bg-emerald-600', action: () => setIsLiveModalOpen(true) },
    { id: 'misinfo', icon: ShieldAlert, label: 'Check Rumor', color: 'bg-amber-600', action: () => setIsMisinfoModalOpen(true) },
    { id: 'cases', icon: Scale, label: 'My Cases', color: 'bg-stone-600', action: () => setIsCasesModalOpen(true) },
    { id: 'rights', icon: BookOpen, label: 'My Rights', color: 'bg-stone-500', action: () => setIsRightsModalOpen(true) },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <AnimatePresence>
        {isAskModalOpen && (
          <AskQuestion onClose={() => setIsAskModalOpen(false)} />
        )}
        {isMisinfoModalOpen && (
          <MisinfoCheck onClose={() => setIsMisinfoModalOpen(false)} />
        )}
        {isCasesModalOpen && (
          <CaseTracker onClose={() => setIsCasesModalOpen(false)} />
        )}
        {isRightsModalOpen && (
          <RightsFeed onClose={() => setIsRightsModalOpen(false)} />
        )}
        {isLiveModalOpen && (
          <NyayMitraLive onClose={() => setIsLiveModalOpen(false)} />
        )}
        {isChatOpen && (
          <NyayMitraChat onClose={() => setIsChatOpen(false)} />
        )}
        {isSearchModalOpen && (
          <SearchLegal onClose={() => setIsSearchModalOpen(false)} />
        )}
      </AnimatePresence>
      
      <header className="bg-white border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-md">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-stone-900 tracking-tighter">NyayMitra</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        <section className="mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-stone-200 overflow-hidden shadow-inner flex items-center justify-center border-2 border-white">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-8 h-8 text-stone-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Namaste, {user?.displayName || 'Mitra'}</h2>
              <p className="text-stone-500 font-medium">{userProfile?.persona?.replace('_', ' ') || 'Citizen'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.button
                key={feature.id}
                onClick={feature.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "flex flex-col items-center justify-center p-8 rounded-[2.5rem] text-white shadow-xl transition-all active:scale-95",
                  feature.color
                )}
              >
                <feature.icon className="w-8 h-8 mb-3" />
                <span className="font-bold text-sm">{feature.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Daily Insight</h3>
          <div className="bg-stone-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-3">Widow Land Rights</h4>
              <p className="text-stone-300 mb-6 leading-relaxed">Under Section 14 of the Hindu Succession Act, a widow has full ownership of property inherited from her husband.</p>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 py-3 px-6 rounded-2xl transition-colors font-bold text-sm">
                <Mic className="w-4 h-4" />
                <span>Listen in {language}</span>
              </button>
            </div>
            <BookOpen className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5 rotate-12" />
          </div>
        </section>
      </main>

      <nav className="bg-white border-t border-stone-200 p-4 sticky bottom-0 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button onClick={() => setIsAskModalOpen(true)} className="flex flex-col items-center gap-1 text-stone-800">
          <Mic className="w-8 h-8" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ask</span>
        </button>
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="flex flex-col items-center gap-1 text-stone-800">
          <MessageSquare className={cn("w-8 h-8 transition-all", isChatOpen ? "text-stone-800 scale-110" : "text-stone-400")} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
        </button>
        <button onClick={() => setIsSearchModalOpen(true)} className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-800 transition-colors">
          <Search className="w-8 h-8" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Search</span>
        </button>
        <button onClick={() => setIsRightsModalOpen(true)} className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-800 transition-colors">
          <BookOpen className="w-8 h-8" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Rights</span>
        </button>
      </nav>
    </div>
  );
};
