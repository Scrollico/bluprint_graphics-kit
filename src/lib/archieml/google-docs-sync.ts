/**
 * Google Docs Sync Service
 * Fetches and parses ArchieML content from Google Docs
 */

import { ArchieMLParser } from './parser';
import type { ParsedStory } from './parser';

export interface GoogleDocsConfig {
  documentId: string;
  apiKey?: string;
  useProxy?: boolean;
  proxyUrl?: string;
}

export class GoogleDocsSync {
  private parser: ArchieMLParser;
  
  constructor() {
    this.parser = new ArchieMLParser();
  }

  /**
   * Fetch document from Google Docs
   */
  async fetchDocument(config: GoogleDocsConfig): Promise<string> {
    const { documentId, apiKey, useProxy, proxyUrl } = config;
    
    if (useProxy && proxyUrl) {
      // Use proxy server for authenticated requests
      const response = await fetch(`${proxyUrl}/docs/${documentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      return response.text();
    }
    
    // Direct Google Docs API approach (requires API key)
    if (!apiKey) {
      throw new Error('API key required for direct Google Docs access');
    }
    
    const url = `https://docs.googleapis.com/v1/documents/${documentId}?key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    
    const doc = await response.json();
    return this.extractTextFromDocument(doc);
  }

  /**
   * Extract plain text from Google Docs API response
   */
  private extractTextFromDocument(doc: any): string {
    let text = '';
    
    if (!doc.body?.content) {
      return text;
    }
    
    const extractText = (element: any): string => {
      let result = '';
      
      if (element.paragraph?.elements) {
        for (const el of element.paragraph.elements) {
          if (el.textRun?.content) {
            result += el.textRun.content;
          }
        }
      }
      
      return result;
    };
    
    for (const element of doc.body.content) {
      text += extractText(element);
    }
    
    return text;
  }

  /**
   * Sync and parse Google Doc
   */
  async syncAndParse(config: GoogleDocsConfig): Promise<ParsedStory> {
    const text = await this.fetchDocument(config);
    return this.parser.parse(text);
  }

  /**
   * Get public document text (for published Google Docs)
   */
  async fetchPublicDocument(documentId: string): Promise<string> {
    const exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=txt`;
    
    try {
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch public document: ${response.statusText}`);
      }
      return response.text();
    } catch (error) {
      // Fallback to CORS proxy if needed
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(exportUrl)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      return data.contents;
    }
  }

  /**
   * Create shareable Google Docs URL
   */
  static createDocumentUrl(documentId: string): string {
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }

  /**
   * Extract document ID from Google Docs URL
   */
  static extractDocumentId(url: string): string | null {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Local storage cache for synced documents
 */
export class DocumentCache {
  private cacheKey = 'scrollytelling-docs-cache';
  
  /**
   * Get cached document
   */
  get(documentId: string): { story: ParsedStory; timestamp: number } | null {
    if (typeof window === 'undefined') return null;
    
    const cache = localStorage.getItem(this.cacheKey);
    if (!cache) return null;
    
    try {
      const parsed = JSON.parse(cache);
      return parsed[documentId] || null;
    } catch {
      return null;
    }
  }
  
  /**
   * Set cached document
   */
  set(documentId: string, story: ParsedStory): void {
    if (typeof window === 'undefined') return;
    
    const cache = this.getAll();
    cache[documentId] = {
      story,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }
  
  /**
   * Get all cached documents
   */
  getAll(): Record<string, { story: ParsedStory; timestamp: number }> {
    if (typeof window === 'undefined') return {};
    
    const cache = localStorage.getItem(this.cacheKey);
    if (!cache) return {};
    
    try {
      return JSON.parse(cache);
    } catch {
      return {};
    }
  }
  
  /**
   * Clear cache
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.cacheKey);
  }
  
  /**
   * Check if cache is stale (default: 1 hour)
   */
  isStale(documentId: string, maxAge = 3600000): boolean {
    const cached = this.get(documentId);
    if (!cached) return true;
    
    return Date.now() - cached.timestamp > maxAge;
  }
}
