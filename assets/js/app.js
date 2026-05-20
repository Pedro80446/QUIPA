 

// ========== ESTADO GLOBAL ==========
let perfil = { tipo: '', nome: '', escola: '', serie: '', avatar: '' };
let historico = [];
let discSelecionada = 'ling';
let grafDesempenho = null;
let grafDisciplinas = null;

// ========== PADRÕES DE ERRO ==========

// Guarda os tipos de erro usados pelo sistema
const PADROES = {

  // Erro na ordem das contas matemáticas
  PRIORIDADE_OPERACOES: 'Erro de prioridade de operações',

  // Erro durante cálculos
  CALCULO: 'Erro de cálculo',

  // Problema de interpretação da questão
  INTERPRETACAO: 'Erro de interpretação',

  // Resposta curta ou incompleta
  RESPOSTA_CURTA: 'Resposta incompleta',

  // Falta explicação científica
  SEM_JUSTIFICATIVA: 'Ausência de justificativa científica',

  // Pequeno erro por distração
  ATENCAO: 'Erro de atenção',

  // Dificuldade em análise histórica/social
  ANALISE_HISTORICA: 'Dificuldade de análise histórica',

  // Erro não identificado pelo sistema
  DESCONHECIDO: 'Padrão desconhecido'
};

// ========== STORAGE HELPERS ==========
function chaveEscola(escola) { return 'nl_questoes_' + escola.toLowerCase().replace(/\s/g,'_'); }
function chaveResultados(escola) { return 'nl_resultados_' + escola.toLowerCase().replace(/\s/g,'_'); }

function getQuestoesDaEscola(escola) {
  try { return JSON.parse(localStorage.getItem(chaveEscola(escola)) || '[]'); } catch { return []; }
}
function salvarQuestoesDaEscola(escola, lista) {
  localStorage.setItem(chaveEscola(escola), JSON.stringify(lista));
}
function getResultadosDaEscola(escola) {
  try { return JSON.parse(localStorage.getItem(chaveResultados(escola)) || '[]'); } catch { return []; }
}
function salvarResultadosDaEscola(escola, lista) {
  localStorage.setItem(chaveResultados(escola), JSON.stringify(lista));
}

// ========== TABS LOGIN ==========
function switchLoginTab(tipo) {
 // alterna entre a tela de login
 // do aluno e do professor
  document.getElementById('formAluno').style.display = tipo === 'aluno' ? 'block' : 'none';
 // Exibe formulario do aluno
 // e oculta o do professor
  document.getElementById('formProf').style.display = tipo === 'professor' ? 'block' : 'none';
 // Exibe formulario do professor
 // e oculta o do aluno
  document.getElementById('tabAluno').classList.toggle('active', tipo === 'aluno');
 // adicona destaque visual
 // na aba selecionada
  document.getElementById('tabProf').classList.toggle('active', tipo === 'professor');
}

// ========== LOGIN ALUNO ==========
function fazerLoginAluno() {
  const nome = document.getElementById('inputNome').value.trim();
  const escola = document.getElementById('inputEscola').value.trim();
  const serie = document.getElementById('inputSerie').value;
  let ok = true;
  ['erroNome','erroEscola','erroSerie'].forEach(id => document.getElementById(id).classList.remove('visible'));
  ['inputNome','inputEscola','inputSerie'].forEach(id => document.getElementById(id).classList.remove('error'));
  if (!nome) { document.getElementById('erroNome').classList.add('visible'); document.getElementById('inputNome').classList.add('error'); ok=false; }
  if (!escola) { document.getElementById('erroEscola').classList.add('visible'); document.getElementById('inputEscola').classList.add('error'); ok=false; }
  if (!serie) { document.getElementById('erroSerie').classList.add('visible'); document.getElementById('inputSerie').classList.add('error'); ok=false; }
  if (!ok) return;
  perfil = { tipo: 'aluno', nome, escola, serie, avatar: nome.charAt(0).toUpperCase() };
  iniciarApp();
}

// ========== LOGIN PROFESSOR ==========
function fazerLoginProf() {
  const nome = document.getElementById('inputNomeProf').value.trim();
  const escola = document.getElementById('inputEscolaProf').value.trim();
  const senha = document.getElementById('inputSenhaProf').value.trim();
  let ok = true;
  ['erroNomeProf','erroEscolaProf','erroSenhaProf'].forEach(id => document.getElementById(id).classList.remove('visible'));
  if (!nome) { document.getElementById('erroNomeProf').classList.add('visible'); ok=false; }
  if (!escola) { document.getElementById('erroEscolaProf').classList.add('visible'); ok=false; }
  if (!senha || senha !== 'prof2026') { document.getElementById('erroSenhaProf').classList.add('visible'); document.getElementById('erroSenhaProf').textContent = senha ? 'Código incorreto.' : 'Informe o código.'; ok=false; }
  if (!ok) return;
  perfil = { tipo: 'professor', nome, escola, serie: 'Professor', avatar: 'P' };
  iniciarApp();
}

