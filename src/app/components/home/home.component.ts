import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { UserService } from '../../services/user.service';
import { Habit } from '../../models/habit.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  habits: Habit[] = [];
  user: User | null = null;
  todayCompletedCount = 0;
  totalHabits = 0;
  
  constructor(
    private habitService: HabitService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Obtém os hábitos
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.totalHabits = habits.length;
      this.calculateTodayCompletions();
    });

    // Obtém dados do usuário
    this.userService.user$.subscribe(user => {
      this.user = user;
    });
  }

  /**
   * Calcula quantos hábitos foram concluídos hoje
   */
  private calculateTodayCompletions(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.todayCompletedCount = this.habits.filter(habit => 
      this.habitService.isHabitCompletedOnDate(habit.id, today)
    ).length;
  }

  /**
   * Cálculo de XP para o próximo nível
   */
  get nextLevelProgress(): number {
    if (!this.user) return 0;
    
    const xpPerLevel = 100; // Mesmo valor do serviço
    const currentLevelXp = (this.user.level - 1) * xpPerLevel;
    const xpForNextLevel = this.user.level * xpPerLevel;
    const xpInCurrentLevel = this.user.xp - currentLevelXp;
    
    return (xpInCurrentLevel / xpPerLevel) * 100;
  }

  /**
   * Retorna texto adequado para a barra de progresso diário
   */
  get dailyProgressText(): string {
    if (this.totalHabits === 0) {
      return 'Sem hábitos cadastrados';
    }
    
    return `${this.todayCompletedCount} de ${this.totalHabits} hábitos concluídos hoje`;
  }

  /**
   * Verifica se tem alguma recompensa desbloqueada recentemente
   */
  get hasNewRewards(): boolean {
    if (!this.user) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.user.rewards.some(reward => {
      if (!reward.unlocked || !reward.unlockedAt) return false;
      
      const unlockDate = new Date(reward.unlockedAt);
      unlockDate.setHours(0, 0, 0, 0);
      
      // Considera "novo" se foi desbloqueado nos últimos 3 dias
      const daysDiff = Math.floor((today.getTime() - unlockDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 3;
    });
  }
}
