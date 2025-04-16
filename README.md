# 🏆 Habit Hunter

<div align="center">
  
![Habit Hunter](https://img.shields.io/badge/Habit%20Hunter-1.0.0-7356BF?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
  
**Transforme seus hábitos em conquistas divertidas**

<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/trophy.svg" width="120" alt="Trophy" style="filter: invert(43%) sepia(46%) saturate(4929%) hue-rotate(244deg) brightness(92%) contrast(92%);">

<p>Um aplicativo de rastreamento de hábitos gamificado para tornar o desenvolvimento de hábitos saudáveis uma jornada divertida e recompensadora.</p>

</div>

---

<!-- ## 📱 Capturas de Tela

<div align="center">
  <table>
    <tr>
      <td><img src="docs/assets/screenshot-home.png" alt="Tela Inicial" width="200"/></td>
      <td><img src="docs/assets/screenshot-habits.png" alt="Lista de Hábitos" width="200"/></td>
      <td><img src="docs/assets/screenshot-rewards.png" alt="Recompensas" width="200"/></td>
    </tr>
  </table>
</div> -->

## ✨ Características

- 📋 **Gerenciamento de Hábitos** - Crie, acompanhe e gerencie seus hábitos diários
- 🎮 **Gamificação** - Ganhe XP, suba de nível e conquiste medalhas
- 📊 **Estatísticas Detalhadas** - Visualize seu progresso com gráficos intuitivos
- 🎨 **Personalização** - Escolha entre vários temas e personalize seus hábitos
- 🔄 **Sincronização** - Exporte e importe seus dados
- 📱 **Responsivo** - Funciona em dispositivos móveis e desktop

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14.x ou superior)
- [npm](https://www.npmjs.com/) (v6.x ou superior) ou [yarn](https://yarnpkg.com/)
- [Angular CLI](https://angular.io/cli) (v17.x)

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/luccagoltzman/habit-hunter.git
   cd habit-hunter
   ```

2. Instale as dependências
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Inicie o servidor de desenvolvimento
   ```bash
   ng serve
   ```

4. Abra seu navegador e acesse `http://localhost:4200`

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── components/            # Componentes da aplicação
│   │   ├── home/              # Tela inicial
│   │   ├── habit-list/        # Lista de hábitos
│   │   ├── habit-create/      # Criação de hábitos
│   │   ├── progress/          # Visualização de progresso
│   │   ├── rewards/           # Sistema de recompensas
│   │   └── settings/          # Configurações
│   ├── models/                # Interfaces e tipos
│   ├── services/              # Serviços para lógica de negócios
│   └── utils/                 # Funções utilitárias
├── assets/                    # Recursos estáticos
└── styles/                    # Estilos globais
```

## 🧠 Conceitos de Design

O Habit Hunter é construído com os seguintes princípios em mente:

- **Simplicidade**: Interface limpa e intuitiva
- **Recompensa**: Sistema de gamificação para motivação contínua
- **Consistência**: Design coerente em todas as telas
- **Acessibilidade**: Usável por todos, independente de dispositivo

## 🎯 Como Usar

1. **Criar um Hábito**: Adicione um novo hábito na tela "Criar"
2. **Acompanhar Progresso**: Marque hábitos como completos na tela "Hábitos"
3. **Visualizar Conquistas**: Veja suas recompensas na tela "Recompensas"
4. **Personalizar**: Ajuste as configurações na tela "Ajustes"

## 🌈 Temas

O Habit Hunter oferece quatro temas para personalizar sua experiência:

- **Claro**: Tema padrão com fundo branco
- **Escuro**: Para uso noturno e economia de bateria
- **Roxo**: Um tema vibrante com tons de roxo
- **Verde**: Um tema refrescante com tons de verde

## 🛠️ Tecnologias

- [Angular](https://angular.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [SCSS](https://sass-lang.com/)
- [Font Awesome](https://fontawesome.com/)
- [localStorage](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)

## 📊 Recursos de Gamificação

- **Experiência (XP)**: Ganhe pontos ao completar hábitos
- **Níveis**: Suba de nível conforme acumula XP
- **Conquistas**: Desbloqueie medalhas por marcos atingidos
- **Temas**: Desbloqueie novos temas ao avançar

## 📋 Roadmap

- [ ] Notificações push
- [ ] Hábitos com dias específicos da semana
- [ ] Hábitos com contagem (por exemplo, beber 8 copos de água)
- [ ] Backup na nuvem
- [ ] Compartilhamento social

## 💬 FAQ

**P**: Os dados são salvos quando fecho o aplicativo?  
**R**: Sim, todos os dados são salvos localmente no seu dispositivo.

**P**: Como resetar todos os hábitos?  
**R**: Na tela de Configurações, existe uma opção para limpar todos os dados.

## 🙏 Agradecimentos

- Ícones por [Font Awesome](https://fontawesome.com/)
- Fonte [Poppins](https://fonts.google.com/specimen/Poppins) por Google Fonts

## 📜 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  Desenvolvido por <a href="https://github.com/luccagoltzman">Lucca Goltzman</a>
  
  <br/><br/>
  
  <a href="mailto:luccagoltzman@gmail.com">
    <img src="https://img.shields.io/badge/Email-Contato-D14836?style=for-the-badge&logo=gmail" alt="Email" />
  </a>
  <a href="https://github.com/luccagoltzman">
    <img src="https://img.shields.io/badge/GitHub-Perfil-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</div>
