import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { UserService } from '../../services/user.service';
import { Habit, Frequency } from '../../models/habit.model';
import { DateUtils } from '../../utils/date.utils';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit {
  habits: Habit[] = [];
  filteredHabits: Habit[] = [];
  filterValue: string = 'all';
  today = new Date();
  
  // Dias da semana abreviados
  private weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  constructor(
    private habitService: HabitService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.applyFilter();
    });
  }

  /**
   * Alterna a conclusão de um hábito
   */
  toggleHabit(habit: Habit): void {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = this.habitService.isHabitCompletedOnDate(habit.id, today);
    
    if (isCompleted) {
      this.habitService.uncompleteHabit(habit.id, today);
    } else {
      this.habitService.completeHabit(habit.id, today);
    }
  }
  
  /**
   * Incrementa a contagem de um hábito
   */
  incrementCount(habit: Habit, event: Event): void {
    event.stopPropagation();
    
    if (!habit.countGoal || habit.currentCount === undefined) return;
    
    // Não permitir ultrapassar a meta
    if (habit.currentCount < habit.countGoal) {
      const updatedHabit = {
        ...habit,
        currentCount: habit.currentCount + 1
      };
      
      this.habitService.updateHabit(habit.id, updatedHabit);
      
      // Se atingiu a meta, marca como completo
      if (updatedHabit.currentCount >= habit.countGoal) {
        const today = new Date().toISOString().split('T')[0];
        this.habitService.completeHabit(habit.id, today);
      }
    }
  }
  
  /**
   * Decrementa a contagem de um hábito
   */
  decrementCount(habit: Habit, event: Event): void {
    event.stopPropagation();
    
    if (!habit.countGoal || habit.currentCount === undefined) return;
    
    if (habit.currentCount > 0) {
      const wasComplete = habit.currentCount >= habit.countGoal;
      
      const updatedHabit = {
        ...habit,
        currentCount: habit.currentCount - 1
      };
      
      this.habitService.updateHabit(habit.id, updatedHabit);
      
      // Se estava completo e agora não está mais, desmarca a conclusão
      if (wasComplete && updatedHabit.currentCount < habit.countGoal) {
        const today = new Date().toISOString().split('T')[0];
        this.habitService.uncompleteHabit(habit.id, today);
      }
    }
  }

  /**
   * Verifica se um hábito foi concluído hoje
   */
  isCompletedToday(habitId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.habitService.isHabitCompletedOnDate(habitId, today);
  }
  
  /**
   * Retorna uma string formatada com os dias da semana
   */
  getDaysOfWeek(days: number[]): string {
    if (!days || !days.length) return '';
    return days.map(day => this.weekdayNames[day]).join(', ');
  }
  
  /**
   * Verifica se o hábito deve ser exibido hoje com base na frequência
   */
  shouldShowHabitToday(habit: Habit): boolean {
    // Hábitos diários sempre são exibidos
    if (habit.frequency === Frequency.DAILY) {
      return true;
    }
    
    // Hábitos semanais são exibidos no início da semana (segunda-feira)
    if (habit.frequency === Frequency.WEEKLY) {
      const today = new Date();
      return today.getDay() === 1; // Segunda-feira
    }
    
    // Hábitos mensais são exibidos no início do mês (dia 1)
    if (habit.frequency === Frequency.MONTHLY) {
      const today = new Date();
      return today.getDate() === 1; // Primeiro dia do mês
    }
    
    // Hábitos com dias específicos da semana
    if (habit.frequency === Frequency.SPECIFIC_DAYS && habit.weekDays) {
      const today = new Date();
      const currentDay = today.getDay(); // 0-6, onde 0 é domingo
      return habit.weekDays.includes(currentDay);
    }
    
    // Para outros tipos de frequência, sempre exibir
    return true;
  }

  /**
   * Filtra os hábitos com base no critério selecionado
   */
  private applyFilter(): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Primeiro filtramos apenas os hábitos que devem ser exibidos hoje
    const visibleHabits = this.habits.filter(habit => this.shouldShowHabitToday(habit));
    
    switch (this.filterValue) {
      case 'completed':
        this.filteredHabits = visibleHabits.filter(habit => 
          this.habitService.isHabitCompletedOnDate(habit.id, today)
        );
        break;
      case 'pending':
        this.filteredHabits = visibleHabits.filter(habit => 
          !this.habitService.isHabitCompletedOnDate(habit.id, today)
        );
        break;
      case 'all':
      default:
        this.filteredHabits = visibleHabits;
        break;
    }
  }

  /**
   * Altera o filtro de exibição
   */
  changeFilter(value: string): void {
    this.filterValue = value;
    this.applyFilter();
  }

  /**
   * Retorna a data atual formatada
   */
  get formattedDate(): string {
    return DateUtils.formatBR(this.today);
  }

  /**
   * Retorna o dia da semana atual
   */
  get weekday(): string {
    return DateUtils.weekdayPT(this.today);
  }
  
  /**
   * Retorna a porcentagem de progresso para um hábito com contagem
   */
  getCountProgress(habit: Habit): number {
    if (!habit.countGoal || habit.currentCount === undefined) return 0;
    
    return Math.min((habit.currentCount / habit.countGoal) * 100, 100);
  }

  /**
   * Retorna os itens do checklist para um hábito
   */
  getChecklistItems(habit: Habit): boolean[] {
    if (!habit.countGoal) return [];
    
    // Se não existe, inicializar o array de itens do checklist
    if (!habit.checklistItems || habit.checklistItems.length !== habit.countGoal) {
      // Criar um array do tamanho da meta, com todos os itens como false
      const updatedHabit = {
        ...habit,
        checklistItems: Array(habit.countGoal).fill(false)
      };
      
      // Se o hábito não tem nomes personalizados para os itens, criar nomes padrão
      if (habit.useChecklist && (!habit.checklistItemNames || habit.checklistItemNames.length !== habit.countGoal)) {
        updatedHabit.checklistItemNames = Array(habit.countGoal).fill('').map((_, i) => `Item ${i + 1}`);
      }
      
      this.habitService.updateHabit(habit.id, updatedHabit);
      return updatedHabit.checklistItems || [];
    }
    
    return habit.checklistItems;
  }
  
  /**
   * Alterna o estado de um item no checklist
   */
  toggleChecklistItem(habit: Habit, index: number, event: Event): void {
    event.stopPropagation();
    
    if (!habit.countGoal || !habit.checklistItems) return;
    
    // Cria uma cópia do array de itens
    const updatedItems = [...habit.checklistItems];
    // Inverte o estado do item clicado
    updatedItems[index] = !updatedItems[index];
    
    // Conta quantos itens estão marcados
    const checkedCount = updatedItems.filter(item => item).length;
    
    const updatedHabit = {
      ...habit,
      checklistItems: updatedItems,
      currentCount: checkedCount
    };
    
    this.habitService.updateHabit(habit.id, updatedHabit);
    
    // Verifica se todos os itens estão marcados para concluir o hábito
    const today = new Date().toISOString().split('T')[0];
    if (checkedCount >= habit.countGoal) {
      this.habitService.completeHabit(habit.id, today);
    } else {
      this.habitService.uncompleteHabit(habit.id, today);
    }
  }
}