// ========== INICIAR APP ==========
function iniciarApp() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('appView').classList.add('visible');
  document.getElementById('userName').textContent = perfil.nome;
  document.getElementById('userSerie').textContent = perfil.serie;
  document.getElementById('userEscolaLabel').textContent = perfil.escola;
  document.getElementById('userAvatar').textContent = perfil.avatar;
  document.getElementById('roleLabel').textContent = perfil.tipo === 'professor' ? 'Professor' : 'Aluno';
  document.getElementById('topbarBadge').textContent = perfil.tipo === 'professor' ? ' Professor' : ' Aluno'; 
  if (perfil.tipo === 'professor') {
    document.getElementById('userAvatar').classList.add('prof');
    buildSidebarProf();
    navegarPara('prof-questoes');
    renderizarQuestoesProfList();
  } else {
    buildSidebarAluno();
    navegarPara('dashboard');
    inicializarGraficos();
    atualizarDashboard();
    renderizarQuestoesProfParaAluno();
  }
}

// ========== SIDEBAR BUILDERS ==========
function buildSidebarAluno() {
  document.getElementById('sidebarNav').innerHTML = `
    <div class="nav-section">Aluno</div>
    <div class="nav-item" data-view="dashboard" onclick="navegarPara('dashboard')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Dashboard
    </div>
    <div class="nav-item" data-view="questao" onclick="navegarPara('questao')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Responder Questão
    </div>
    <div class="nav-item" data-view="historico" onclick="navegarPara('historico')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Histórico
    </div>`;
}

function buildSidebarProf() {
  document.getElementById('sidebarNav').innerHTML = `
    <div class="nav-section">Professor</div>
    <div class="nav-item" data-view="prof-questoes" onclick="navegarPara('prof-questoes')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>Banco de Questões
    </div>
    <div class="nav-item" data-view="prof-resultados" onclick="navegarPara('prof-resultados');renderizarResultadosProf()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Resultados dos Alunos
    </div>`;
}

