import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc } from '../firebase';
import { cn } from '../lib/utils';
import { 
  User, Briefcase, GraduationCap, Heart, Home, 
  ChevronRight, Mic, Check, Bell, Share2, Loader2, Scale
} from 'lucide-react';
import { api } from '../services/api';

const personas = [
  { id: 'farmer_widow', icon: Home, label: 'Farmer / Widow', description: 'Land and inheritance' },
  { id: 'daily_labourer', icon: Briefcase, label: 'Worker', description: 'Wages and labor rights' },
  { id: 'domestic_worker', icon: User, label: 'Domestic Help', description: 'Fair play and safety' },
  { id: 'student', icon: GraduationCap, label: 'Student', description: 'Education and rights' },
  { id: 'pensioner', icon: Heart, label: 'Elderly', description: 'Pension and family' },
  { id: 'professional', icon: Briefcase, label: 'Professional', description: 'Workplace and contracts' },
];

const problems: Record<string, string[]> = {
  farmer_widow: ['Land inheritance', 'Property dispute', 'Government schemes', 'Water rights'],
  daily_labourer: ['Unpaid wages', 'Workplace injury', 'Minimum wage', 'Contract breach'],
  domestic_worker: ['Harassment', 'Termination', 'Working hours', 'ID proof'],
  student: ['Admission issues', 'Scholarships', 'Exam fairness', 'Cyber safety'],
  pensioner: ['Pension delay', 'Medical claims', 'Property safety', 'Will drafting'],
  professional: ['POSH / Harassment', 'Wrongful termination', 'Contract review', 'IP rights'],
};

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { language } = useLanguage();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstWin, setFirstWin] = useState<any>(null);

  const handlePersonaSelect = (id: string) => {
    setSelectedPersona(id);
    setStep(2);
  };

  const handleProblemSelect = async (problem: string) => {
    setSelectedProblem(problem);
    setStep(3);
    setIsLoading(true);
    try {
      const res = await api.ask({
        input: { type: 'text', text: `I am a ${selectedPersona} and I have a problem with ${problem}. What are my rights?` },
        context: { persona: selectedPersona!, state: 'RJ' }
      });
      setFirstWin(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeOnboarding = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        onboardingCompleted: true,
        persona: selectedPersona,
        state: 'RJ',
        language: language
      }, { merge: true });
      await refreshProfile();
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-stone-900 mb-2 text-center">Who are you?</h2>
            <p className="text-stone-500 text-center mb-8">Select the profile that fits you best</p>
            <div className="grid grid-cols-2 gap-4">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePersonaSelect(p.id)}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mb-3">
                    <p.icon className="w-6 h-6 text-stone-600" />
                  </div>
                  <span className="font-bold text-stone-800 text-sm">{p.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-stone-900 mb-2 text-center">What is your problem?</h2>
            <p className="text-stone-500 text-center mb-8">Select your biggest concern today</p>
            <div className="space-y-3">
              {problems[selectedPersona!].map((prob) => (
                <button
                  key={prob}
                  onClick={() => handleProblemSelect(prob)}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
                >
                  <span className="font-bold text-stone-800">{prob}</span>
                  <ChevronRight className="w-5 h-5 text-stone-300" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl overflow-hidden relative"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-16 h-16 text-stone-800 animate-spin mb-6" />
                <p className="text-stone-500 font-medium text-center">NyayMitra is preparing your legal win...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900">Your First Win</h2>
                </div>

                <div className="p-6 bg-stone-50 rounded-3xl border-l-4 border-stone-800">
                  <p className="text-lg text-stone-800 leading-relaxed mb-4">
                    {firstWin?.answer.text}
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <Scale className="w-5 h-5 text-stone-400" />
                    <span className="text-sm font-medium text-stone-600">
                      {firstWin?.answer.citation.act}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <h4 className="text-amber-800 font-bold mb-1">Action Step</h4>
                  <p className="text-amber-900">{firstWin?.answer.action_step}</p>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full py-4 rounded-2xl bg-stone-800 text-white font-bold text-lg shadow-lg hover:bg-stone-700 transition-all"
                >
                  Continue
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Stay Informed</h2>
            <p className="text-stone-500 mb-8">We'll send you daily rights and case updates. No spam, just justice.</p>
            <div className="space-y-4">
              <button
                onClick={() => setStep(5)}
                className="w-full py-4 rounded-2xl bg-stone-800 text-white font-bold text-lg shadow-lg hover:bg-stone-700 transition-all"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setStep(5)}
                className="w-full py-4 rounded-2xl bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Share2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Help Others</h2>
            <p className="text-stone-500 mb-8">Share NyayMitra with your friends and family who need legal help.</p>
            <div className="space-y-4">
              <button
                onClick={finalizeOnboarding}
                className="w-full py-4 rounded-2xl bg-stone-800 text-white font-bold text-lg shadow-lg hover:bg-stone-700 transition-all"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={finalizeOnboarding}
                className="w-full py-4 rounded-2xl bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
