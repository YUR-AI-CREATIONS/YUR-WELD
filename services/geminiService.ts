
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, AIModel, FileMetadata, VoiceSettings, NeuralNode } from "../types";

export interface NeuralMetrics {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
}

export class GeminiService {
  private getAI() {
    // Strictly following initialization rules: new instance with named parameter
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async optimizePrompt(userPrompt: string): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a world-class prompt engineer for high-reasoning neural systems. 
      Analyze the user command and rewrite it to be technically precise, context-aware, and optimized for maximum reasoning depth.
      Keep the user's original intent but wrap it in professional, clear, and logically structured instructions.
      Return ONLY the final rewritten prompt text.
      
      USER_COMMAND: "${userPrompt}"`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        temperature: 0.4
      }
    });
    return response.text || userPrompt;
  }

  async trainSynapticNode(files: FileMetadata[]): Promise<string> {
    const ai = this.getAI();
    const trainingData = files.map(f => `FILE: ${f.name}\nCONTENT_CHUNK: ${f.data?.slice(0, 15000)}`).join('\n\n---\n\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep architectural analysis on this dataset. 
      Identify core logic, variable dependencies, and domain-specific patterns. 
      Synthesize this into a "Neural DNA" summary (JSON string format) that can be used as a system instruction to ground future responses.
      
      DATASET:\n${trainingData}`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });

    return response.text || "NO_DNA_EXTRACTED";
  }

  private prepareHistory(history: ChatMessage[]) {
    let cleaned = history.filter(h => h.content?.trim() || h.mediaUrl);
    const result: any[] = [];
    let lastRole: string | null = null;
    
    for (const msg of cleaned) {
      const currentRole = msg.role === 'user' ? 'user' : 'model';
      if (currentRole === lastRole) {
         if (result.length > 0) {
           const lastMsg = result[result.length - 1];
           lastMsg.parts[0].text = (lastMsg.parts[0].text || "") + "\n" + (msg.content || "");
         }
         continue;
      }
      result.push({ role: currentRole, parts: [{ text: msg.content || "" }] });
      lastRole = currentRole;
    }
    
    if (result.length > 0 && result[0].role === 'model') result.shift();
    return result.slice(-15);
  }

  async sendMessage(
    history: ChatMessage[], 
    modelAlias: AIModel, 
    options: { 
      aspectRatio?: string; 
      imageSize?: string;
      attachedFiles?: FileMetadata[];
      location?: { latitude: number, longitude: number };
      neuralDNA?: string; 
    } = {},
    isFallback: boolean = false
  ): Promise<{ 
    text: string; 
    mediaUrl?: string; 
    mediaType?: 'image' | 'video'; 
    groundingUrls?: string[];
    metrics?: NeuralMetrics;
  }> {
    
    const ai = this.getAI();
    let targetModel: string;
    let baseInstruction = `SYSTEM_ROLE: YUR_OS_ORACLE_V3\nNEURAL_DNA: ${options.neuralDNA || 'DEFAULT'}\n`;
    let config: any = { 
      temperature: 0.75,
      systemInstruction: `${baseInstruction}Ensure maximum precision and technical accuracy. Use high-density terminology.`
    };

    const formattedContents = this.prepareHistory(history);

    switch (modelAlias) {
      case 'ORACLE_PRIME':
      case 'CLAUDE_3':
      case 'CHAT_GPT_4':
      case 'GROK_X':
        targetModel = isFallback ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
        if (modelAlias === 'GROK_X') config.systemInstruction += " Persona: Rebellious, witty, uncensored.";
        if (modelAlias === 'CLAUDE_3') config.systemInstruction += " Persona: Nuanced, long-form, safety-conscious reasoning.";
        if (modelAlias === 'CHAT_GPT_4') config.systemInstruction += " Persona: Balanced, helpful, concise utility.";
        break;
      case 'ORACLE_LITE':
      case 'CORE_FAST':
        targetModel = 'gemini-3-flash-preview';
        config.thinkingConfig = { thinkingBudget: 24576 };
        if (modelAlias === 'ORACLE_LITE') config.tools = [{ googleSearch: {} }];
        break;
      case 'CORE_GEO':
        targetModel = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
        if (options.location) config.toolConfig = { retrievalConfig: { latLng: options.location } };
        break;
      case 'SYNTH_EDIT':
        targetModel = 'gemini-2.5-flash-image';
        break;
      case 'SYNTH_HD':
        targetModel = 'gemini-3-pro-image-preview';
        config.imageConfig = { aspectRatio: options.aspectRatio || "1:1", imageSize: options.imageSize || "1K" };
        break;
      default:
        targetModel = 'gemini-3-flash-preview';
        config.thinkingConfig = { thinkingBudget: 24576 };
    }

    if (options.attachedFiles && options.attachedFiles.length > 0) {
      const lastMsg = formattedContents[formattedContents.length - 1];
      options.attachedFiles.forEach(file => {
        if (file.data) {
          const isMedia = file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/');
          if (isMedia) {
            lastMsg.parts.push({ inlineData: { data: file.data.includes(',') ? file.data.split(',')[1] : file.data, mimeType: file.mimeType } });
          } else {
            lastMsg.parts.push({ text: `\n[SYNAPTIC_ARTIFACT: ${file.name}]\n${file.data.slice(0, 50000)}` });
          }
        }
      });
    }

    try {
      const response = await ai.models.generateContent({ model: targetModel, contents: formattedContents, config });
      let text = response.text || "";
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;
      let groundingUrls: string[] = [];

      response.candidates?.[0]?.content?.parts.forEach(part => {
        if (part.inlineData) {
          mediaUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          mediaType = 'image';
        }
      });

      const gm = response.candidates?.[0]?.groundingMetadata;
      if (gm?.groundingChunks) {
        gm.groundingChunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) groundingUrls.push(chunk.maps.uri);
          if (chunk.web?.uri) groundingUrls.push(chunk.web.uri);
        });
      }

      return { 
        text: text.trim(), 
        mediaUrl, 
        mediaType, 
        groundingUrls, 
        metrics: response.usageMetadata ? { 
          promptTokens: response.usageMetadata.promptTokenCount, 
          candidatesTokens: response.usageMetadata.candidatesTokenCount, 
          totalTokens: response.usageMetadata.totalTokenCount 
        } : undefined 
      };
    } catch (error: any) {
      if (!isFallback && (error.status === "RESOURCE_EXHAUSTED" || error.status === 429)) {
        return this.sendMessage(history, 'ORACLE_LITE', options, true);
      }
      throw error;
    }
  }

  async generateVideo(prompt: string, imageFile?: FileMetadata, aspectRatio: '16:9' | '9:16' = '16:9') {
    // Creating fresh instance as per rules for Veo
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    let op = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: imageFile?.data ? { imageBytes: imageFile.data.includes(',') ? imageFile.data.split(',')[1] : imageFile.data, mimeType: imageFile.mimeType || 'image/png' } : undefined,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });

    while (!op.done) {
      await new Promise(r => setTimeout(r, 10000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const downloadLink = op.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("VIDEO_GENERATION_FAILED");

    // Appending API key to fetch MP4 bytes
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async generateSpeech(text: string, voiceName: string = 'Kore') {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak naturally and expressively: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
}

export const geminiService = new GeminiService();
