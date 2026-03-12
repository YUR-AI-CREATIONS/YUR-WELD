
import React, { useEffect, useRef } from 'react';

interface Props {
  themeColor: string;
  isComputing?: boolean;
}

const GhostSignature: React.FC<Props> = ({ themeColor, isComputing = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const nodes: { x: number; y: number; ox: number; oy: number; phase: number; layer: number; speed: number }[] = [];
    const hexRadius = 800; 
    const layers = 14;
    
    for (let l = 0; l <= layers; l++) {
      const r = (hexRadius / layers) * l;
      const count = l === 0 ? 1 : l * 6;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        nodes.push({ 
          x, y, ox: x, oy: y, 
          phase: Math.random() * Math.PI * 2, 
          layer: l,
          speed: 0.5 + Math.random() * 0.4
        });
      }
    }

    const packets: { start: number; end: number; progress: number; speed: number; color: string }[] = [];

    const draw = () => {
      time += isComputing ? 0.04 : 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.02);

      nodes.forEach(node => {
        const drift = (isComputing ? 12 : 5) * (1 + node.layer * 0.1);
        node.x = node.ox + Math.sin(time * node.speed + node.phase) * drift;
        node.y = node.oy + Math.cos(time * node.speed + node.phase) * drift;
      });

      // --- RAZOR SHARP LATTICE ---
      ctx.lineWidth = 1.0; 
      ctx.shadowBlur = 0;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < 15000) { 
            const dist = Math.sqrt(distSq);
            const opacity = Math.max(0, (1 - dist / 120) * (0.4 - (nodes[i].layer / layers) * 0.25));
            ctx.strokeStyle = `${themeColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // --- HIGH CONTRAST NODES ---
      nodes.forEach((node, i) => {
        const baseOpacity = Math.max(0, 0.5 - (node.layer / layers) * 0.4);
        const pulse = Math.sin(time * 3 + node.phase) * 0.5 + 0.5;
        const size = (i % 8 === 0) ? 3 : 1.5;
        ctx.fillStyle = `${themeColor}${Math.floor(baseOpacity * pulse * 255).toString(16).padStart(2, '0')}`;
        ctx.fillRect(node.x - size/2, node.y - size/2, size, size);
      });

      // --- PULSING SYNAPTIC DATA ---
      if (Math.random() < (isComputing ? 0.6 : 0.08)) {
        const start = Math.floor(Math.random() * nodes.length);
        const end = Math.floor(Math.random() * nodes.length);
        if (start !== end && Math.abs(nodes[start].layer - nodes[end].layer) <= 2) {
          packets.push({ 
            start, end, progress: 0, speed: 0.04 + Math.random() * 0.06,
            color: Math.random() > 0.8 ? '#fff' : themeColor
          });
        }
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        const n1 = nodes[p.start];
        const n2 = nodes[p.end];
        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;
        const pOpacity = Math.sin(p.progress * Math.PI);
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = pOpacity;
        ctx.lineWidth = 2.0;
        const streakLen = 15;
        const ang = Math.atan2(n2.y - n1.y, n2.x - n1.x);
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(ang) * streakLen, py - Math.sin(ang) * streakLen);
        ctx.lineTo(px + Math.cos(ang) * streakLen, py + Math.sin(ang) * streakLen);
        ctx.stroke();
        if (p.progress >= 1) packets.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeColor, isComputing]);

  return (
    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* SATELLITE FOCUS OVERLAY: Removed all brackets and crosshairs as per screenshot request */}
    </div>
  );
};

export default GhostSignature;
