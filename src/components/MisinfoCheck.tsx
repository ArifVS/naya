import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, Loader2, CheckCircle2, AlertCircle, HelpCircle, Share2 } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

interface MisinfoCheckProps {
  onClose: () => void;
}

export const MisinfoCheck: React.FC<MisinfoCheckProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();
  const [claim, setClaim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCheck = async () => {
    if (!claim.trim() || !user) return;
    setIsLoading(true);
    try {
      const res = await api.checkMisinfo({
        claim,
        language: language || 'hi',
        state: userProfile?.state || 'RJ'
      });
      const checkData = res.data;
      setResult(checkData);

      // Save to Firestore
      const queryId = uuidv4();
      const path = `queries/${queryId}`;
      try {
        await setDoc(doc(db, 'queries', queryId), {
          userId: user.uid,
          inputText: claim,
          answerText: checkData.explanation,
          citation: checkData.citation,
          language: language || 'hi',
          type: 'misinfo',
          verdict: checkData.verdict,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, label: 'True' };
      case 'FALSE': return { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle, label: 'False' };
      case 'DEPENDS_ON_STATE': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: HelpCircle, label: 'Depends on State' };
      default: return { color: 'text-stone-600', bg: 'bg-stone-50', icon: HelpCircle, label: 'Unknown' };
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
        className="bg-white rounded-t-[3rem] p-8 max-w-lg mx-auto w-full min-h-[50vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            Check a Rumor
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <AnimatePresence mode="wait">
            {!result && !isLoading && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p className="text-stone-500">"I was told that..."</p>
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g. A widow has no rights to land..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg text-stone-800 placeholder-stone-400 min-h-[100px] resize-none"
                  />
                </div>
              </motion.div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-500 font-medium">Verifying legal claim...</p>
              </div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {(() => {
                  const styles = getVerdictStyles(result.verdict);
                  return (
                    <div className={cn("p-8 rounded-[2.5rem] text-center", styles.bg)}>
                      <styles.icon className={cn("w-16 h-16 mx-auto mb-4", styles.color)} />
                      <h3 className={cn("text-3xl font-black uppercase tracking-tighter mb-2", styles.color)}>
                        {styles.label}
                      </h3>
                      <p className="text-stone-700 font-medium leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  );
                })()}

                {result.citation && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-stone-400" />
                    <span className="text-sm font-bold text-stone-600">{result.citation}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Fact
                  </button>
                  <button onClick={() => setResult(null)} className="flex-1 py-4 rounded-2xl bg-stone-100 text-stone-600 font-bold">
                    Check Another
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!result && !isLoading && (
          <button
            onClick={handleCheck}
            disabled={!claim.trim()}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg",
              claim.trim() ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            Verify Claim
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};
