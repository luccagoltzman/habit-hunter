import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HabitListComponent } from './components/habit-list/habit-list.component';
import { HabitCreateComponent } from './components/habit-create/habit-create.component';
import { ProgressComponent } from './components/progress/progress.component';
import { RewardsComponent } from './components/rewards/rewards.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'habits', component: HabitListComponent },
  { path: 'create', component: HabitCreateComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'rewards', component: RewardsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
