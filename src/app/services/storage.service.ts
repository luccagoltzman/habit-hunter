import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private PREFIX = 'habit-hunter-';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Verifica se o localStorage está disponível
   */
  private isLocalStorageAvailable(): boolean {
    return this.isBrowser;
  }

  /**
   * Salva um item no localStorage
   */
  setItem(key: string, value: any): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const item = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, item);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Recupera um item do localStorage
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isLocalStorageAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao recuperar do localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove um item do localStorage
   */
  removeItem(key: string): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    localStorage.removeItem(this.PREFIX + key);
  }

  /**
   * Limpa todos os dados da aplicação no localStorage
   */
  clearAll(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    // Remove apenas as chaves que começam com o prefixo da aplicação
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * Exporta todos os dados da aplicação como JSON
   */
  exportData(): string {
    if (!this.isLocalStorageAvailable()) {
      return JSON.stringify({});
    }

    const data: Record<string, any> = {};
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => {
        const normalizedKey = key.replace(this.PREFIX, '');
        const value = localStorage.getItem(key);
        if (value) {
          data[normalizedKey] = JSON.parse(value);
        }
      });
    
    return JSON.stringify(data);
  }

  /**
   * Importa dados a partir de uma string JSON
   */
  importData(jsonData: string): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const data = JSON.parse(jsonData);
      
      // Remove os dados existentes antes de importar
      this.clearAll();
      
      // Importa os novos dados
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key]);
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}
