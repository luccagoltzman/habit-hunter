import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { HabitService } from '../../services/habit.service';
import { StorageService } from '../../services/storage.service';
import { Theme } from '../../models/user.model';
import { Habit } from '../../models/habit.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userName = '';
  selectedTheme = Theme.LIGHT;
  themes = Object.values(Theme);
  showConfirmReset = false;
  exportedData = '';
  importData = '';
  importError = '';
  showImportConfirm = false;
  
  constructor(
    private userService: UserService,
    private habitService: HabitService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      this.userName = user.settings.name || '';
      this.selectedTheme = user.settings.theme;
    });
  }

  /**
   * Salva o nome do usuário
   */
  saveUserName(): void {
    this.userService.updateSettings({ name: this.userName.trim() });
  }

  /**
   * Altera o tema da aplicação
   */
  changeTheme(theme: Theme): void {
    this.selectedTheme = theme;
    this.userService.updateSettings({ theme });
  }

  /**
   * Mostra a confirmação de reset
   */
  showResetConfirmation(): void {
    this.showConfirmReset = true;
  }

  /**
   * Cancela o reset
   */
  cancelReset(): void {
    this.showConfirmReset = false;
  }

  /**
   * Limpa todos os dados da aplicação
   */
  resetAllData(): void {
    this.userService.resetUser();
    // Remove todos os hábitos
    this.habitService.habits$.pipe(take(1)).subscribe(habits => {
      habits.forEach((habit: Habit) => {
        this.habitService.deleteHabit(habit.id);
      });
    });
    
    this.showConfirmReset = false;
  }

  /**
   * Exporta os dados para um arquivo JSON
   */
  exportDataToFile(): void {
    const data = this.storageService.exportData();
    this.exportedData = data;
    
    // Cria um elemento de download
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `habit-hunter-backup-${new Date().toISOString().slice(0, 10)}.json`);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
  }

  /**
   * Valida os dados importados
   */
  validateImportData(): void {
    this.importError = '';
    
    if (!this.importData) {
      this.importError = 'Por favor, insira os dados a serem importados.';
      return;
    }
    
    try {
      const data = JSON.parse(this.importData);
      
      // Verificações básicas para garantir que os dados são válidos
      if (!data.habits || !data.user) {
        this.importError = 'O formato dos dados não é válido.';
        return;
      }
      
      // Se tudo estiver ok, mostrar confirmação
      this.showImportConfirm = true;
    } catch (e) {
      this.importError = 'JSON inválido. Verifique o formato dos dados.';
    }
  }

  /**
   * Cancela a importação
   */
  cancelImport(): void {
    this.showImportConfirm = false;
    this.importData = '';
  }

  /**
   * Importa os dados do JSON
   */
  confirmImport(): void {
    try {
      const success = this.storageService.importData(this.importData);
      
      if (success) {
        // Recarrega os dados
        window.location.reload();
      } else {
        this.importError = 'Erro ao importar dados.';
      }
    } catch (e) {
      this.importError = 'Erro ao processar os dados importados.';
    }
    
    this.showImportConfirm = false;
  }
}
