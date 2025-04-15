import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; text-align: center; min-height: 100vh;">
      <h2 style="margin-bottom: 20px;">Seu Progresso</h2>
      
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 30px; max-width: 500px; margin: 0 auto;">
        <p style="margin-bottom: 15px;">
          <strong>Em desenvolvimento</strong>
        </p>
        <p>
          A visualização detalhada de progresso estará disponível em breve.
        </p>
      </div>
    </div>
  `
})
export class ProgressComponent {}
