
import React, { useState, useCallback, useRef } from 'react';
import { 
  X, FolderArchive, Eye, Code, CloudUpload, FileArchive, Activity, Zap, Cpu, Box
} from 'lucide-react';
import { FileMetadata } from '../types';

declare const JSZip: any;

interface ProcessedFile extends FileMetadata {
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  manifest?: string[];
}

interface Props {
  themeColor: string;
  onFileAdded?: (file: FileMetadata) => void;
}

const FilePort: React.FC<Props> = ({ themeColor, onFileAdded }) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      await handleZip(file, fileId);
      return;
    }

    const newFile: ProcessedFile = {
      id: fileId, name: file.name, size: file.size, type: 'raw', path: file.name, status: 'uploading', progress: 0, mimeType: file.type
    };
    setFiles(prev => [newFile, ...prev]);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...newFile, status: 'ready' as const, data: result, progress: 100 };
      setFiles(prev => prev.map(f => f.id === fileId ? updated : f));
      if (onFileAdded) onFileAdded(updated);
    };
    reader.readAsText(file);
  };

  const handleZip = async (file: File, id: string) => {
    const newFile: ProcessedFile = {
      id, name: file.name, size: file.size, type: 'zip', path: file.name, status: 'processing', progress: 0, mimeType: file.type
    };
    setFiles(prev => [newFile, ...prev]);

    try {
      const zip = await JSZip.loadAsync(file);
      const manifest: string[] = [];
      let combined = "";
      
      zip.forEach((path: string, entry: any) => {
        manifest.push(path);
      });

      // Technical simulation delay
      await new Promise(r => setTimeout(r, 1500));

      const updated = { ...newFile, status: 'ready' as const, progress: 100, manifest };
      setFiles(prev => prev.map(f => f.id === id ? updated : f));
      if (onFileAdded) onFileAdded(updated);
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error' } : f));
    }
  };

  return (
    <div 
      className="p-4 h-full flex flex-col gap-4 overflow-hidden"
      onDragEnter={() => setIsDragging(true)}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).forEach(processFile); }}
    >
      <label className="border border-dashed border-white/10 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
         <CloudUpload size={24} className="mb-2 opacity-20" />
         <span className="text-[9px] font-black tracking-widest uppercase">Ingest_Artifacts</span>
         <input type="file" multiple className="hidden" onChange={(e) => Array.from(e.target.files || []).forEach(processFile)} />
      </label>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {files.map(file => (
          <div key={file.id} className="border border-white/5 p-4 bg-black/40 group relative">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-white/5 flex items-center justify-center">
                   {file.status === 'processing' ? <Cpu size={16} className="animate-spin" /> : <Box size={16} style={{ color: themeColor }} />}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[11px] font-bold truncate uppercase tracking-widest">{file.name}</p>
                   <p className="text-[8px] opacity-20 font-mono">{(file.size/1024).toFixed(1)}KB // {file.status}</p>
                </div>
             </div>

             {file.manifest && (
               <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                  <span className="text-[8px] font-black tracking-widest opacity-40 uppercase">Structural_X-Ray:</span>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar">
                     {file.manifest.slice(0, 10).map((p, i) => (
                       <div key={i} className="text-[8px] font-mono opacity-20 truncate">└─ {p}</div>
                     ))}
                     {file.manifest.length > 10 && <div className="text-[8px] font-mono opacity-20">... {file.manifest.length - 10} more strands</div>}
                  </div>
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilePort;