// ========== NAVEGAÇÃO ==========
const TITULOS = {
  dashboard:'Dashboard', questao:'Responder Questão', historico:'Histórico', 'prof-questoes':'Banco de Questões', 'prof-resultados':'Resultados dos Alunos'
};
function navegarPara(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (nav) nav.classList.add('active');
  document.getElementById('topbarTitle').textContent = TITULOS[view] || view;
  if (view === 'dashboard') atualizarDashboard();
  if (view === 'historico') renderizarHistorico();
  if (window.innerWidth < 900) closeSidebar();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

// ========== SAIR ==========
function sair() {
  document.getElementById('appView').classList.remove('visible');
  document.getElementById('appView').style.display = 'none';
  document.getElementById('loginView').style.display = 'flex';
  historico = [];
  perfil = { tipo:'', nome:'', escola:'', serie:'', avatar:'' };
  document.getElementById('userAvatar').classList.remove('prof');
  setTimeout(() => { document.getElementById('appView').style.display = ''; }, 50);
}

// ========== DISCIPLINAS ==========
function selecionarDisc(btn) {
  // REMOVE A CLASSE 'ACTIVE' DAS ABAS  
  document.querySelectorAll('.disc-tab').forEach(t => t.classList.remove('active'));
  // ADICIONA 'ACTIVE' NA ABA CLICADA 
  btn.classList.add('active');
  // SALVA A DISCIPLINA SELECIONADA 
  discSelecionada = btn.dataset.disc;
  // RENDERIZA AS QUESTÕES DA DISCIPLINA 
  renderizarQuestoesProfParaAluno();
}

// ========== QUESTÕES DO PROFESSOR (exibir para aluno) ==========
function renderizarQuestoesProfParaAluno() {
  // VERIFICA SE O USUÁRIO É ALUNO 
  if (perfil.tipo !== 'aluno') return;
  const lista = getQuestoesDaEscola(perfil.escola).filter(q => q.area === discSelecionada);
  // PEGA OS ELEMENTOS HTML  
  const card = document.getElementById('questoesProfCard');
  const cont = document.getElementById('questoesProfLista');
  // ESCONDE O CARD SE NÃO EXISTIR OPÇÃO 
  if (!lista.length) { card.style.display = 'none'; return; }
  // MOSTRA O CARD 
  card.style.display = 'block';
  // NOMES DAS DISCIPLINA 
  const ALABEL = {ling:'Linguagens',hum:'Ciências Humanas',nat:'Ciências da Natureza',mat:'Matemática'};
  // CRIA LISTA DE QUESTÕES NA TELA 
  cont.innerHTML = lista.map((q,i) => `
  // CARD DA QUESTÃO 
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="usarQuestaoProf(${i})">
    // TEXTO DA QUESTÃO 
      <div style="font-weight:600;font-size:.88rem;margin-bottom:4px">${q.enunciado}</div>
      // TEXTO INFERIOR 
      <div style="font-size:.75rem;color:var(--text2)">Clique para usar esta questão ↑</div>
    </div>`).join('');
}

function usarQuestaoProf(indexLocal) {
  // PEGA AS QUESTÕES DA DISPLINA 
  const lista = getQuestoesDaEscola(perfil.escola).filter(q => q.area === discSelecionada);
  // PEGA A QUESTÃO SELECIONADA 
  const q = lista[indexLocal];
  // SE NÃO EXISTIR QUESTÃO 
  if (!q) return;
  // COLOCA A PERGUNTA NO CAMPO 
  document.getElementById('inputPergunta').value = q.enunciado;
  // LIMPA A RESPOSTA ANTERIOR 
  document.getElementById('inputResposta').value = '';
  //ESCONDE FEEDBACK ANTIGO
  document.getElementById('feedbackBox').style.display = 'none';
  // COLOCA O CURSOR NO CAMPO DE RESPOSTA 
  document.getElementById('inputResposta').focus();
}


// ========== ANALISAR ==========
function analisar() {

  // ===== 1. PEGAR E VALIDAR DADOS =====
  // Captura pergunta e resposta do usuário
  const pergunta = document.getElementById('inputPergunta').value.trim();
  const resposta = document.getElementById('inputResposta').value.trim();

  // Impede análise com campos vazios
  if (!pergunta || !resposta) {
    mostrarFeedback({
      tipo:'warning',
      titulo:'⚠️ Campos obrigatórios',
      explicacao:'Preencha o enunciado e sua resposta antes de continuar.',
      dica:'Tente digitar uma questão e a resposta nos campos acima.',
      padrao:null,
      correto:null,
      passos:null
    });
    return;
  }

  // ===== 2. ANALISAR RESPOSTA =====
  // Normaliza os textos para comparação
  const pergNorm = pergunta.toLowerCase().replace(/\s/g,'');
  const respNorm = resposta.toLowerCase().replace(/\s/g,'');

  let resultado = null;

  // Escolhe a análise conforme a disciplina
  if (discSelecionada === 'mat') {
    resultado = analisarMat(pergNorm, respNorm, pergunta, resposta);

  } else if (discSelecionada === 'ling') {
    resultado = analisarLing(resposta);

  } else if (discSelecionada === 'nat') {
    resultado = analisarNat(resposta);

  } else if (discSelecionada === 'hum') {
    resultado = analisarHum(resposta);
  }

  // ===== 3. COMPARAR COM GABARITO =====
  // Busca questão cadastrada pelo professor
  const questoesEscola = getQuestoesDaEscola(perfil.escola);

  const questaoProf = questoesEscola.find(
    q => q.enunciado.toLowerCase().replace(/\s/g,'') === pergNorm
  );

  if (questaoProf) {

    const gabNorm = questaoProf.gabarito.toLowerCase().replace(/\s/g,'');

    // Verifica se a resposta bate com o gabarito
    if (respNorm === gabNorm) {

      resultado = {
        tipo:'correct',
        titulo:'✅ Gabarito do professor: CORRETO!',
        padrao:null,
        explicacao:'Sua resposta corresponde exatamente ao gabarito informado pelo professor. Ótimo trabalho!',
        correto:null,
        passos:null,
        dica:null,
        dificuldade:null
      };

    } else {

      resultado = {
        tipo:'wrong',
        titulo:'❌ Gabarito do professor: INCORRETO',
        padrao: resultado ? resultado.padrao : PADROES.DESCONHECIDO,
        explicacao: resultado
          ? resultado.explicacao
          : `Resposta esperada: "${questaoProf.gabarito}". Você respondeu: "${resposta}".`,
        correto: questaoProf.gabarito,
        passos: resultado ? resultado.passos : null,
        dica: questaoProf.dica || (resultado ? resultado.dica : null),
        dificuldade: resultado ? resultado.dificuldade : null
      };
    }

    // Salva resultado para o professor
    const resultados = getResultadosDaEscola(perfil.escola);

    resultados.unshift({
      aluno: perfil.nome,
      escola: perfil.escola,
      area: discSelecionada,
      pergunta,
      resposta,
      resultado: resultado.tipo,
      padrao: resultado.padrao,
      timestamp: new Date().toLocaleString('pt-BR')
    });

    salvarResultadosDaEscola(perfil.escola, resultados.slice(0, 200));
  }

  // ===== 4. ATUALIZAR SISTEMA =====
  // Salva histórico e atualiza a interface
  historico.unshift({
    id:Date.now(),
    disciplina:discSelecionada,
    pergunta,
    resposta,
    resultado:resultado.tipo,
    padrao:resultado.padrao,
    dificuldade:resultado.dificuldade||null,
    timestamp:new Date().toLocaleTimeString('pt-BR',{
      hour:'2-digit',
      minute:'2-digit'
    })
  });

  mostrarFeedback(resultado);
  atualizarKpis();
  //Resumindo,essa função verifica se o gabarito tá igual ao que o professor passou,
  //Mas,não o por que,isso fica para o Analisadores por Área.
  
}

// ========== ANALISADORES POR ÁREA ==========

function analisarMat(pergNorm, respNorm, pergOrig, respOrig) {

  // ===== 1. QUESTÃO ESPECÍFICA =====
  // Trata manualmente a conta 2+2×3
  if (pergNorm === '2+2×3' || pergNorm === '2+2x3') {

    // Erro de prioridade das operações
    if (respNorm === '12')
      return {
        tipo:'wrong',
        titulo:'❌ Erro identificado',
        padrao:PADROES.PRIORIDADE_OPERACOES,
        explicacao:'Você provavelmente somou antes de multiplicar.',
        correto:'2×3=6 → 2+6=8',
        passos:[
          'Resolva a multiplicação primeiro',
          'Depois faça a soma'
        ],
        dica:'× e ÷ vêm antes de + e −',
        dificuldade:'Operações Mat.'
      };

    // Acertou parcialmente
    if (respNorm === '6')
      return {
        tipo:'wrong',
        titulo:'❌ Resposta parcial',
        padrao:PADROES.ATENCAO,
        explicacao:'Você esqueceu de somar o 2 inicial.',
        correto:'2+6=8',
        passos:[
          '2×3=6',
          '2+6=8'
        ],
        dica:'Confira toda a expressão.',
        dificuldade:'Atenção / Distração'
      };

    // Resposta correta
    if (respNorm === '8')
      return {
        tipo:'correct',
        titulo:'✅ Resposta correta!',
        padrao:null,
        explicacao:'Você aplicou corretamente a ordem das operações.',
        correto:null,
        passos:null,
        dica:null,
        dificuldade:null
      };
  }

  // Continua para análise automática
  return avaliarMat(pergNorm, respNorm);
}

function analisarLing(resposta) {

  // ===== 2. ANÁLISE DE LINGUAGENS =====
  // Conta quantidade de palavras
  const palavras = resposta.trim().split(/\s+/).length;

  // Resposta curta
  if (palavras < 5)
    return {
      tipo:'wrong',
      titulo:'❌ Resposta muito curta',
      padrao:PADROES.RESPOSTA_CURTA,
      explicacao:'A resposta precisa de mais desenvolvimento.',
      correto:null,
      passos:[
        'Explique a ideia',
        'Dê exemplo',
        'Justifique'
      ],
      dica:'Use frases completas.',
      dificuldade:'Interpretação Text.'
    };

  // Resposta parcialmente desenvolvida
  if (palavras < 15)
    return {
      tipo:'warning',
      titulo:'⚠️ Resposta parcialmente desenvolvida',
      padrao:PADROES.INTERPRETACAO,
      explicacao:'Sua resposta pode ser mais detalhada.',
      correto:null,
      passos:[
        'Adicione detalhes',
        'Use exemplos',
        'Conclua a ideia'
      ],
      dica:'Desenvolva melhor o raciocínio.',
      dificuldade:'Interpretação Text.'
    };

  // Boa resposta
  return {
    tipo:'correct',
    titulo:'✅ Boa resposta!',
    padrao:null,
    explicacao:'A resposta está bem desenvolvida.',
    correto:null,
    passos:null,
    dica:null,
    dificuldade:null
  };
}

function analisarNat(resposta) {

  // ===== 3. ANÁLISE DE CIÊNCIAS =====
  // Procura termos científicos
  const palavrasChave = [
    'energia','corpo','nutrientes','célula',
    'fotossíntese','átomo','molécula'
  ];

  const temConceito = palavrasChave.some(
    p => resposta.toLowerCase().includes(p)
  );

  const palavras = resposta.trim().split(/\s+/).length;

  // Sem conceitos científicos
  if (!temConceito)
    return {
      tipo:'wrong',
      titulo:'❌ Falta justificativa científica',
      padrao:PADROES.SEM_JUSTIFICATIVA,
      explicacao:'A resposta não usou conceitos científicos.',
      correto:null,
      passos:[
        'Use termos científicos',
        'Explique o fenômeno'
      ],
      dica:'Inclua conceitos da área.',
      dificuldade:'Conceitos Científicos'
    };

  // Explicação curta
  if (palavras < 10)
    return {
      tipo:'warning',
      titulo:'⚠️ Conceito incompleto',
      padrao:PADROES.RESPOSTA_CURTA,
      explicacao:'A explicação ficou muito breve.',
      correto:null,
      passos:[
        'Explique melhor',
        'Mostre aplicações'
      ],
      dica:'Desenvolva mais a resposta.',
      dificuldade:'Justif. Científica'
    };

  // Resposta boa
  return {
    tipo:'correct',
    titulo:'✅ Boa fundamentação científica!',
    padrao:null,
    explicacao:'A resposta está bem fundamentada.',
    correto:null,
    passos:null,
    dica:null,
    dificuldade:null
  };
}

function analisarHum(resposta) {

  // ===== 4. ANÁLISE DE HUMANAS =====
  // Verifica uso de conceitos históricos e sociais
  const termosHum = [
    'história','cultura','sociedade',
    'política','economia','governo'
  ];

  const temConceito = termosHum.some(
    p => resposta.toLowerCase().includes(p)
  );

  const palavras = resposta.trim().split(/\s+/).length;

  // Resposta muito curta
  if (palavras < 5)
    return {
      tipo:'wrong',
      titulo:'❌ Resposta muito curta',
      padrao:PADROES.RESPOSTA_CURTA,
      explicacao:'Faltou contextualização.',
      correto:null,
      passos:[
        'Explique o contexto',
        'Mostre causas e consequências'
      ],
      dica:'Relacione ao contexto histórico/social.',
      dificuldade:'Análise Histórica'
    };

  // Sem conceitos da área
  if (!temConceito)
    return {
      tipo:'warning',
      titulo:'⚠️ Falta contextualização',
      padrao:PADROES.INTERPRETACAO,
      explicacao:'Use termos das Ciências Humanas.',
      correto:null,
      passos:[
        'Use conceitos históricos',
        'Situe tempo e espaço'
      ],
      dica:'Inclua vocabulário da área.',
      dificuldade:'Análise Histórica'
    };

  // Resposta pouco desenvolvida
  if (palavras < 15)
    return {
      tipo:'warning',
      titulo:'⚠️ Análise incompleta',
      padrao:PADROES.INTERPRETACAO,
      explicacao:'A análise pode ser aprofundada.',
      correto:null,
      passos:[
        'Explique causas',
        'Mostre consequências'
      ],
      dica:'Desenvolva melhor a análise.',
      dificuldade:'Análise Histórica'
    };

  // Resposta correta
  return {
    tipo:'correct',
    titulo:'✅ Boa análise!',
    padrao:null,
    explicacao:'A resposta demonstra boa contextualização.',
    correto:null,
    passos:null,
    dica:null,
    dificuldade:null
  };
}

function avaliarMat(pergNorm, respNorm) {

  // ===== 5. CÁLCULO AUTOMÁTICO =====
  // Converte símbolos matemáticos
  try {

    const expr = pergNorm
      .replace(/x/g,'*')
      .replace(/÷/g,'/')
      .replace(/[^0-9+\-*/().]/g,'');

    // Calcula resultado correto
    const correta = Function(
      '"use strict"; return (' + expr + ')'
    )();

    if (isNaN(correta) || !isFinite(correta))
      throw new Error('invalid');

    // Resposta correta
    if (Number(respNorm) === correta)
      return {
        tipo:'correct',
        titulo:'✅ Resposta correta!',
        padrao:null,
        explicacao:'Você resolveu corretamente.',
        correto:null,
        passos:null,
        dica:null,
        dificuldade:null
      };

    // Analisa diferença da resposta
    const diff = Math.abs(Number(respNorm) - correta);

    let padrao = PADROES.CALCULO;
    let dica = 'Refaça os cálculos.';

    // Pequeno erro de atenção
    if (diff <= 1) {
      padrao = PADROES.ATENCAO;
      dica = 'Pode ter sido erro de distração.';
    }

    return {
      tipo:'wrong',
      titulo:'❌ Resultado incorreto',
      padrao,
      explicacao:`O correto é ${correta}.`,
      correto:String(correta),
      passos:[
        'Resolva passo a passo',
        'Confira as operações'
      ],
      dica,
      dificuldade:'Operações Mat.'
    };

  } catch {

    // Erro ao interpretar expressão
    return {
      tipo:'warning',
      titulo:'⚠️ Questão não reconhecida',
      padrao:null,
      explicacao:'Não foi possível interpretar a conta.',
      correto:null,
      passos:null,
      dica:'Use apenas números e operadores.',
      dificuldade:null
    };
  }
}

function mostrarFeedback(r) {

  // ===== 6. EXIBIR FEEDBACK =====
  // Define estilo visual do resultado
  const box = document.getElementById('feedbackBox');

  const cor =
    r.tipo === 'correct'
      ? 'correct'
      : r.tipo === 'wrong'
      ? 'wrong'
      : 'warning';

  const icon =
    r.tipo === 'correct'
      ? 'check-circle'
      : r.tipo === 'wrong'
      ? 'x-circle'
      : 'alert-triangle';

  // Monta HTML do feedback
  let html = `<div class="feedback-box ${cor}">`;

  html += `<div class="feedback-header"><span style="font-size:1.1rem">${r.titulo}</span></div>`;

  html += `<div class="feedback-body ${cor}">`;

  if (r.padrao)
    html += `<div class="error-pattern-badge">🏷 ${r.padrao}</div>`;

  html += `<div class="feedback-section"><div class="feedback-section-title">Diagnóstico</div><p class="feedback-text">${r.explicacao}</p></div>`;

  if (r.correto)
    html += `<div class="feedback-section"><div class="feedback-section-title">Resultado correto</div><p class="feedback-text"><strong>${r.correto}</strong></p></div>`;

  // Mostra passos de resolução
  if (r.passos && r.passos.length) {

    html += `<div class="feedback-section"><div class="feedback-section-title">Raciocínio correto</div><ul class="feedback-steps">`;

    r.passos.forEach((p,i) => {
      html += `<li><span class="step-num">${i+1}</span><span>${p}</span></li>`;
    });

    html += '</ul></div>';
  }

  // Mostra dica extra
  if (r.dica)
    html += `<div class="tip-box"><span>💡</span><p><strong>Dica:</strong> ${r.dica}</p></div>`;

  html += '</div></div>';

  // Exibe na tela
  box.innerHTML = html;
  box.style.display = 'block';

  box.scrollIntoView({
    behavior:'smooth',
    block:'nearest'
  });
}

function limpar() {

  // ===== 7. LIMPAR CAMPOS =====
  // Reseta formulário e feedback
  document.getElementById('inputPergunta').value = '';

  document.getElementById('inputResposta').value = '';

  document.getElementById('feedbackBox').style.display = 'none';

  document.getElementById('feedbackBox').innerHTML = '';
}

// ========== DASHBOARD ==========
function atualizarKpis() {
  const total = historico.length;
  const acertos = historico.filter(h => h.resultado === 'correct').length;
  const erros = total - acertos;
  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiAcertos').textContent = acertos;
  document.getElementById('kpiErros').textContent = erros;
  document.getElementById('kpiTaxa').textContent = total > 0 ? Math.round((acertos/total)*100)+'%' : '—';
}

function atualizarDashboard() {
  atualizarKpis();
  const acertos = historico.filter(h => h.resultado === 'correct').length;
  const erros = historico.length - acertos;
  if (grafDesempenho) { grafDesempenho.data.datasets[0].data = [acertos, erros]; grafDesempenho.update(); }
  const areas = { ling:0, hum:0, nat:0, mat:0 };
  historico.forEach(h => { if (areas[h.disciplina] !== undefined) areas[h.disciplina]++; });
  if (grafDisciplinas) { grafDisciplinas.data.datasets[0].data = Object.values(areas); grafDisciplinas.update(); }
  const diffs = { 'Operações Mat.':0, 'Interpretação Text.':0, 'Conceitos Científicos':0, 'Justif. Científica':0, 'Atenção / Distração':0, 'Análise Histórica':0 };
  historico.forEach(h => { if (h.dificuldade && diffs[h.dificuldade] !== undefined) diffs[h.dificuldade]++; });
  const total = historico.length || 1;
  Object.values(diffs).forEach((v,i) => {
    const pct = Math.round((v/total)*100);
    const bar = document.getElementById('diff'+i);
    const pctEl = document.getElementById('diffp'+i);
    if (bar) bar.style.width = pct+'%';
    if (pctEl) pctEl.textContent = total > 1 ? pct+'%' : '—';
  });
}

function inicializarGraficos() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const textColor = isDark ? '#8b8fa8' : '#7a7974';
  const gridColor = isDark ? 'rgba(46,49,72,0.7)' : 'rgba(212,209,202,0.7)';
  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;
  Chart.defaults.font.family = "'Inter', sans-serif";
  const ctxD = document.getElementById('graficoDesempenho').getContext('2d');
  if (grafDesempenho) grafDesempenho.destroy();
  grafDesempenho = new Chart(ctxD, { type:'bar', data:{ labels:['Acertos','Erros'], datasets:[{ data:[0,0], backgroundColor:['rgba(79,152,163,0.8)','rgba(209,99,167,0.7)'], borderColor:['rgba(79,152,163,1)','rgba(209,99,167,1)'], borderWidth:1.5, borderRadius:6, borderSkipped:false }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1},grid:{color:gridColor}},x:{grid:{display:false}}} } });
  const ctxDis = document.getElementById('graficoDisciplinas').getContext('2d');
  if (grafDisciplinas) grafDisciplinas.destroy();
  grafDisciplinas = new Chart(ctxDis, { type:'doughnut', data:{ labels:['Linguagens','Ciências Humanas','Ciências da Natureza','Matemática'], datasets:[{ data:[0,0,0,0], backgroundColor:['rgba(232,175,52,0.85)','rgba(85,145,199,0.85)','rgba(109,170,69,0.85)','rgba(209,99,167,0.85)'], borderColor:isDark?'#161821':'#f9f8f5', borderWidth:3 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{padding:14,boxWidth:10,usePointStyle:true}}}, cutout:'60%' } });
}

