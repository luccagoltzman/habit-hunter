import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Habit, Frequency } from '../models/habit.model';
import { CompletionStore, HabitCompletion, HabitStats } from '../models/completion.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly HABITS_KEY = 'habits';
  private readonly COMPLETIONS_KEY = 'completions';

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  private completionsSubject = new BehaviorSubject<CompletionStore>({});

  habits$ = this.habitsSubject.asObservable();
  completions$ = this.completionsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadData();
    this.diagnoseStorageData();
  }

  /**
   * Diagnostica problemas com os dados armazenados
   */
  private diagnoseStorageData(): void {
    // Verifica os hábitos armazenados
    const rawHabits = this.storageService.getItem<any>(this.HABITS_KEY);
    console.log('Dados brutos de hábitos:', rawHabits);
    
    // Verifica as conclusões armazenadas
    const rawCompletions = this.storageService.getItem<any>(this.COMPLETIONS_KEY);
    console.log('Dados brutos de conclusões:', rawCompletions);
    
    // Verifica se os arrays/objetos estão vazios
    if (!rawHabits || (Array.isArray(rawHabits) && rawHabits.length === 0)) {
      console.warn('Nenhum hábito encontrado no armazenamento');
    }
    
    if (!rawCompletions || Object.keys(rawCompletions).length === 0) {
      console.warn('Nenhuma conclusão encontrada no armazenamento');
    }
    
    // Verifica se há hábitos com formato inválido (string literal 'Diário' em vez de enum)
    if (Array.isArray(rawHabits)) {
      const hasInvalidFrequency = rawHabits.some(h => 
        typeof h.frequency === 'string' && 
        !Object.values(Frequency).includes(h.frequency as any));
        
      if (hasInvalidFrequency) {
        console.error('Encontrados hábitos com formato inválido, limpando armazenamento');
        this.clearStorage();
        return;
      }
    }
    
    // Cria um hábito de teste se não houver hábitos
    if (!rawHabits || (Array.isArray(rawHabits) && rawHabits.length === 0)) {
      console.log('Criando hábito de teste para diagnóstico...');
      this.addHabit({
        name: 'Hábito de Teste',
        description: 'Hábito criado para diagnóstico',
        color: '#4CAF50',
        frequency: Frequency.DAILY
      });
    }
  }

  /**
   * Carrega os dados iniciais do armazenamento
   */
  private loadData(): void {
    const habits = this.storageService.getItem<Habit[]>(this.HABITS_KEY, []) ?? [];
    const completions = this.storageService.getItem<CompletionStore>(this.COMPLETIONS_KEY, {}) ?? {};
    
    this.habitsSubject.next(habits);
    this.completionsSubject.next(completions);
  }

  /**
   * Salva um novo hábito
   */
  addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Habit {
    const habits = this.habitsSubject.value;
    
    const newHabit: Habit = {
      ...habit,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits, newHabit];
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    return newHabit;
  }

  /**
   * Atualiza um hábito existente
   */
  updateHabit(id: string, updates: Partial<Habit>): boolean {
    const habits = this.habitsSubject.value;
    const index = habits.findIndex(h => h.id === id);
    
    if (index === -1) return false;
    
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], ...updates };
    
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    return true;
  }

  /**
   * Remove um hábito
   */
  deleteHabit(id: string): boolean {
    const habits = this.habitsSubject.value;
    const completions = this.completionsSubject.value;
    
    if (!habits.some(h => h.id === id)) return false;
    
    // Remove o hábito
    const updatedHabits = habits.filter(h => h.id !== id);
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    // Remove as conclusões relacionadas
    const { [id]: _, ...updatedCompletions } = completions;
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Marca um hábito como concluído na data especificada
   */
  completeHabit(habitId: string, date = new Date().toISOString().split('T')[0]): boolean {
    const habits = this.habitsSubject.value;
    const completions = this.completionsSubject.value;
    
    // Verifica se o hábito existe
    if (!habits.some(h => h.id === habitId)) return false;
    
    const habitCompletions = completions[habitId] || [];
    
    // Verifica se já foi concluído nesta data
    if (habitCompletions.includes(date)) return false;
    
    // Adiciona a conclusão
    const updatedCompletions = {
      ...completions,
      [habitId]: [...habitCompletions, date]
    };
    
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Remove a marcação de conclusão de um hábito
   */
  uncompleteHabit(habitId: string, date: string): boolean {
    const completions = this.completionsSubject.value;
    const habitCompletions = completions[habitId];
    
    if (!habitCompletions || !habitCompletions.includes(date)) return false;
    
    const updatedCompletions = {
      ...completions,
      [habitId]: habitCompletions.filter(d => d !== date)
    };
    
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Verifica se um hábito foi concluído em uma data específica
   */
  isHabitCompletedOnDate(habitId: string, date = new Date().toISOString().split('T')[0]): boolean {
    const completions = this.completionsSubject.value;
    const habitCompletions = completions[habitId] || [];
    
    return habitCompletions.includes(date);
  }

  /**
   * Obtém as estatísticas de um hábito específico
   */
  getHabitStats(habitId: string): Observable<HabitStats | null> {
    return this.completions$.pipe(
      map(completions => {
        const habit = this.habitsSubject.value.find(h => h.id === habitId);
        if (!habit) {
          console.error(`Hábito não encontrado com ID: ${habitId}`);
          return null;
        }
        
        console.log(`Calculando estatísticas para hábito: ${habit.name} (${habitId})`);
        
        const habitCompletions = completions[habitId] || [];
        const totalCompletions = habitCompletions.length;
        
        console.log(`Total de conclusões: ${totalCompletions}`);
        
        // Ordenar as datas para cálculos
        const sortedDates = [...habitCompletions].sort();
        const lastCompleted = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined;
        
        console.log(`Última conclusão: ${lastCompleted || 'Nunca'}`);
        
        // Calcula a sequência atual
        const streak = this.calculateStreak(habitId, completions);
        console.log(`Sequência calculada: ${streak}`);
        
        // Calcula a taxa de conclusão de acordo com a frequência do hábito
        // Usamos a data de criação como referência
        let creationDate: string;
        try {
          creationDate = new Date(habit.createdAt).toISOString().split('T')[0];
        } catch (error) {
          console.error(`Erro ao parsear data de criação para ${habit.name}:`, error);
          creationDate = new Date().toISOString().split('T')[0]; // Usa hoje como fallback
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // Calcula o número de dias desde a criação do hábito
        const totalDaysSinceCreation = this.daysBetween(creationDate, today) + 1;
        console.log(`Dias desde a criação: ${totalDaysSinceCreation}`);
        
        // Calculamos a taxa de conclusão baseada na frequência, se disponível
        let completionRate = 0;
        
        if (totalDaysSinceCreation > 0) {
          // Taxa de conclusão simples (número de conclusões dividido pelo número de dias)
          completionRate = (totalCompletions / totalDaysSinceCreation) * 100;
          
          // Limita a taxa de conclusão a 100%
          completionRate = Math.min(completionRate, 100);
        }
        
        console.log(`Taxa de conclusão calculada: ${completionRate.toFixed(2)}%`);
        
        return {
          habitId,
          streak,
          completionRate,
          lastCompleted,
          totalCompletions
        };
      })
    );
  }

  /**
   * Calcula a sequência atual de um hábito
   */
  private calculateStreak(habitId: string, completions: CompletionStore): number {
    const habitCompletions = completions[habitId] || [];
    if (habitCompletions.length === 0) {
      console.log(`Sem conclusões para calcular sequência do hábito: ${habitId}`);
      return 0;
    }
    
    console.log(`Calculando sequência para ${habitId} com ${habitCompletions.length} conclusões`);
    
    // Converte e ordena as datas em formato yyyy-mm-dd para facilitar a comparação
    const sortedDates = [...habitCompletions].sort();
    console.log(`Datas ordenadas: ${sortedDates.join(', ')}`);
    
    // Obtenha a data de hoje e ontem no formato yyyy-mm-dd
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    console.log(`Hoje: ${today}, Ontem: ${yesterday}`);
    
    // Verifica se a última conclusão foi hoje ou ontem
    const lastCompleted = sortedDates[sortedDates.length - 1];
    console.log(`Última conclusão: ${lastCompleted}`);
    
    // Se a última conclusão não foi nem hoje nem ontem, não há sequência ativa
    if (lastCompleted !== today && lastCompleted !== yesterday) {
      console.log(`Sequência inativa: última conclusão não foi nem hoje nem ontem`);
      return 0;
    }
    
    // Calcula a sequência contando dias consecutivos
    let streak = 1;
    let currentDate = lastCompleted === today ? today : yesterday;
    console.log(`Iniciando cálculo de sequência com data atual: ${currentDate}`);
    
    // Convertemos a data atual para objeto Date para facilitar o cálculo das datas anteriores
    let currentDateObj = new Date(currentDate);
    
    // Criamos um conjunto de todas as datas de conclusão para verificação rápida
    const completionSet = new Set(sortedDates);
    
    // Verifica datas anteriores consecutivas
    while (true) {
      // Obtenha o dia anterior
      currentDateObj.setDate(currentDateObj.getDate() - 1);
      const previousDate = currentDateObj.toISOString().split('T')[0];
      
      // Se o dia anterior está no conjunto de conclusões, aumente a sequência
      if (completionSet.has(previousDate)) {
        streak++;
        console.log(`Data anterior ${previousDate} encontrada, sequência: ${streak}`);
      } else {
        // Se não encontrar uma data, interrompe o loop
        console.log(`Data anterior ${previousDate} não encontrada, finalizando cálculo`);
        break;
      }
    }
    
    console.log(`Sequência final calculada: ${streak}`);
    return streak;
  }

  /**
   * Calcula o número de dias entre duas datas
   */
  private daysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Limpa todo o armazenamento e recomeça do zero
   */
  private clearStorage(): void {
    this.storageService.setItem(this.HABITS_KEY, []);
    this.storageService.setItem(this.COMPLETIONS_KEY, {});
    this.habitsSubject.next([]);
    this.completionsSubject.next({});
    
    // Cria um hábito de teste
    console.log('Criando hábito de teste após limpeza do armazenamento');
    this.addHabit({
      name: 'Hábito de Teste',
      description: 'Hábito criado para diagnóstico após limpeza',
      color: '#4CAF50',
      frequency: Frequency.DAILY
    });
  }
}
