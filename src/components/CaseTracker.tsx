import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, X, Plus, Search, Calendar, MapPin, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, collection, query, where, onSnapshot, addDoc, serverTimestamp } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';

interface CaseTrackerProps {
  onClose: () => void;
}

export const CaseTracker: React.FC<CaseTrackerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [cnrNumber, setCnrNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'cases'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCases(casesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cases');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCase = async () => {
    if (!cnrNumber.trim() || !user) return;
    setIsLoading(true);
    
    try {
      await addDoc(collection(db, 'cases'), {
        userId: user.uid,
        cnrNumber: cnrNumber,
        title: 'Case: ' + cnrNumber.substring(0, 8),
        courtName: 'District Court',
        status: 'PENDING',
        nextHearingDate: 'TBD',
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setCnrNumber('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cases');
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
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-stone-800" />
            My Cases
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
          {cases.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-3xl shadow-sm border border-stone-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{c.title}</h3>
                  <p className="text-xs font-mono text-stone-400 uppercase tracking-tighter">{c.cnrNumber}</p>
                </div>
                <div className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                  {c.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-stone-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{c.nextHearingDate}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium truncate">{c.courtName}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-stone-50 flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-stone-50 text-stone-600 text-xs font-bold hover:bg-stone-100 transition-colors">
                  View Orders
                </button>
                <button className="flex-1 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-700 transition-colors">
                  Hearing Kit
                </button>
              </div>
            </motion.div>
          ))}

          {cases.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <Scale className="w-10 h-10 text-stone-300" />
              </div>
              <p className="text-stone-500 font-medium">No cases tracked yet.</p>
              <p className="text-stone-400 text-sm">Add your CNR number to start tracking.</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isAdding ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-100 mb-4"
            >
              <h4 className="font-bold text-stone-900 mb-4">Register New Case</h4>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input 
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value)}
                  placeholder="Enter 16-digit CNR Number"
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-800 text-lg font-mono"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 rounded-2xl bg-stone-100 text-stone-500 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCase}
                  disabled={isLoading || cnrNumber.length !== 16}
                  className="flex-1 py-4 rounded-2xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
                </button>
              </div>
            </motion.div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-5 rounded-[2rem] bg-stone-800 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-stone-700 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
              Add New Case
            </button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