// ========== HISTÓRICO ==========
const DISC_LABELS = { ling:'Linguagens', hum:'Ciências Humanas', nat:'Ciências da Natureza', mat:'Matemática' };

function renderizarHistorico() {
  const container = document.getElementById('historicoList');
  if (!historico.length) {
    container.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg><h3>Nenhuma questão respondida</h3><p>Vá para "Responder Questão" e comece a praticar!</p></div>`;
    return;
  }
  container.innerHTML = '<div class="history-list">' + historico.map(h => `
    <div class="history-item">
      <div class="history-icon ${h.resultado === 'correct' ? 'correct' : 'wrong'}">${h.resultado === 'correct' ? '✓' : '✗'}</div>
      <div class="history-info">
        <div class="history-question">${h.pergunta}</div>
        <div class="history-meta"><span class="disc-chip ${h.disciplina}">${DISC_LABELS[h.disciplina]}</span><span style="font-size:.75rem;color:var(--text2)">${h.timestamp}</span></div>
        <div class="history-answer">Resposta: <em>${h.resposta}</em></div>
        ${h.padrao ? `<div class="history-error-type">🏷 ${h.padrao}</div>` : ''}
      </div>
    </div>`).join('') + '</div>';
}

function limparHistorico() {
  if (!historico.length) return;
  historico = [];
  renderizarHistorico();
  atualizarDashboard();
}

// ========== PROFESSOR — ADICIONAR QUESTÃO ==========
function adicionarQuestaoPro() {
  // PEGA O ENUNCIADO 
  const enunciado = document.getElementById('profEnunciado').value.trim();
  // PEGA GABARITO 
  const gabarito = document.getElementById('profGabarito').value.trim();
  // PEGA POR ÁREA/DISCIPLINA 
  const area = document.getElementById('profArea').value;
  // PEGA A DICA 
  const dica = document.getElementById('profDica').value.trim();
  // VERIFICA SE ENUNCIADO E GABARITO FORAM ESCRITOS 
  if (!enunciado || !gabarito) { alert('Preencha o enunciado e o gabarito.'); return; }
  const lista = getQuestoesDaEscola(perfil.escola);
  // ADICIONA A NOVA QUESTÃO 
  lista.push({ id:Date.now(), enunciado, gabarito, area, dica, escola:perfil.escola, professor:perfil.nome, criado:new Date().toLocaleString('pt-BR') });
  // SALVA AS QUESTÕES 
  salvarQuestoesDaEscola(perfil.escola, lista);
  // LIMPA O CAMPO DO ENUNCIADO 
  document.getElementById('profEnunciado').value = '';
  // LIMPA O ESPAÇO DO GABARITO 
  document.getElementById('profGabarito').value = '';
  document.getElementById('profDica').value = '';
  const msg = document.getElementById('profMsgOk');
  msg.style.display = 'flex';
  setTimeout(() => msg.style.display = 'none', 2500);
  renderizarQuestoesProfList();
}

function renderizarQuestoesProfList() {
  const lista = getQuestoesDaEscola(perfil.escola);
  const cont = document.getElementById('profListaQuestoes');
  if (!lista.length) {
    cont.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>Nenhuma questão adicionada</h3><p>Use o formulário acima para adicionar questões.</p></div>`;
    return;
  }
  const ALABEL = {ling:'Linguagens',hum:'Ciências Humanas',nat:'Ciências da Natureza',mat:'Matemática'};
  // contar resultados por questão
  const resultados = getResultadosDaEscola(perfil.escola);
  cont.innerHTML = '<div class="questoes-lista">' + lista.map((q,i) => {
    const resQ = resultados.filter(r => r.pergunta.toLowerCase().replace(/\s/g,'') === q.enunciado.toLowerCase().replace(/\s/g,''));
    const ok = resQ.filter(r => r.resultado === 'correct').length;
    const err = resQ.filter(r => r.resultado !== 'correct').length;
    return `<div class="questao-item-prof">
      <div class="qi-header">
        <div class="qi-text">${q.enunciado}</div>
        <div class="qi-meta">
          <span class="qi-area ${q.area}">${ALABEL[q.area]}</span>
          <button class="btn-del" onclick="excluirQuestaoProf(${i})">✕</button>
        </div>
      </div>
      <div class="qi-gabarito">Gabarito: <strong>${q.gabarito}</strong> ${q.dica ? `| Dica: <em>${q.dica}</em>` : ''}</div>
      <div style="font-size:.73rem;color:var(--text2)">Por: ${q.professor} · ${q.criado}</div>
      <div class="qi-stats">
        <span class="ok">✓ ${ok} acertos</span>
        <span class="err">✗ ${err} erros</span>
        <span style="color:var(--text2)">${resQ.length} respostas</span>
      </div>
    </div>`;
  }).join('') + '</div>';
}

