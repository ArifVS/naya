import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Loader2, User, Scale } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const NyayMitraChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', text: 'Namaste! I am NyayMitra. How can I help you with your legal concerns today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const prompt = `
        You are NyayMitra, a friendly and expert Indian legal assistant. 
        User Persona: ${userProfile?.persona || 'general citizen'}
        User State: ${userProfile?.state || 'India'}
        
        GOAL: Have a natural, helpful conversation. Explain legal concepts in simple terms (Hinglish/English).
        
        CONSTRAINTS:
        1. Be empathetic but professional.
        2. If you don't know something, say so and suggest consulting a lawyer.
        3. Keep responses concise but informative.
        
        Previous conversation context:
        ${messages.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n')}
      `;

      const response = await GeminiService.generateLegalAnswer(prompt, inputText, { thinking: true });
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: response.text || 'I apologize, I am having trouble processing that.' };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-md h-[70vh] bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 flex flex-col overflow-hidden"
    >
      <div className="p-6 bg-stone-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold">NyayMitra Chat</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">AI Legal Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              m.role === 'user' ? "bg-stone-800 text-white rounded-tr-none" : "bg-white text-stone-800 border border-stone-100 rounded-tl-none"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
              <span className="text-xs text-stone-400 font-medium italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
        <input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 bg-stone-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-stone-800 text-stone-800"
        />
        <button 
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className="w-12 h-12 rounded-2xl bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
