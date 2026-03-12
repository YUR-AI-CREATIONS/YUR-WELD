
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { NeuralNode, AIModel, User, WindowConfig } from '../types';

interface NeuralState {
  user: User | null;
  neonTheme: any;
  activeNode: NeuralNode;
  nodes: NeuralNode[];
  logs: string[];
  centralBrainDNA: string;
  isPaletteOpen: boolean;
  windows: WindowConfig[];
  activeWindowId: string | null;
}

type NeuralAction =
  | { type: 'SET_THEME'; payload: any }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'UPDATE_ACTIVE_NODE'; payload: Partial<NeuralNode> }
  | { type: 'SET_DNA'; payload: string }
  | { type: 'TOGGLE_WINDOW'; id: string; open?: boolean }
  | { type: 'UPDATE_WINDOW'; id: string; payload: Partial<WindowConfig> }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'SET_PALETTE'; open: boolean };

const initialWindows: WindowConfig[] = [
  { id: 'chat', title: 'NEURAL_COMMAND', isOpen: true, isMaximized: false, zIndex: 10, x: 400, y: 100, width: 600, height: 700, icon: 'message' },
  { id: 'vault', title: 'SYNAPTIC_VAULT', isOpen: true, isMaximized: false, zIndex: 5, x: 50, y: 100, width: 320, height: 600, icon: 'folder' },
  { id: 'oracle', title: 'ORACLE_CONTROL', isOpen: true, isMaximized: false, zIndex: 5, x: 1050, y: 100, width: 320, height: 500, icon: 'cpu' },
  { id: 'terminal', title: 'SYSTEM_LOGS', isOpen: false, isMaximized: false, zIndex: 5, x: 50, y: 720, width: 950, height: 250, icon: 'terminal' },
];

const initialState: NeuralState = {
  user: null,
  neonTheme: { id: 'neon-blue', color: '#3b82f6', label: 'CYBER_SKY', type: 'neon' },
  activeNode: {
    id: 'node_root',
    name: 'MASTER_BRANCH',
    dna: '// CORE_LOGIC_V1_INITIALIZED',
    model: 'ORACLE_PRIME',
    files: [],
    history: [],
    status: 'IDLE'
  },
  nodes: [],
  logs: [`[${new Date().toLocaleTimeString()}] YUR AI: KERNEL_INITIALIZED`],
  centralBrainDNA: '// CENTRAL_OS_IDLE',
  isPaletteOpen: false,
  windows: initialWindows,
  activeWindowId: 'chat',
};

const NeuralContext = createContext<{
  state: NeuralState;
  dispatch: React.Dispatch<NeuralAction>;
  addLog: (msg: string) => void;
} | undefined>(undefined);

function neuralReducer(state: NeuralState, action: NeuralAction): NeuralState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, neonTheme: action.payload };
    case 'ADD_LOG':
      return { ...state, logs: [...state.logs.slice(-50), `[${new Date().toLocaleTimeString()}] ${action.payload}`] };
    case 'UPDATE_ACTIVE_NODE':
      return { ...state, activeNode: { ...state.activeNode, ...action.payload } };
    case 'SET_DNA':
      return { ...state, centralBrainDNA: action.payload };
    case 'TOGGLE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => w.id === action.id ? { ...w, isOpen: action.open ?? !w.isOpen } : w),
        activeWindowId: action.id
      };
    case 'UPDATE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => w.id === action.id ? { ...w, ...action.payload } : w)
      };
    case 'FOCUS_WINDOW':
      const maxZ = Math.max(...state.windows.map(w => w.zIndex));
      return {
        ...state,
        activeWindowId: action.id,
        windows: state.windows.map(w => w.id === action.id ? { ...w, zIndex: maxZ + 1 } : w)
      };
    case 'SET_PALETTE':
      return { ...state, isPaletteOpen: action.open };
    default:
      return state;
  }
}

export const NeuralProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(neuralReducer, initialState);
  const addLog = useCallback((msg: string) => dispatch({ type: 'ADD_LOG', payload: msg }), []);

  return (
    <NeuralContext.Provider value={{ state, dispatch, addLog }}>
      {children}
    </NeuralContext.Provider>
  );
};

export const useNeural = () => {
  const context = useContext(NeuralContext);
  if (!context) throw new Error('useNeural must be used within a NeuralProvider');
  return context;
};