function excluirQuestaoProf(index) {
  if (!confirm('Excluir esta questão?')) return;
  const lista = getQuestoesDaEscola(perfil.escola);
  lista.splice(index, 1);
  salvarQuestoesDaEscola(perfil.escola, lista);
  renderizarQuestoesProfList();
}

// ========== PROFESSOR — RESULTADOS ==========
function renderizarResultadosProf() {
  const resultados = getResultadosDaEscola(perfil.escola);
  const total = resultados.length;
  const acertos = resultados.filter(r => r.resultado === 'correct').length;
  const erros = total - acertos;
  const alunos = new Set(resultados.map(r => r.aluno)).size;
  document.getElementById('profKpiTotal').textContent = total;
  document.getElementById('profKpiAcertos').textContent = acertos;
  document.getElementById('profKpiErros').textContent = erros;
  document.getElementById('profKpiAlunos').textContent = alunos;
  const tbody = document.getElementById('profTabelaResultados');
  if (!total) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text2);padding:20px">Nenhum resultado ainda.</td></tr>'; }
  else {
    const ALABEL = {ling:'Ling.',hum:'Humanas',nat:'Natureza',mat:'Mat.'};
    tbody.innerHTML = resultados.slice(0,50).map(r => `
      <tr>
        <td>${r.aluno}</td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.pergunta}</td>
        <td><span class="disc-chip ${r.area}">${ALABEL[r.area]||r.area}</span></td>
        <td>${r.resultado==='correct'?'<span class="badge-ok">✓ Acerto</span>':r.resultado==='wrong'?'<span class="badge-err">✗ Erro</span>':'<span class="badge-warn">⚠ Parcial</span>'}</td>
        <td style="font-size:.78rem;color:var(--text2)">${r.padrao||'—'}</td>
        <td style="font-size:.75rem;color:var(--text2)">${r.timestamp}</td>
      </tr>`).join('');
  }
  // erros frequentes
  const freq = {};
  resultados.filter(r => r.padrao).forEach(r => { freq[r.padrao] = (freq[r.padrao]||0)+1; });
  const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]);
  const errFreq = document.getElementById('profErrFreq');
  if (!sorted.length) { errFreq.innerHTML = '<p style="color:var(--text2);font-size:.85rem">Nenhum padrão de erro registrado ainda.</p>'; }
  else {
    const max = sorted[0][1] || 1;
    errFreq.innerHTML = sorted.map(([nome,n]) => `
      <div class="diff-row">
        <span class="diff-name">${nome}</span>
        <div class="diff-track"><div class="diff-bar" style="width:${Math.round((n/max)*100)}%"></div></div>
        <span class="diff-pct">${n}x</span>
      </div>`).join('');
  }
}

// ========== TEMA ==========
function toggleTheme() {
  const r = document.documentElement;
  const isDark = r.dataset.theme === 'dark';
  r.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeIcon').textContent = isDark ? '🌙' : '☀️';
  document.getElementById('themeLabel').textContent = isDark ? 'Tema escuro' : 'Tema claro';
  if (typeof inicializarGraficos === 'function' && document.getElementById('graficoDesempenho')) {
    inicializarGraficos();
    atualizarDashboard();
  }
}

// Inicializar ícone de tema
(function(){
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDark ? 'Tema claro' : 'Tema escuro';
})();

// Enter para analisar
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    if (document.getElementById('view-questao').classList.contains('active')) analisar();
  }
});
