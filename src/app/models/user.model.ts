export interface User {
  xp: number;
  level: number;
  settings: UserSettings;
  rewards: Reward[];
}

export interface UserSettings {
  theme: Theme;
  name?: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  PURPLE = 'purple',
  GREEN = 'green'
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  type: RewardType;
  image?: string;
  unlockedAt?: string;
}

export enum RewardType {
  BADGE = 'badge',
  THEME = 'theme',
  AVATAR = 'avatar'
} 