import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, X, Loader2, ChevronRight, Scale, ShieldAlert, Brain, Globe, Volume2, StopCircle } from 'lucide-react';
import { api } from '../services/api';
import { GeminiService } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db, doc, setDoc } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

interface AskQuestionProps {
  onClose: () => void;
}

export const AskQuestion: React.FC<AskQuestionProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleAsk = async () => {
    if (!inputText.trim() || !user) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.ask({
        input: { type: 'text', text: inputText },
        context: { persona: userProfile?.persona || 'general', state: userProfile?.state || 'RJ' },
        options: { thinking: isThinking, search: isSearchEnabled }
      });
      const queryData = res.data;
      setResponse(queryData);

      // Save to Firestore
      const queryId = uuidv4();
      const path = `queries/${queryId}`;
      try {
        await setDoc(doc(db, 'queries', queryId), {
          userId: user.uid,
          inputText: inputText,
          answerText: queryData.answer.text,
          citation: queryData.answer.citation.act,
          actionStep: queryData.answer.action_step,
          language: language || 'hi',
          type: 'ask',
          options: { thinking: isThinking, search: isSearchEnabled },
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsLoading(true);
          try {
            const transcription = await GeminiService.transcribeAudio(base64);
            setInputText(transcription || '');
          } catch (err) {
            console.error("Transcription error:", err);
          } finally {
            setIsLoading(false);
          }
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const base64 = await GeminiService.generateSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.play();
      }
    } catch (err) {
      console.error("TTS error:", err);
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
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-t-[3rem] p-8 max-w-lg mx-auto w-full min-h-[60vh] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-stone-800" />
            Ask NyayMitra
          </h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-6">
          <AnimatePresence mode="wait">
            {!response && !isLoading && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-100">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your legal question here..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg text-stone-800 placeholder-stone-400 min-h-[120px] resize-none"
                  />
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-200/50">
                    <button 
                      onClick={() => setIsThinking(!isThinking)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                        isThinking ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-500"
                      )}
                    >
                      <Brain className="w-4 h-4" />
                      Thinking Mode
                    </button>
                    <button 
                      onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                        isSearchEnabled ? "bg-blue-600 text-white" : "bg-stone-200 text-stone-500"
                      )}
                    >
                      <Globe className="w-4 h-4" />
                      Google Search
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest w-full mb-1">Suggestions</span>
                  {['Land dispute', 'Wages not paid', 'Domestic violence'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setInputText(s)}
                      className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm hover:bg-stone-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-stone-800 animate-spin" />
                  <Mic className="absolute inset-0 m-auto w-6 h-6 text-stone-800" />
                </div>
                <p className="mt-6 text-stone-500 font-medium animate-pulse text-center">
                  NyayMitra is thinking...<br/>
                  <span className="text-xs uppercase tracking-widest opacity-50">Searching Indian Law</span>
                </p>
              </motion.div>
            )}

            {response && (
              <motion.div 
                key="response"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-stone-50 rounded-3xl border-l-4 border-stone-800 relative group">
                  <button 
                    onClick={() => playTTS(response.answer.text)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Volume2 className="w-5 h-5 text-stone-600" />
                  </button>
                  <p className="text-lg text-stone-800 leading-relaxed mb-4">
                    {response.answer.text}
                  </p>
                  
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm">
                    <Scale className="w-5 h-5 text-stone-400" />
                    <span className="text-sm font-medium text-stone-600">
                      {response.answer.citation.act}, {response.answer.citation.section}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <h4 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
                    <ChevronRight className="w-5 h-5" />
                    Next Step
                  </h4>
                  <p className="text-amber-900">
                    {response.answer.action_step}
                  </p>
                </div>

                <p className="text-[10px] text-stone-400 italic text-center px-4">
                  {response.disclaimer}
                </p>

                <button 
                  onClick={() => {
                    setResponse(null);
                    setInputText('');
                  }}
                  className="w-full py-4 rounded-2xl bg-stone-100 text-stone-600 font-bold hover:bg-stone-200 transition-colors"
                >
                  Ask another question
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!response && !isLoading && (
          <div className="flex gap-4">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                isRecording ? "bg-red-500 text-white animate-pulse" : "bg-stone-100 text-stone-800 hover:bg-stone-200"
              )}
            >
              {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              {isRecording ? "Stop" : "Voice"}
            </button>
            <button 
              onClick={handleAsk}
              disabled={!inputText.trim()}
              className={cn(
                "flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                inputText.trim() 
                  ? "bg-stone-800 text-white hover:bg-stone-700" 
                  : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
              )}
            >
              <Send className="w-6 h-6" />
              Send
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
