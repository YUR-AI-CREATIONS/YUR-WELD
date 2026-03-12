
import { useState, useCallback } from 'react';
import { useNeural } from '../context/NeuralContext';
import { geminiService } from '../services/geminiService';
import { ChatMessage, AIModel, FileMetadata } from '../types';

export const useNeuralEngine = () => {
  const { state, dispatch, addLog } = useNeural();
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const trainSynapticNode = useCallback(async (files: FileMetadata[]) => {
    setIsTraining(true);
    addLog("SYNAPTIC_VAULT: SEQUENCING_DNA...");
    try {
      const dna = await geminiService.trainSynapticNode(files);
      const mergedDNA = `// SYNAPTIC_MATCH_FOUND\n// TIMESTAMP: ${new Date().toISOString()}\n${dna}`;
      dispatch({ type: 'SET_DNA', payload: mergedDNA });
      dispatch({ type: 'UPDATE_ACTIVE_NODE', payload: { dna: mergedDNA, status: 'ACTIVE' } });
      addLog("CENTRAL_BRAIN: DNA_STITCHING_COMPLETE");
    } catch (e: any) {
      addLog(`BRAIN_ERR: ${e.message}`);
    } finally {
      setIsTraining(false);
    }
  }, [dispatch, addLog]);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isChatLoading) return;
    
    setIsChatLoading(true);
    setIsOptimizing(true);
    addLog("NEURAL_ENGINE: OPTIMIZING_COMMAND...");
    
    let finalPrompt = prompt;
    try {
      finalPrompt = await geminiService.optimizePrompt(prompt);
      addLog("OPTIMIZATION_COMPLETE: PRECISE_PROMPT_MAPPED.");
    } catch (e) {
      addLog("OPTIMIZER_FAILED: USING_RAW_STREAM.");
    } finally {
      setIsOptimizing(false);
    }

    const userMsg: ChatMessage = { role: 'user', content: finalPrompt, timestamp: new Date() };
    const currentHistory = [...state.activeNode.history, userMsg];
    dispatch({ type: 'UPDATE_ACTIVE_NODE', payload: { history: currentHistory } });

    const isThinkingModel = ['ORACLE_PRIME', 'GROK_X', 'CLAUDE_3', 'CHAT_GPT_4'].includes(state.activeNode.model);
    if (isThinkingModel) setIsThinking(true);

    addLog(`ORACLE_CALL: ${state.activeNode.model}`);
    try {
      const response = await geminiService.sendMessage(currentHistory, state.activeNode.model, {
        neuralDNA: state.activeNode.dna,
        attachedFiles: state.activeNode.files
      });

      const modelMsg: ChatMessage = {
        role: 'model',
        content: response.text || "NO_DATA",
        timestamp: new Date(),
        mediaUrl: response.mediaUrl,
        mediaType: response.mediaType,
        groundingUrls: response.groundingUrls,
        isSynaptic: state.activeNode.status === 'ACTIVE'
      };

      dispatch({ type: 'UPDATE_ACTIVE_NODE', payload: { history: [...currentHistory, modelMsg] } });
      addLog("RECV: OK");
    } catch (e: any) {
      addLog(`ERR: ${e.message}`);
    } finally {
      setIsChatLoading(false);
      setIsThinking(false);
    }
  }, [state, dispatch, addLog, isChatLoading]);

  return { sendMessage, trainSynapticNode, isChatLoading, isThinking, isOptimizing, isTraining };
};
