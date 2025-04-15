/**
 * Classe de utilitários para manipulação de datas
 */
export class DateUtils {
  /**
   * Retorna a data atual formatada como YYYY-MM-DD
   */
  static today(): string {
    const now = new Date();
    // Aplicando offset da timezone para garantir que seja hoje no horário local
    return now.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
  }

  /**
   * Formata uma data no padrão brasileiro: DD/MM/YYYY
   */
  static formatBR(date: string | Date): string {
    if (typeof date === 'string') {
      // Se for uma string no formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Caso seja uma string de data ISO completa
      date = new Date(date);
    }
    
    // Ajusta para o fuso horário local sem alteração do dia
    const localDate = new Date(date);
    return `${localDate.getDate().toString().padStart(2, '0')}/${(localDate.getMonth() + 1).toString().padStart(2, '0')}/${localDate.getFullYear()}`;
  }

  /**
   * Calcula a diferença de dias entre duas datas
   */
  static daysBetween(startDate: string | Date, endDate: string | Date): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica se uma data é hoje
   */
  static isToday(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  }

  /**
   * Retorna uma data com o número de dias adicionados
   */
  static addDays(date: string | Date, days: number): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * Retorna a data de ontem formatada como YYYY-MM-DD
   */
  static yesterday(): string {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }

  /**
   * Retorna o dia da semana em português
   */
  static weekdayPT(date: string | Date): string {
    const weekdays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    
    if (typeof date === 'string') {
      // Se for uma data no formato ISO YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        // Criar uma nova data com o ano, mês (0-indexed) e dia
        const d = new Date(year, month - 1, day);
        return weekdays[d.getDay()];
      }
    }
    
    // Se for uma data ou outro formato de string
    const d = typeof date === 'string' ? new Date(date) : date;
    return weekdays[d.getDay()];
  }

  /**
   * Retorna o mês em português
   */
  static monthPT(date: string | Date): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];
    
    const d = typeof date === 'string' ? new Date(date) : date;
    return months[d.getMonth()];
  }
} 