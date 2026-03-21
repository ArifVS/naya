import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Volume2, VolumeX, Loader2, MessageSquare, PhoneOff } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

interface NyayMitraLiveProps {
  onClose: () => void;
}

export const NyayMitraLive: React.FC<NyayMitraLiveProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    try {
      setIsThinking(true);
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const sessionPromise = GeminiService.getLiveSession({
        onopen: () => {
          setIsConnected(true);
          setIsThinking(false);
          startMic(sessionPromise);
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.interrupted) {
            stopPlayback();
            return;
          }

          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
            scheduleAudioChunk(base64Audio);
          }
          
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
            setTranscription(prev => prev + ' ' + message.serverContent.modelTurn.parts[0].text);
          }
        },
        onclose: () => {
          stopSession();
        },
        onerror: (err: any) => {
          console.error("Live API error:", err);
          stopSession();
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start live session:", err);
      setIsThinking(false);
    }
  };

  const startMic = async (sessionPromise: Promise<any>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current!.destination);
      processorRef.current = processor;
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const scheduleAudioChunk = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }
    
    const buffer = audioContextRef.current!.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    
    const currentTime = audioContextRef.current!.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
  };

  const stopPlayback = () => {
    nextStartTimeRef.current = audioContextRef.current?.currentTime || 0;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    
    setIsConnected(false);
    onClose();
  };

  useEffect(() => {
    startSession();
    return () => stopSession();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-stone-900 flex flex-col items-center justify-between p-8 text-white"
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-600")} />
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            {isConnected ? "Live Connection" : "Connecting..."}
          </span>
        </div>
        <button onClick={stopSession} className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-md">
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: isConnected ? [1, 1.2, 1] : 1,
              opacity: isConnected ? [0.5, 0.8, 0.5] : 0.2
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-stone-500 rounded-full blur-3xl"
          />
          <div className="relative w-48 h-48 rounded-full bg-stone-800 flex items-center justify-center border border-stone-700 shadow-2xl">
            {isThinking ? (
              <Loader2 className="w-16 h-16 text-stone-400 animate-spin" />
            ) : (
              <Mic className={cn("w-16 h-16 transition-all", isConnected ? "text-white" : "text-stone-600")} />
            )}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">NyayMitra Live</h2>
          <p className="text-stone-400 text-lg leading-relaxed italic">
            {transcription || "Speak now, I'm listening to your legal concerns..."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md flex items-center justify-center gap-8 mb-12">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all",
            isMuted ? "bg-red-500 text-white" : "bg-stone-800 text-stone-400 hover:bg-stone-700"
          )}
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={stopSession}
          className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all active:scale-95"
        >
          <PhoneOff className="w-8 h-8" />
        </button>

        <button className="w-16 h-16 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center hover:bg-stone-700 transition-all">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
};
