import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Reward, RewardType, Theme } from '../../models/user.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {
  rewards: Reward[] = [];
  selectedReward: Reward | null = null;
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      this.rewards = [...user.rewards];
    });
  }

  /**
   * Filtra recompensas pelo tipo
   */
  getRewardsByType(type: RewardType): Reward[] {
    return this.rewards.filter(reward => reward.type === type);
  }

  /**
   * Seleciona uma recompensa para ver detalhes
   */
  selectReward(reward: Reward): void {
    this.selectedReward = reward;
  }

  /**
   * Fecha o modal de detalhes
   */
  closeDetails(): void {
    this.selectedReward = null;
  }

  /**
   * Ativa um tema se for uma recompensa desbloqueada
   */
  applyTheme(reward: Reward): void {
    if (!reward.unlocked || reward.type !== RewardType.THEME) {
      return;
    }
    
    // Extrai o nome do tema da descrição da recompensa
    const themeName = reward.name.toLowerCase().includes('escuro') ? Theme.DARK :
                      reward.name.toLowerCase().includes('roxo') ? Theme.PURPLE :
                      reward.name.toLowerCase().includes('verde') ? Theme.GREEN : 
                      Theme.LIGHT;
    
    this.userService.updateSettings({ theme: themeName });
    
    // Feedback visual temporário poderia ser adicionado aqui
  }

  /**
   * Retorna o ícone baseado no tipo de recompensa
   */
  getRewardIcon(type: RewardType): string {
    switch (type) {
      case RewardType.BADGE:
        return '🏆';
      case RewardType.THEME:
        return '🎨';
      case RewardType.AVATAR:
        return '👤';
      default:
        return '🎁';
    }
  }

  /**
   * Verifica se tem alguma recompensa nova do tipo especificado
   */
  hasNewRewards(type: RewardType): boolean {
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
    
    return this.rewards.some(reward => {
      if (!reward.unlocked || !reward.unlockedAt || reward.type !== type) {
        return false;
      }
      
      const unlockDate = new Date(reward.unlockedAt);
      return unlockDate >= threeDaysAgo;
    });
  }

  /**
   * Verifica se uma recompensa pode ser usada (temas)
   */
  canUseReward(reward: Reward): boolean {
    return reward.unlocked && reward.type === RewardType.THEME;
  }
}
