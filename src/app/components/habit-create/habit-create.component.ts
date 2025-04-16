import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HabitService } from '../../services/habit.service';
import { Frequency, Habit, WeekDay } from '../../models/habit.model';

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
    frequency: Frequency.DAILY, // Frequência padrão
    weekDays: [],
    countGoal: undefined,
    currentCount: 0,
    useChecklist: false,
    checklistItemNames: [] // Inicializa o array de nomes dos itens
  };

  frequencyOptions = Object.values(Frequency);
  
  // Dias da semana
  weekDays: WeekDay[] = [
    { value: 0, name: 'Domingo', shortName: 'Dom' },
    { value: 1, name: 'Segunda-feira', shortName: 'Seg' },
    { value: 2, name: 'Terça-feira', shortName: 'Ter' },
    { value: 3, name: 'Quarta-feira', shortName: 'Qua' },
    { value: 4, name: 'Quinta-feira', shortName: 'Qui' },
    { value: 5, name: 'Sexta-feira', shortName: 'Sex' },
    { value: 6, name: 'Sábado', shortName: 'Sáb' }
  ];
  
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
  
  // Controle para exibição do componente de contagem
  showCountInput: boolean = false;
  // Controle para exibição do modo checklist
  showChecklistInput: boolean = false;
  
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
    
    // Remover campos desnecessários baseado na frequência selecionada
    if (this.newHabit.frequency !== Frequency.SPECIFIC_DAYS) {
      delete this.newHabit.weekDays;
    }
    
    if (!this.showCountInput) {
      delete this.newHabit.countGoal;
      delete this.newHabit.currentCount;
      delete this.newHabit.checklistItemNames;
      this.newHabit.useChecklist = false;
    } else {
      this.newHabit.useChecklist = this.showChecklistInput;
      
      // Se não estiver usando checklist, remover os nomes
      if (!this.showChecklistInput) {
        delete this.newHabit.checklistItemNames;
      }
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
   * Alterna a seleção de um dia da semana
   */
  toggleWeekDay(day: number): void {
    if (!this.newHabit.weekDays) {
      this.newHabit.weekDays = [];
    }
    
    const index = this.newHabit.weekDays.indexOf(day);
    
    if (index === -1) {
      this.newHabit.weekDays.push(day);
    } else {
      this.newHabit.weekDays.splice(index, 1);
    }
  }
  
  /**
   * Verifica se um dia da semana está selecionado
   */
  isWeekDaySelected(day: number): boolean {
    return this.newHabit.weekDays?.includes(day) || false;
  }

  /**
   * Verifica se o formulário é válido para envio
   */
  isValid(): boolean {
    const baseValidation = !!this.newHabit.name && !!this.newHabit.color && !!this.newHabit.frequency;
    
    // Validação específica para dias da semana
    if (this.newHabit.frequency === Frequency.SPECIFIC_DAYS) {
      return baseValidation && this.newHabit.weekDays !== undefined && this.newHabit.weekDays.length > 0;
    }
    
    // Validação específica para hábitos com contagem
    if (this.showCountInput) {
      return baseValidation && this.newHabit.countGoal !== undefined && this.newHabit.countGoal > 0;
    }
    
    return baseValidation;
  }

  /**
   * Cancela a criação e retorna para a lista
   */
  cancel(): void {
    this.router.navigate(['/habits']);
  }
  
  /**
   * Alterna a exibição da opção de contagem
   */
  toggleCountInput(): void {
    this.showCountInput = !this.showCountInput;
    
    if (!this.showCountInput) {
      this.newHabit.countGoal = undefined;
      this.showChecklistInput = false;
    } else if (this.newHabit.countGoal === undefined) {
      this.newHabit.countGoal = 1;
    }
  }
  
  /**
   * Alterna a exibição do modo checklist
   */
  toggleChecklistInput(): void {
    this.showChecklistInput = !this.showChecklistInput;
    
    // Inicializa os nomes dos itens do checklist quando ativado
    if (this.showChecklistInput && this.newHabit.countGoal) {
      if (!this.newHabit.checklistItemNames || this.newHabit.checklistItemNames.length !== this.newHabit.countGoal) {
        this.newHabit.checklistItemNames = Array(this.newHabit.countGoal).fill('').map((_, i) => `Item ${i + 1}`);
      }
    }
  }
  
  /**
   * Atualiza os nomes dos itens do checklist quando a meta de contagem muda
   */
  updateChecklistItems(): void {
    if (this.showChecklistInput && this.newHabit.countGoal) {
      if (!this.newHabit.checklistItemNames) {
        this.newHabit.checklistItemNames = [];
      }
      
      // Mantém os nomes existentes e adiciona novos para os itens adicionais
      const oldNames = [...(this.newHabit.checklistItemNames || [])];
      this.newHabit.checklistItemNames = Array(this.newHabit.countGoal).fill('').map((_, i) => 
        oldNames[i] || `Item ${i + 1}`
      );
    }
  }
}
