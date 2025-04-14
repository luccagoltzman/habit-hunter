import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { User, UserSettings, Reward, Theme, RewardType } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_KEY = 'user';
  private readonly XP_PER_LEVEL = 100; // Quantidade de XP para subir de nível
  
  private userSubject = new BehaviorSubject<User>(this.getDefaultUser());
  user$ = this.userSubject.asObservable();
  
  constructor(private storageService: StorageService) {
    this.loadUser();
  }

  /**
   * Carrega o usuário do armazenamento local ou cria um novo
   */
  private loadUser(): void {
    const user = this.storageService.getItem<User>(this.USER_KEY, this.getDefaultUser()) ?? this.getDefaultUser();
    this.userSubject.next(user);
  }

  /**
   * Salva o usuário no armazenamento local
   */
  private saveUser(user: User): void {
    this.userSubject.next(user);
    this.storageService.setItem(this.USER_KEY, user);
  }

  /**
   * Adiciona XP ao usuário e verifica aumento de nível
   * @returns Informações sobre mudança de nível, se aplicável
   */
  addXp(amount: number): { leveledUp: boolean; newLevel?: number } {
    if (amount <= 0) return { leveledUp: false };
    
    const user = this.userSubject.value;
    const oldLevel = user.level;
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / this.XP_PER_LEVEL) + 1;
    
    const updatedUser = {
      ...user,
      xp: newXp,
      level: newLevel
    };
    
    this.saveUser(updatedUser);
    
    const leveledUp = newLevel > oldLevel;
    return {
      leveledUp,
      ...(leveledUp ? { newLevel } : {})
    };
  }

  /**
   * Atualiza as configurações do usuário
   */
  updateSettings(settings: Partial<UserSettings>): void {
    const user = this.userSubject.value;
    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        ...settings
      }
    };
    
    this.saveUser(updatedUser);
  }

  /**
   * Desbloqueia uma recompensa
   */
  unlockReward(rewardId: string): boolean {
    const user = this.userSubject.value;
    const rewardIndex = user.rewards.findIndex(r => r.id === rewardId);
    
    if (rewardIndex === -1) return false;
    
    const updatedRewards = [...user.rewards];
    updatedRewards[rewardIndex] = {
      ...updatedRewards[rewardIndex],
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };
    
    const updatedUser = {
      ...user,
      rewards: updatedRewards
    };
    
    this.saveUser(updatedUser);
    
    return true;
  }

  /**
   * Adiciona uma nova recompensa à lista do usuário
   */
  addReward(reward: Omit<Reward, 'id' | 'unlocked' | 'unlockedAt'>): Reward {
    const user = this.userSubject.value;
    
    const newReward: Reward = {
      ...reward,
      id: this.generateId(),
      unlocked: false
    };
    
    const updatedUser = {
      ...user,
      rewards: [...user.rewards, newReward]
    };
    
    this.saveUser(updatedUser);
    
    return newReward;
  }

  /**
   * Verifica as conquistas disponíveis e desbloqueia se os critérios forem atendidos
   * Na versão atual, apenas verifica conquistas baseadas em nível
   */
  checkAchievements(): Reward[] {
    const user = this.userSubject.value;
    const unlockedRewards: Reward[] = [];
    
    // Verifica conquistas baseadas em nível
    const levelBasedRewards = user.rewards.filter(
      r => !r.unlocked && r.name.includes('Nível')
    );
    
    for (const reward of levelBasedRewards) {
      const levelMatch = reward.description.match(/nível (\d+)/i);
      if (levelMatch) {
        const requiredLevel = parseInt(levelMatch[1], 10);
        
        if (user.level >= requiredLevel) {
          this.unlockReward(reward.id);
          unlockedRewards.push(reward);
        }
      }
    }
    
    return unlockedRewards;
  }

  /**
   * Reinicia os dados do usuário
   */
  resetUser(): void {
    this.saveUser(this.getDefaultUser());
  }

  /**
   * Retorna um usuário padrão
   */
  private getDefaultUser(): User {
    return {
      xp: 0,
      level: 1,
      settings: {
        theme: Theme.LIGHT
      },
      rewards: [
        {
          id: this.generateId(),
          name: 'Iniciante',
          description: 'Começou sua jornada de hábitos',
          unlocked: true,
          type: RewardType.BADGE,
          unlockedAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Nível 5',
          description: 'Alcançou o nível 5',
          unlocked: false,
          type: RewardType.BADGE
        },
        {
          id: this.generateId(),
          name: 'Nível 10',
          description: 'Alcançou o nível 10',
          unlocked: false,
          type: RewardType.BADGE
        },
        {
          id: this.generateId(),
          name: 'Tema Noturno',
          description: 'Desbloqueie o tema escuro ao alcançar o nível 3',
          unlocked: false,
          type: RewardType.THEME,
          image: 'assets/themes/dark.png'
        }
      ]
    };
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
