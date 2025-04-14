import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { Habit } from '../../models/habit.model';
import { HabitStats } from '../../models/completion.model';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { DateUtils } from '../../utils/date.utils';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  habits: Habit[] = [];
  habitStats: Record<string, HabitStats> = {};
  isLoading = true;
  
  constructor(private habitService: HabitService) { }

  ngOnInit(): void {
    this.habitService.habits$.pipe(
      switchMap(habits => {
        this.habits = habits;
        
        if (habits.length === 0) {
          return of({});
        }
        
        // Obtém estatísticas para cada hábito
        const statsObservables: Record<string, Observable<HabitStats | null>> = {};
        habits.forEach(habit => {
          statsObservables[habit.id] = this.habitService.getHabitStats(habit.id);
        });
        
        return forkJoin(statsObservables);
      })
    ).subscribe(stats => {
      this.habitStats = Object.fromEntries(
        Object.entries(stats)
          .filter(([_, stat]) => stat !== null) as [string, HabitStats][]
      );
      this.isLoading = false;
    });
  }

  /**
   * Obtém as estatísticas de um hábito específico
   */
  getStatsForHabit(habitId: string): HabitStats | null {
    return this.habitStats[habitId] || null;
  }

  /**
   * Formata uma data para exibição
   */
  formatDate(date?: string): string {
    if (!date) return 'Nunca';
    return DateUtils.formatBR(date);
  }

  /**
   * Verifica se a sequência está ativa (concluído hoje ou ontem)
   */
  isStreakActive(stats: HabitStats | null): boolean {
    if (!stats || stats.streak === 0) return false;
    
    const lastCompleted = stats.lastCompleted;
    if (!lastCompleted) return false;
    
    return DateUtils.isToday(lastCompleted) || 
           DateUtils.daysBetween(lastCompleted, DateUtils.today()) === 1;
  }

  /**
   * Calcula a taxa de conclusão total
   */
  get overallCompletionRate(): number {
    if (Object.keys(this.habitStats).length === 0) return 0;
    
    const totalRate = Object.values(this.habitStats)
      .reduce((sum, stat) => sum + stat.completionRate, 0);
    
    return totalRate / Object.keys(this.habitStats).length;
  }

  /**
   * Calcula o streak máximo entre todos os hábitos
   */
  get maxStreak(): number {
    if (Object.keys(this.habitStats).length === 0) return 0;
    
    return Math.max(...Object.values(this.habitStats)
      .map(stat => stat.streak));
  }

  /**
   * Calcula o número total de conclusões
   */
  get totalCompletions(): number {
    return Object.values(this.habitStats)
      .reduce((sum, stat) => sum + stat.totalCompletions, 0);
  }

  /**
   * Retorna os hábitos ordenados pela taxa de conclusão (do maior para o menor)
   */
  get habitsByCompletionRate(): Habit[] {
    return [...this.habits].sort((a, b) => {
      const rateA = this.habitStats[a.id]?.completionRate || 0;
      const rateB = this.habitStats[b.id]?.completionRate || 0;
      return rateB - rateA;
    });
  }
}
