/**
 * AI Service - Serviço modular para integração com modelos de IA
 * Suporta múltiplos provedores: OpenAI, Anthropic, Azure, Custom
 */

import { z } from 'zod';

// Tipos de provedores suportados
export type AIProvider = 'openai' | 'anthropic' | 'azure' | 'custom';

// Configuração do provedor
export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  apiUrl?: string; // Para provedores customizados
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Schema de resposta da IA
export const AIResponseSchema = z.object({
  content: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.any()).optional(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// Cache de respostas
const responseCache = new Map<string, { response: AIResponse; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

/**
 * Classe principal do serviço de IA
 */
export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Gera uma chave de cache baseada no prompt e configurações
   */
  private getCacheKey(prompt: string, options?: any): string {
    return `${this.config.provider}:${this.config.model}:${prompt}:${JSON.stringify(options)}`;
  }

  /**
   * Verifica se há resposta em cache
   */
  private getFromCache(key: string): AIResponse | null {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.response;
    }
    responseCache.delete(key);
    return null;
  }

  /**
   * Salva resposta no cache
   */
  private saveToCache(key: string, response: AIResponse): void {
    responseCache.set(key, { response, timestamp: Date.now() });
  }

  /**
   * Faz chamada para OpenAI
   */
  private async callOpenAI(prompt: string, options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      confidence: 0.9,
      metadata: { model: data.model, usage: data.usage },
    };
  }

  /**
   * Faz chamada para Anthropic
   */
  private async callAnthropic(prompt: string, options?: any): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      confidence: 0.9,
      metadata: { model: data.model, usage: data.usage },
    };
  }

  /**
   * Faz chamada para Azure OpenAI
   */
  private async callAzure(prompt: string, options?: any): Promise<AIResponse> {
    if (!this.config.apiUrl) {
      throw new Error('Azure API URL is required');
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      confidence: 0.9,
      metadata: { model: data.model, usage: data.usage },
    };
  }

  /**
   * Faz chamada para provedor customizado
   */
  private async callCustom(prompt: string, options?: any): Promise<AIResponse> {
    if (!this.config.apiUrl) {
      throw new Error('Custom API URL is required');
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        model: this.config.model,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1000,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Assume que a resposta customizada tem formato similar
    return {
      content: data.content || data.text || data.response,
      confidence: data.confidence || 0.8,
      metadata: data.metadata || {},
    };
  }

  /**
   * Método principal para gerar resposta
   */
  async generate(prompt: string, options?: any): Promise<AIResponse> {
    // Verifica cache
    const cacheKey = this.getCacheKey(prompt, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Chama o provedor apropriado
    let response: AIResponse;
    
    try {
      switch (this.config.provider) {
        case 'openai':
          response = await this.callOpenAI(prompt, options);
          break;
        case 'anthropic':
          response = await this.callAnthropic(prompt, options);
          break;
        case 'azure':
          response = await this.callAzure(prompt, options);
          break;
        case 'custom':
          response = await this.callCustom(prompt, options);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      // Salva no cache
      this.saveToCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    responseCache.clear();
  }
}

/**
 * Factory para criar instância do serviço
 */
export function createAIService(config: AIConfig): AIService {
  return new AIService(config);
}

/**
 * Instância global do serviço (será configurada no startup)
 */
let globalAIService: AIService | null = null;

export function initializeAIService(config: AIConfig): void {
  globalAIService = createAIService(config);
}

export function getAIService(): AIService {
  if (!globalAIService) {
    throw new Error('AI Service not initialized. Call initializeAIService first.');
  }
  return globalAIService;
}
