import { useState, useCallback } from 'react';

export interface ApiKey {
  id: string;
  provider: string;
  key: string;
  validated: boolean;
  lastValidated: number;
}

export const useApiKeyVault = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const validateApiKey = useCallback(async (provider: string, key: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Call Vercel Edge Function for validation
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key })
      });
      
      const { valid } = await response.json();
      return valid;
    } catch (error) {
      console.error('Key validation failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const addApiKey = useCallback(async (provider: string, key: string) => {
    const isValid = await validateApiKey(provider, key);
    
    if (isValid) {
      const newKey: ApiKey = {
        id: `${provider}-${Date.now()}`,
        provider,
        key,
        validated: true,
        lastValidated: Date.now()
      };
      
      setApiKeys(prev => [...prev, newKey]);
      localStorage.setItem('apiKeys', JSON.stringify([...apiKeys, newKey]));
      return true;
    }
    return false;
  }, [apiKeys, validateApiKey]);

  const removeApiKey = useCallback((id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys.filter(k => k.id !== id)));
  }, [apiKeys]);

  return { apiKeys, addApiKey, removeApiKey, validateApiKey, loading };
};
