import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Frequency, Habit } from '../../models/habit.model';

@Component({
  selector: 'app-habit-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habit-create.component.html',
  styleUrls: ['./habit-create.component.scss']
})
export class HabitCreateComponent implements OnInit {
  newHabit: Partial<Habit> = {
    name: '',
    description: '',
    color: '#7356BF', // Cor padrão (roxo primário)
    frequency: Frequency.DAILY // Frequência padrão
  };

  frequencyOptions = Object.values(Frequency);
  
  // Lista de cores predefinidas para seleção
  predefinedColors = [
    '#7356BF', // Roxo (primária)
    '#FF9843', // Laranja (secundária)
    '#28A745', // Verde
    '#DC3545', // Vermelho
    '#FFC107', // Amarelo
    '#17A2B8', // Azul
    '#6C757D', // Cinza
    '#FF6B6B', // Rosa
    '#6BCB77', // Verde claro
    '#4D96FF'  // Azul claro
  ];
  
  constructor(
    private habitService: HabitService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  /**
   * Salva o novo hábito
   */
  saveHabit(): void {
    if (!this.isValid()) {
      return;
    }
    
    this.habitService.addHabit(this.newHabit as Omit<Habit, 'id' | 'createdAt'>);
    this.router.navigate(['/habits']);
  }

  /**
   * Seleciona uma cor do painel de cores
   */
  selectColor(color: string): void {
    this.newHabit.color = color;
  }

  /**
   * Verifica se o formulário é válido para envio
   */
  isValid(): boolean {
    return !!this.newHabit.name && !!this.newHabit.color && !!this.newHabit.frequency;
  }

  /**
   * Cancela a criação e retorna para a lista
   */
  cancel(): void {
    this.router.navigate(['/habits']);
  }
}
