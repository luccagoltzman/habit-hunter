import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('Iniciando aplicativo Angular...');
console.log('Componente raiz:', AppComponent.name);
console.log('Configuração:', appConfig);

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Aplicativo Angular iniciado com sucesso!'))
  .catch((err) => {
    console.error('Erro ao iniciar o aplicativo Angular:');
    console.error(err);
  });
