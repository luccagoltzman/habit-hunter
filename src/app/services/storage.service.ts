import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private PREFIX = 'habit-hunter-';

  constructor() { }

  /**
   * Salva um item no localStorage
   */
  setItem(key: string, value: any): void {
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
    localStorage.removeItem(this.PREFIX + key);
  }

  /**
   * Limpa todos os dados da aplicação no localStorage
   */
  clearAll(): void {
    // Remove apenas as chaves que começam com o prefixo da aplicação
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  /**
   * Exporta todos os dados da aplicação como JSON
   */
  exportData(): string {
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
