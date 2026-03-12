import React from 'react';
import { Zap, Database, Cpu, Radio, Lock, AlertCircle } from 'lucide-react';

const ControlPanel: React.FC = () => {
  const cards = [
    { icon: Cpu, label: 'Neural Engine', status: 'READY' },
    { icon: Database, label: 'Data Vault', status: 'SECURED' },
    { icon: Radio, label: 'Signal Bridge', status: 'ONLINE' },
    { icon: Zap, label: 'Power Grid', status: 'NOMINAL' },
    { icon: Lock, label: 'Auth System', status: 'VERIFIED' },
    { icon: AlertCircle, label: 'System Status', status: 'GREEN' },
  ];

  return (
    <>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div 
            key={i}
            className="border border-violet-500/30 rounded-lg backdrop-blur-md bg-black/40 p-4 transition-all hover:border-violet-500/60"
            style={{ boxShadow: '0 0 15px rgba(167, 51, 255, 0.1)' }}
          >
            <div className="flex items-start gap-3">
              <Icon size={18} className="mt-1" style={{ color: '#a733ff' }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black tracking-widest uppercase text-violet-300">
                  {card.label}
                </div>
                <div className="text-[10px] opacity-40 mt-1 font-mono tracking-widest uppercase">
                  {card.status}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full mt-1" style={{ 
                backgroundColor: '#a733ff',
                boxShadow: '0 0 8px #a733ff'
              }} />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ControlPanel;
