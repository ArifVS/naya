import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, signInWithPopup, db, doc, setDoc, getDoc } from '../firebase';
import { LogIn, Mail, ShieldCheck, Loader2, ArrowRight, Scale } from 'lucide-react';
import { cn } from '../lib/utils';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const Login: React.FC = () => {
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl border border-stone-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter mb-2">NyayMitra</h1>
          <p className="text-stone-500 font-medium">Your companion for justice in India</p>
        </div>

        <AnimatePresence mode="wait">
          {!isEmailLogin ? (
            <motion.div 
              key="social"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-white border-2 border-stone-100 text-stone-800 font-bold flex items-center justify-center gap-3 hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    Continue with Google
                  </>
                )}
              </button>

              <button
                onClick={() => setIsEmailLogin(true)}
                className="w-full py-4 rounded-2xl bg-stone-100 text-stone-600 font-bold flex items-center justify-center gap-3 hover:bg-stone-200 transition-all active:scale-95"
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </button>
            </motion.div>
          ) : (
            <motion.form 
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-800 text-stone-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-800 text-stone-800"
                />
              </div>

              {error && (
                <p className="text-rose-500 text-sm font-medium px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-stone-800 text-white font-bold flex items-center justify-center gap-2 hover:bg-stone-700 transition-all active:scale-95 shadow-lg"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1 pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm font-bold text-stone-500 hover:text-stone-800"
                >
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEmailLogin(false)}
                  className="text-sm font-bold text-stone-400 hover:text-stone-600"
                >
                  Back
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-8 border-t border-stone-50 flex items-center gap-3 text-stone-400">
          <ShieldCheck className="w-5 h-5" />
          <p className="text-xs leading-relaxed">
            Your data is secured by Firebase. By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
