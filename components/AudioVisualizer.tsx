
import React, { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
  themeColor: string;
  isActive: boolean;
}

const AudioVisualizer: React.FC<Props> = ({ stream, themeColor, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / dataArrayRef.current.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const value = dataArrayRef.current[i];
        const percent = value / 255;
        const barHeight = percent * height * 0.8;

        // Mirrored Liquid Bar
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = 0.2 + (percent * 0.8);
        
        // Draw from center upwards and downwards
        const centerY = height / 2;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
        
        // Add a sharp white core to higher frequencies
        if (percent > 0.7) {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(x, centerY - 1, barWidth - 1, 2);
        }

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioCtx.close();
    };
  }, [stream, isActive, themeColor]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={120} 
      className="w-full h-full opacity-80"
    />
  );
};

export default AudioVisualizer;
