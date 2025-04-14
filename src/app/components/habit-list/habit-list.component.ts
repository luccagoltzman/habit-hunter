import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { UserService } from '../../services/user.service';
import { Habit } from '../../models/habit.model';
import { DateUtils } from '../../utils/date.utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-habit-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit {
  habits: Habit[] = [];
  today = DateUtils.today();
  filterValue = 'all'; // 'all', 'completed', 'pending'
  
  constructor(
    private habitService: HabitService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
    });
  }

  /**
   * Verifica se um hábito foi completado hoje
   */
  isCompletedToday(habitId: string): boolean {
    return this.habitService.isHabitCompletedOnDate(habitId, this.today);
  }

  /**
   * Marca ou desmarca um hábito como concluído
   */
  toggleHabit(habit: Habit): void {
    if (this.isCompletedToday(habit.id)) {
      // Desmarca o hábito
      this.habitService.uncompleteHabit(habit.id, this.today);
    } else {
      // Marca o hábito e adiciona XP
      const completed = this.habitService.completeHabit(habit.id, this.today);
      
      if (completed) {
        const xpResult = this.userService.addXp(10); // 10 XP por hábito concluído
        
        if (xpResult.leveledUp) {
          // Poderíamos mostrar uma animação de nível aqui
          this.userService.checkAchievements();
        }
      }
    }
  }

  /**
   * Filtra os hábitos com base no status selecionado
   */
  get filteredHabits(): Habit[] {
    if (this.filterValue === 'all') {
      return this.habits;
    }
    
    const isCompleted = this.filterValue === 'completed';
    
    return this.habits.filter(habit => 
      this.isCompletedToday(habit.id) === isCompleted
    );
  }

  /**
   * Altera o filtro de exibição
   */
  changeFilter(value: string): void {
    this.filterValue = value;
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
}
