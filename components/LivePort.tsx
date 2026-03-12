
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Activity, Radio, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import AudioVisualizer from './AudioVisualizer';

interface Props {
  themeColor: string;
}

export const LivePort: React.FC<Props> = ({ themeColor }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  
  const audioContextInput = useRef<AudioContext | null>(null);
  const audioContextOutput = useRef<AudioContext | null>(null);
  // Track the session promise to handle race conditions between connection and streaming
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTime = useRef(0);
  const sources = useRef(new Set<AudioBufferSourceNode>());

  // manual decode implementation following @google/genai guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // manual encode implementation following @google/genai guidelines to prevent stack overflow
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // manual PCM audio decoding following @google/genai guidelines
  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const startSession = async () => {
    setIsConnecting(true);
    // Initialize GoogleGenAI with named apiKey parameter as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextInput.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextOutput.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setCurrentStream(stream);
      
      // Use sessionPromise to ensure data is sent only after connection is established
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextInput.current!.createMediaStreamSource(stream);
            const processor = audioContextInput.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                int16[i] = input[i] * 32768;
              }
              const b64 = encode(new Uint8Array(int16.buffer));
              // Critical: wait for sessionPromise before sending realtime input
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: { data: b64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(processor);
            processor.connect(audioContextInput.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const b64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (b64 && audioContextOutput.current) {
              nextStartTime.current = Math.max(nextStartTime.current, audioContextOutput.current.currentTime);
              const bytes = decode(b64);
              const buffer = await decodeAudioData(bytes, audioContextOutput.current, 24000, 1);
              const source = audioContextOutput.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextOutput.current.destination);
              source.addEventListener('ended', () => {
                sources.current.delete(source);
              });
              source.start(nextStartTime.current);
              nextStartTime.current += buffer.duration;
              sources.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sources.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sources.current.clear();
              nextStartTime.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setIsConnecting(false);
            setIsActive(false);
          },
          onclose: () => {
            setIsActive(false);
            setCurrentStream(null);
          }
        }
      });
    } catch (err) {
      console.error("Permission denied or stream error:", err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionPromiseRef.current?.then(session => session.close());
    setIsActive(false);
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col items-center">
      <div className={`w-24 h-24 border-2 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'opacity-20 grayscale'}`} style={{ borderColor: isActive ? themeColor : 'white' }}>
        {isActive ? <Activity size={32} className="pulse-theme" style={{color: themeColor}} /> : <Radio size={32} />}
      </div>
      
      <div className="text-center">
        <h3 className="text-[10px] font-black tracking-[0.4em] uppercase mb-2">Native_Live_Link</h3>
        <p className="text-[9px] opacity-40 uppercase tracking-widest">Bi-directional Neural Audio</p>
      </div>

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-full py-6 border transition-all flex items-center justify-center gap-4 text-[10px] font-black tracking-[0.6em] raised-object ${isActive ? 'raised-object-active' : ''}`}
        style={{ borderTopColor: themeColor, borderLeftColor: themeColor, '--theme-color': themeColor } as any}
      >
        {isConnecting ? <Loader2 size={16} className="animate-spin" /> : isActive ? <><MicOff size={16} /> TERMINATE</> : <><Mic size={16} /> CONNECT</>}
      </button>

      {/* Real-time Audio Visualizer */}
      <div className="w-full h-24 border border-white/5 bg-black/40 relative overflow-hidden flex items-center justify-center">
        {!isActive && !isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <span className="text-[8px] font-black tracking-[0.5em] uppercase">Visualizer_Standby</span>
            </div>
        )}
        <AudioVisualizer stream={currentStream} themeColor={themeColor} isActive={isActive} />
      </div>
    </div>
  );
};
