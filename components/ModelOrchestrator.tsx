
import React, { useState } from 'react';
import { Cpu, Zap, Map, Image, Video, Radio, Search, BrainCircuit, Lock, ShieldCheck, Activity, Workflow, Copy, Check } from 'lucide-react';
import { AIModel } from '../types';
import { useNeural } from '../context/NeuralContext';
import { copyToClipboard } from '../services/fileService';

interface ModelOrchestratorProps {
  selectedModel: AIModel;
  onSelect: (model: AIModel) => void;
  themeColor: string;
  isSubscribed: boolean;
  config: {
    aspectRatio: string;
    imageSize: string;
  };
  onConfigChange: (key: string, value: string) => void;
}

const MODELS: { name: AIModel; icon: React.ReactNode; desc: string; premium?: boolean }[] = [
  { name: 'ORACLE_PRIME', icon: <BrainCircuit size={14}/>, desc: 'GEMINI_3_PRO: MAX_REASONING', premium: true },
  { name: 'ORACLE_LITE', icon: <Search size={14}/>, desc: 'GEMINI_3_FLASH: HIGH_SPEED_SEARCH' },
  { name: 'GROK_X', icon: <Activity size={14}/>, desc: 'REBELLIOUS_X_LOGIC', premium: true },
  { name: 'CHAT_GPT_4', icon: <Cpu size={14}/>, desc: 'BALANCED_UTILITY_V4', premium: true },
  { name: 'CLAUDE_3', icon: <ShieldCheck size={14}/>, desc: 'NUANCED_ANTHROPIC_SYNTH', premium: true },
  { name: 'CORE_FAST', icon: <Zap size={14}/>, desc: 'ULTRA_FAST_RAW_OUTPUT' },
  { name: 'CORE_GEO', icon: <Map size={14}/>, desc: 'GEMINI_2.5: MAPS_GROUNDING' },
  { name: 'SYNTH_EDIT', icon: <Image size={14}/>, desc: 'NANO_BANANA_IMAGE_V2.5' },
  { name: 'SYNTH_HD', icon: <Image size={14}/>, desc: 'GEMINI_3_IMAGE: HQ_VISUAL', premium: true },
  { name: 'TEMPORAL_VEO', icon: <Video size={14}/>, desc: 'VEO_3.1: CINEMATIC_RENDER', premium: true },
  { name: 'KLING_V', icon: <Video size={14}/>, desc: 'KLING_TEMPORAL_ENGINE', premium: true },
];

const ModelOrchestrator: React.FC<ModelOrchestratorProps> = ({ selectedModel, onSelect, themeColor, isSubscribed, config, onConfigChange }) => {
  const { state, addLog } = useNeural();
  const [activeTab, setActiveTab] = useState<'models' | 'dna'>('models');
  const [dnaCopied, setDnaCopied] = useState(false);

  const handleCopyDNA = async () => {
    const success = await copyToClipboard(state.centralBrainDNA);
    if (success) {
      setDnaCopied(true);
      setTimeout(() => setDnaCopied(false), 2000);
      addLog("DNA_COPIED_TO_CLIPBOARD");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Tabs */}
      <div className="flex border-b border-white/10 select-none">
        <button 
          onClick={() => setActiveTab('models')}
          className={`flex-1 py-3 text-[9px] font-black tracking-widest transition-all ${activeTab === 'models' ? 'lit-text border-b border-white' : 'opacity-20'}`}
          style={activeTab === 'models' ? { '--theme-color': themeColor } as any : {}}
        >
          MODELS
        </button>
        <button 
          onClick={() => setActiveTab('dna')}
          className={`flex-1 py-3 text-[9px] font-black tracking-widest transition-all ${activeTab === 'dna' ? 'lit-text border-b border-white' : 'opacity-20'}`}
          style={activeTab === 'dna' ? { '--theme-color': themeColor } as any : {}}
        >
          SYNAPTIC_DNA
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'models' ? (
          <div className="space-y-3">
            {MODELS.map((m) => {
              const isLocked = m.premium && !isSubscribed;
              return (
                <button
                  key={m.name}
                  disabled={isLocked}
                  onClick={() => onSelect(m.name)}
                  className={`w-full p-4 transition-all text-left flex flex-col gap-1 relative group raised-object ${
                    selectedModel === m.name ? 'raised-object-active' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-white/5'}`}
                  style={{ 
                    borderTopColor: selectedModel === m.name ? themeColor : 'rgba(255,255,255,0.1)',
                    borderLeftColor: selectedModel === m.name ? themeColor : 'rgba(255,255,255,0.1)',
                    '--theme-color': themeColor
                  } as any}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedModel === m.name ? 'lit-text' : 'text-white/20'}`} style={selectedModel === m.name ? { '--theme-color': themeColor } as any : {}}>
                      {m.name}
                    </span>
                    <div className={`${selectedModel === m.name ? 'pulse-theme' : 'text-white/10'}`} style={{ color: selectedModel === m.name ? themeColor : undefined }}>
                      {isLocked ? <Lock size={12} className="text-white/20" /> : m.icon}
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono transition-colors uppercase tracking-[0.2em] ${selectedModel === m.name ? 'lit-description' : 'text-white/5'}`} style={{'--theme-color': themeColor} as any}>
                    {isLocked ? 'ELITE_LINK_REQUIRED' : m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Workflow size={14} className="opacity-40" />
                   <span className="text-[10px] font-black tracking-widest opacity-40 uppercase">Strands_Active</span>
                </div>
                <button 
                  onClick={handleCopyDNA}
                  className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-bold hover:bg-white/10 transition-all"
                  style={dnaCopied ? { color: themeColor, borderColor: themeColor } : {}}
                >
                  {dnaCopied ? <Check size={10} /> : <Copy size={10} />}
                  {dnaCopied ? 'COPIED' : 'CLONE_DNA'}
                </button>
             </div>
             <div className="p-4 border border-white/10 bg-black/80 font-mono text-[9px] text-emerald-500/80 min-h-[400px] overflow-auto custom-scrollbar selection:bg-emerald-500/20">
                {state.centralBrainDNA.split('\n').map((l, i) => (
                  <div key={i} className="whitespace-pre-wrap">{l}</div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelOrchestrator;
