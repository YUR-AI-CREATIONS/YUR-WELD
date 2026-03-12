
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FileText, Loader2, Volume2, ExternalLink, Sparkles, Grid, Copy, Check, Video } from 'lucide-react';
import { ChatMessage, AIModel } from '../types';
import { generatePDF, generateExcel, copyToClipboard } from '../services/fileService';

interface Props {
  themeColor: string;
  activeModel: AIModel;
  messages: ChatMessage[];
  isLoading: boolean;
  onSpeak?: (text: string) => void;
  onGenerateVideo?: (prompt: string) => void;
}

const ChatPort: React.FC<Props> = ({ activeModel, messages, isLoading, themeColor, onSpeak, onGenerateVideo }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, shouldAutoScroll]);

  const handleCopy = async (text: string, id: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="h-full relative overflow-hidden bg-transparent">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="h-full overflow-y-auto p-4 md:p-8 space-y-12 pb-64 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
             <div className="w-px h-32 bg-white/20 mb-12"></div>
             <span className="text-[12px] font-black uppercase tracking-[3em] lit-text" style={{ '--theme-color': themeColor } as any}>SYSTEM_STANDBY</span>
          </div>
        )}
        
        {messages.map((m, i) => {
          const isModel = m.role === 'model';
          return (
            <div key={i} className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
              <div className={`flex items-center gap-4 mb-2 px-2 transition-all duration-500 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
                <div 
                  className="w-2 h-2 rounded-full transition-all duration-500" 
                  style={{ backgroundColor: isModel ? themeColor : 'white', boxShadow: `0 0 10px ${isModel ? themeColor : 'white'}` }}
                ></div>
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 ${isModel ? 'lit-text opacity-100' : 'opacity-30'}`} style={isModel ? { '--theme-color': themeColor } as any : {}}>
                  {isModel ? activeModel : 'USER_COMMAND'}
                </span>
              </div>
              
              <div 
                className={`max-w-[95%] md:max-w-[85%] text-[15px] leading-relaxed font-normal p-6 obsidian-glass border-2 transition-all duration-500 relative group/bubble
                  ${isModel ? 'border-l-4' : 'border-r-4'}
                `}
                style={{ 
                  borderColor: `${themeColor}33`,
                  boxShadow: `0 0 25px ${themeColor}15, inset 0 0 15px ${themeColor}05`,
                  borderLeftColor: isModel ? themeColor : `${themeColor}33`,
                  borderRightColor: !isModel ? themeColor : `${themeColor}33`,
                }}
              >
                <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2" style={{ borderColor: themeColor }}></div>
                <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2" style={{ borderColor: themeColor }}></div>

                {m.content && <div className="whitespace-pre-wrap font-space text-white/90 selection:bg-white/20 selection:text-white">{m.content}</div>}
                
                {m.mediaUrl && (
                  <div className="mt-6 border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden ring-1 ring-white/10">
                    {m.mediaType === 'video' ? (
                      <video src={m.mediaUrl} controls autoPlay loop className="w-full" />
                    ) : (
                      <img src={m.mediaUrl} className="w-full transition-transform hover:scale-[1.02] duration-700" alt="Neural Synthesis" />
                    )}
                  </div>
                )}

                {m.groundingUrls && m.groundingUrls.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                     <span className="text-[8px] font-black tracking-widest text-white/20 uppercase mb-1">Source Grounding</span>
                     {m.groundingUrls.map((url, idx) => (
                       <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-[10px] text-white/40 hover:text-white bg-white/5 p-3 border border-white/10 transition-all hover:bg-white/[0.08]">
                         <span className="truncate max-w-[80%] font-mono">{new URL(url).hostname}</span>
                         <ExternalLink size={10} style={{ color: themeColor }} />
                       </a>
                     ))}
                  </div>
                )}
                
                {isModel && (
                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/5 opacity-0 group-hover/bubble:opacity-100 transition-all duration-300 translate-y-2 group-hover/bubble:translate-y-0">
                    <button 
                      onClick={() => onSpeak?.(m.content)} 
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all hover:border-white/40"
                    >
                      <Volume2 size={10} style={{ color: themeColor }} /> LISTEN
                    </button>
                    
                    <button 
                      onClick={() => onGenerateVideo?.(m.content)} 
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all hover:border-white/40"
                    >
                      <Video size={10} style={{ color: themeColor }} /> VEO
                    </button>
                    
                    <button 
                      onClick={() => generatePDF("TRANSMISSION", m.content)} 
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all hover:border-white/40"
                    >
                      <FileText size={10} /> PDF
                    </button>
                    
                    {m.content.includes('|') && (
                      <button 
                        onClick={() => generateExcel("DATA_EXTRACT", m.content)} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all hover:border-white/40"
                      >
                        <Grid size={10} /> EXCEL
                      </button>
                    )}

                    <button 
                      onClick={() => handleCopy(m.content, i)} 
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all hover:border-white/40 ml-auto"
                      style={copiedId === i ? { color: themeColor, borderColor: themeColor } : {}}
                    >
                      {copiedId === i ? <Check size={10} /> : <Copy size={10} />} 
                      {copiedId === i ? 'COPIED' : 'CLONE'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start gap-4 animate-pulse px-6 py-4">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}></div>
               <span className="text-[9px] font-black uppercase tracking-[0.8em] opacity-60 lit-text" style={{ '--theme-color': themeColor } as any}>ORACLE_THINKING</span>
             </div>
             <div className="h-[2px] w-32 bg-white/5 overflow-hidden">
                <div className="h-full bg-white animate-loading-bar" style={{ backgroundColor: themeColor }}></div>
             </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite linear;
          width: 60%;
        }
      `}</style>
    </div>
  );
};

export default ChatPort;
