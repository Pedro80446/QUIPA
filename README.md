# QUIPA — Sistema Inteligente de Análise de Erros

> *Entender o erro é abrir caminhos para crescer.*

Plataforma educacional digital que transforma o erro em ferramenta de aprendizagem. O QUIPA analisa o processo cognitivo da resposta do estudante, identifica padrões de dificuldade e gera feedback formativo personalizado, apoiando alunos e professores com dados pedagógicos concretos.

Desenvolvido para turmas de **2ª e 3ª série do Ensino Médio Técnico** — cursos de **Desenvolvimento de Sistemas** e **Jogos Digitais**.
Projeto inscrito no **Programa Do Piauí para o Mundo 2026**.

---

## Estrutura de pastas

```text
quipa/
├── index.html              # Aplicação principal (SPA)
├── .gitignore
├── README.md
└── assets/
    ├── images/
    │   └──alunofoto.jpg
    │   └──logo.png
    │   └──professorfoto.jpg
    │   └──themechange.png
    ├── css/
    │   └── style.css       # Estilos, identidade visual e temas
    └── js/
        └── app.js          # Lógica completa da aplicação
```

---

## Como usar

Abra o arquivo `index.html` em qualquer navegador moderno. **Não é necessário servidor.**

### Aluno

1. Faça login com nome, escola e série
2. Escolha a área do conhecimento
3. Digite o enunciado e sua resposta → clique em **Analisar Resposta**
4. Leia o feedback: diagnóstico, resposta correta, passos do raciocínio e dica
5. Acompanhe seu progresso no **Dashboard** e no **Histórico**

### Professor

1. Faça login com nome, escola e código `prof2024`
2. Cadastre questões em **Banco de Questões** (enunciado, gabarito, área, dica)
3. Oriente os alunos a responderem usando o banco cadastrado
4. Acesse **Resultados dos Alunos** para ver erros frequentes e desempenho da turma

---

## Funcionalidades

### Perfil do Aluno

| Tela               | Descrição                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| Dashboard          | KPIs de acertos, erros e aproveitamento; gráficos por área; dificuldades frequentes |
| Responder Questão | Análise automática com feedback formativo detalhado                                 |
| Histórico         | Registro completo das respostas com área, horário e padrão de erro                 |

### Perfil do Professor

| Tela                  | Descrição                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| Banco de Questões    | Cadastro com enunciado, gabarito, área do conhecimento e dica pedagógica |
| Resultados dos Alunos | Tabela com aluno, questão, área, resultado, padrão de erro e horário   |
| KPIs da turma         | Total de respostas, acertos, erros e alunos ativos                         |
| Erros frequentes      | Ranking visual dos padrões de erro para orientar intervenções em sala   |

---

## Áreas do conhecimento

| Área                 | Código  |
| --------------------- | -------- |
| Linguagens            | `ling` |
| Ciências Humanas     | `hum`  |
| Ciências da Natureza | `nat`  |
| Matemática           | `mat`  |

---

## Padrões de erro identificados

| Padrão                                | Área principal       |
| -------------------------------------- | --------------------- |
| Prioridade de operações              | Matemática           |
| Erro de cálculo                       | Matemática           |
| Resposta curta                         | Todas                 |
| Erro de interpretação                | Linguagens / Humanas  |
| Ausência de justificativa científica | Ciências da Natureza |
| Erro de atenção                      | Todas                 |
| Dificuldade de análise histórica     | Ciências Humanas     |
| Padrão desconhecido                   | Todas                 |

---

## Identidade visual

A identidade do QUIPA é inspirada no semiárido piauiense — resistência, florescimento e transformação.

| Cor                      | Uso                               |
| ------------------------ | --------------------------------- |
| Verde-oliva `#4a7c3f`  | Cor principal, botões, nav ativo |
| Marrom terra `#5c3d11` | Títulos, destaque professor      |
| Bege `#f5f0e8`         | Fundo do login (modo claro)       |
| Laranja `#e85d04`      | Destaque, KPI taxa de acerto      |
| Dourado `#c49a3c`      | KPI acertos, badge professor      |

| Símbolo da logo    | Significado            |
| 🌵 QUIPÁ       | Simboliza resistência,por ser uma planta regional resistente  |

---

## Persistência dos dados

Dados salvos no **LocalStorage** do navegador, por escola:

| Chave                      | Conteúdo                            |
| -------------------------- | ------------------------------------ |
| `nl:questoes:<escola>`   | Questões cadastradas pelo professor |
| `nl:resultados:<escola>` | Últimas 200 respostas dos alunos    |

> Para uso em rede com múltiplos dispositivos, é necessário um backend (Firebase, Node.js + Express).

---

## Tecnologias

| Tecnologia         | Uso                                    |
| ------------------ | -------------------------------------- |
| HTML5 + CSS3       | Estrutura e identidade visual          |
| JavaScript ES6+    | Lógica de análise e navegação      |
| Chart.js (CDN)     | Gráficos de desempenho                |
| Lucide Icons (CDN) | Ícones da interface                   |
| Google Fonts       | Tipografia (Inter + Plus Jakarta Sans) |
| LocalStorage       | Persistência local por escola         |

---

## Requisitos

| Item      | Requisito                                     |
| --------- | --------------------------------------------- |
| Navegador | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Conexão  | Apenas para CDNs na primeira abertura         |
| Servidor  | Não necessário                              |

---

## Possibilidades de expansão

- Backend com Node.js + Express e banco de dados real (SQLite, Firebase)
- Autenticação real com JWT ou OAuth2
- PWA — aplicativo instalável no celular
- Inteligência artificial com análise semântica (GPT)
- Gamificação: pontos, níveis, conquistas e ranking
- Exportação de relatórios em PDF por aluno ou turma
- Acessibilidade com respostas em áudio
- Integração com plataformas escolares (iSeduc, Mobieduca)

---

## Proposta pedagógica

O QUIPA foi desenvolvido com base nas hipóteses de que estudantes aprendem melhor quando entendem *como* erraram — não apenas *que* erraram — e que professores tomam decisões pedagógicas mais eficazes ao visualizar padrões de dificuldade da turma com base em dados reais.

A plataforma dialoga com a **BNCC**, com **metodologias ativas** e com o conceito de **aprendizagem experiencial** (Kolb, 1984), tratando o erro como etapa essencial da construção do conhecimento.

---

*Documentação — maio de 2026 · Do Piauí para o Mundo 2026*
