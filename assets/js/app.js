
// ========== ESTADO GLOBAL ==========
let perfil = { tipo: '', nome: '', escola: '', serie: '', avatar: '' };
let historico = [];
let discSelecionada = 'ling';
let grafDesempenho = null;
let grafDisciplinas = null;

// ========== PADRÕES DE ERRO ==========
const PADROES = {
  PRIORIDADE_OPERACOES: 'Erro de prioridade de operações',
  CALCULO: 'Erro de cálculo',
  INTERPRETACAO: 'Erro de interpretação',
  RESPOSTA_CURTA: 'Resposta incompleta',
  SEM_JUSTIFICATIVA: 'Ausência de justificativa científica',
  ATENCAO: 'Erro de atenção',
  ANALISE_HISTORICA: 'Dificuldade de análise histórica',
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
  document.getElementById('formAluno').style.display = tipo === 'aluno' ? 'block' : 'none';
  document.getElementById('formProf').style.display = tipo === 'professor' ? 'block' : 'none';
  document.getElementById('tabAluno').classList.toggle('active', tipo === 'aluno');
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
  if (!senha || senha !== 'prof2024') { document.getElementById('erroSenhaProf').classList.add('visible'); document.getElementById('erroSenhaProf').textContent = senha ? 'Código incorreto.' : 'Informe o código.'; ok=false; }
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
  document.querySelectorAll('.disc-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  discSelecionada = btn.dataset.disc;
  renderizarQuestoesProfParaAluno();
}

// ========== QUESTÕES DO PROFESSOR (exibir para aluno) ==========
function renderizarQuestoesProfParaAluno() {
  if (perfil.tipo !== 'aluno') return;
  const lista = getQuestoesDaEscola(perfil.escola).filter(q => q.area === discSelecionada);
  const card = document.getElementById('questoesProfCard');
  const cont = document.getElementById('questoesProfLista');
  if (!lista.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  const ALABEL = {ling:'Linguagens',hum:'Ciências Humanas',nat:'Ciências da Natureza',mat:'Matemática'};
  cont.innerHTML = lista.map((q,i) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="usarQuestaoProf(${i})">
      <div style="font-weight:600;font-size:.88rem;margin-bottom:4px">${q.enunciado}</div>
      <div style="font-size:.75rem;color:var(--text2)">Clique para usar esta questão ↑</div>
    </div>`).join('');
}

function usarQuestaoProf(indexLocal) {
  const lista = getQuestoesDaEscola(perfil.escola).filter(q => q.area === discSelecionada);
  const q = lista[indexLocal];
  if (!q) return;
  document.getElementById('inputPergunta').value = q.enunciado;
  document.getElementById('inputResposta').value = '';
  document.getElementById('feedbackBox').style.display = 'none';
  document.getElementById('inputResposta').focus();
}

// ========== ANALISAR ==========
function analisar() {
  const pergunta = document.getElementById('inputPergunta').value.trim();
  const resposta = document.getElementById('inputResposta').value.trim();
  if (!pergunta || !resposta) {
    mostrarFeedback({ tipo:'warning', titulo:'⚠️ Campos obrigatórios', explicacao:'Preencha o enunciado e sua resposta antes de continuar.', dica:'Tente digitar uma questão e a resposta nos campos acima.', padrao:null, correto:null, passos:null });
    return;
  }
  const pergNorm = pergunta.toLowerCase().replace(/\s/g,'');
  const respNorm = resposta.toLowerCase().replace(/\s/g,'');
  let resultado = null;

  if (discSelecionada === 'mat') {
    resultado = analisarMat(pergNorm, respNorm, pergunta, resposta);
  } else if (discSelecionada === 'ling') {
    resultado = analisarLing(resposta);
  } else if (discSelecionada === 'nat') {
    resultado = analisarNat(resposta);
  } else if (discSelecionada === 'hum') {
    resultado = analisarHum(resposta);
  }

  // verificar se bate com gabarito do professor
  const questoesEscola = getQuestoesDaEscola(perfil.escola);
  const questaoProf = questoesEscola.find(q => q.enunciado.toLowerCase().replace(/\s/g,'') === pergNorm);
  if (questaoProf) {
    const gabNorm = questaoProf.gabarito.toLowerCase().replace(/\s/g,'');
    if (respNorm === gabNorm) {
      resultado = { tipo:'correct', titulo:'✅ Gabarito do professor: CORRETO!', padrao:null, explicacao:'Sua resposta corresponde exatamente ao gabarito informado pelo professor. Ótimo trabalho!', correto:null, passos:null, dica:null, dificuldade:null };
    } else {
      resultado = { tipo:'wrong', titulo:'❌ Gabarito do professor: INCORRETO', padrao: resultado ? resultado.padrao : PADROES.DESCONHECIDO, explicacao: resultado ? resultado.explicacao : `Resposta esperada: "${questaoProf.gabarito}". Você respondeu: "${resposta}".`, correto: questaoProf.gabarito, passos: resultado ? resultado.passos : null, dica: questaoProf.dica || (resultado ? resultado.dica : null), dificuldade: resultado ? resultado.dificuldade : null };
    }
    // salvar resultado para o professor ver
    const resultados = getResultadosDaEscola(perfil.escola);
    resultados.unshift({ aluno: perfil.nome, escola: perfil.escola, area: discSelecionada, pergunta, resposta, resultado: resultado.tipo, padrao: resultado.padrao, timestamp: new Date().toLocaleString('pt-BR') });
    salvarResultadosDaEscola(perfil.escola, resultados.slice(0, 200));
  }

  historico.unshift({ id:Date.now(), disciplina:discSelecionada, pergunta, resposta, resultado:resultado.tipo, padrao:resultado.padrao, dificuldade:resultado.dificuldade||null, timestamp:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) });

  mostrarFeedback(resultado);
  atualizarKpis();
}

// ========== ANALISADORES POR ÁREA ==========
function analisarMat(pergNorm, respNorm, pergOrig, respOrig) {
  if (pergNorm === '2+2×3' || pergNorm === '2+2x3') {
    if (respNorm === '12') return { tipo:'wrong', titulo:'❌ Erro identificado', padrao:PADROES.PRIORIDADE_OPERACOES, explicacao:'Você provavelmente somou 2+2=4 primeiro e depois multiplicou 4×3=12. Isso indica dificuldade com a ordem de prioridade das operações.', correto:'2×3=6 → 2+6=8', passos:['Identifique as operações: adição e multiplicação','Resolva a multiplicação primeiro: 2×3=6','Depois some: 2+6=8'], dica:'Memorize: Parênteses → Potências → × e ÷ → + e −', dificuldade:'Operações Mat.' };
    if (respNorm === '6') return { tipo:'wrong', titulo:'❌ Resposta parcial', padrao:PADROES.ATENCAO, explicacao:'Você fez a multiplicação corretamente (2×3=6) mas esqueceu de somar o 2 do início.', correto:'2+6=8', passos:['Você acertou: 2×3=6 ✓','Faltou: 2+6=8'], dica:'Releia toda a expressão antes de dar a resposta final.', dificuldade:'Atenção / Distração' };
    if (respNorm === '8') return { tipo:'correct', titulo:'✅ Resposta correta!', padrao:null, explicacao:'Excelente! Você aplicou corretamente a ordem das operações.', correto:null, passos:null, dica:null, dificuldade:null };
  }
  return avaliarMat(pergNorm, respNorm);
}

function analisarLing(resposta) {
  const palavras = resposta.trim().split(/\s+/).length;
  if (palavras < 5) return { tipo:'wrong', titulo:'❌ Resposta muito curta', padrao:PADROES.RESPOSTA_CURTA, explicacao:'Em Linguagens, espera-se argumentação desenvolvida com definição, exemplo e explicação. Sua resposta está muito breve.', correto:null, passos:['Apresente a ideia principal','Dê um exemplo concreto','Explique ou justifique'], dica:'Uma boa resposta de Linguagens tem ao menos 2-3 frases completas que explicam seu raciocínio.', dificuldade:'Interpretação Text.' };
  if (palavras < 15) return { tipo:'warning', titulo:'⚠️ Resposta parcialmente desenvolvida', padrao:PADROES.INTERPRETACAO, explicacao:'Sua resposta começou bem, mas pode ser mais desenvolvida. Tente incluir exemplos ou justificativas mais detalhadas.', correto:null, passos:['Aprofunde com mais detalhes','Inclua um exemplo prático','Conclua com síntese'], dica:'Use pelo menos 3 parágrafos: introdução, desenvolvimento e conclusão.', dificuldade:'Interpretação Text.' };
  return { tipo:'correct', titulo:'✅ Boa resposta!', padrao:null, explicacao:'O sistema identificou uma tentativa consistente de argumentação e desenvolvimento textual. Continue assim!', correto:null, passos:null, dica:null, dificuldade:null };
}

function analisarNat(resposta) {
  const palavrasChave = ['energia','corpo','nutrientes','célula','fotossíntese','átomo','molécula','força','calor','luz','reação','elemento','proteína','carboidrato','respiração','osmose','difusão','evolução','ecossistema','biodiversidade','genética','dna','rna'];
  const temConceito = palavrasChave.some(p => resposta.toLowerCase().includes(p));
  const palavras = resposta.trim().split(/\s+/).length;
  if (!temConceito) return { tipo:'wrong', titulo:'❌ Falta justificativa científica', padrao:PADROES.SEM_JUSTIFICATIVA, explicacao:'Sua resposta não apresentou conceitos científicos relevantes. Em Ciências da Natureza é essencial fundamentar com terminologia da área.', correto:null, passos:['Identifique o tema científico','Use termos técnicos (célula, energia, reação...)','Relacione os conceitos ao fenômeno'], dica:'Releia o conteúdo e identifique termos científicos relacionados.', dificuldade:'Conceitos Científicos' };
  if (palavras < 10) return { tipo:'warning', titulo:'⚠️ Conceito incompleto', padrao:PADROES.RESPOSTA_CURTA, explicacao:'Você usou termos científicos, mas a explicação ficou muito breve. Desenvolva mais a relação entre os conceitos.', correto:null, passos:['Explique o que o conceito significa','Mostre como se aplica à questão','Dê um exemplo ou consequência'], dica:'Expanda explicando o porquê do fenômeno, não apenas o que acontece.', dificuldade:'Justif. Científica' };
  return { tipo:'correct', titulo:'✅ Boa fundamentação científica!', padrao:null, explicacao:'Sua resposta apresenta conceitos científicos relevantes e está bem desenvolvida. Excelente!', correto:null, passos:null, dica:null, dificuldade:null };
}

function analisarHum(resposta) {
  const termosHum = ['história','cultura','sociedade','política','economia','governo','direito','cidadania','revolução','guerra','período','século','democracia','ditadura','capitalismo','socialismo','feudalismo','geografia','território','população','espaço','região','globalização','imperialismo','colonização'];
  const temConceito = termosHum.some(p => resposta.toLowerCase().includes(p));
  const palavras = resposta.trim().split(/\s+/).length;
  if (palavras < 5) return { tipo:'wrong', titulo:'❌ Resposta muito curta', padrao:PADROES.RESPOSTA_CURTA, explicacao:'Em Ciências Humanas, a argumentação precisa ser bem fundamentada com contexto histórico, geográfico ou social.', correto:null, passos:['Contextualize o período ou local','Apresente os agentes envolvidos','Explique as causas e consequências'], dica:'Em Humanas, sempre relacione o tema ao contexto histórico ou social em que ocorreu.', dificuldade:'Análise Histórica' };
  if (!temConceito) return { tipo:'warning', titulo:'⚠️ Falta contextualização', padrao:PADROES.INTERPRETACAO, explicacao:'Sua resposta não usou termos das Ciências Humanas. Tente incluir conceitos de história, geografia, sociologia ou política.', correto:null, passos:['Use vocabulário da disciplina','Situe o acontecimento no tempo e espaço','Analise causas e consequências'], dica:'Termos como "período", "território", "sociedade" enriquecem a resposta.', dificuldade:'Análise Histórica' };
  if (palavras < 15) return { tipo:'warning', titulo:'⚠️ Análise incompleta', padrao:PADROES.INTERPRETACAO, explicacao:'Você usou termos corretos, mas a análise pode ser mais aprofundada. Explore mais as relações de causa e efeito.', correto:null, passos:['Desenvolva as causas','Explique as consequências','Relacione com o presente'], dica:'Analise sempre: Quem? Quando? Onde? Por quê? Com quais consequências?', dificuldade:'Análise Histórica' };
  return { tipo:'correct', titulo:'✅ Boa análise!', padrao:null, explicacao:'Sua resposta demonstra compreensão contextualizada do tema em Ciências Humanas. Parabéns!', correto:null, passos:null, dica:null, dificuldade:null };
}

function avaliarMat(pergNorm, respNorm) {
  try {
    const expr = pergNorm.replace(/x/g,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/().]/g,'');
    const correta = Function('"use strict"; return (' + expr + ')')();
    if (isNaN(correta) || !isFinite(correta)) throw new Error('invalid');
    if (Number(respNorm) === correta) return { tipo:'correct', titulo:'✅ Resposta correta!', padrao:null, explicacao:'Muito bem! Você resolveu corretamente a expressão matemática.', correto:null, passos:null, dica:null, dificuldade:null };
    const diff = Math.abs(Number(respNorm) - correta);
    let padrao = PADROES.CALCULO;
    let dica = 'Refaça os cálculos passo a passo.';
    if (diff <= 1) { padrao = PADROES.ATENCAO; dica = 'Verifique se não trocou um dígito ou cometeu um pequeno erro de atenção.'; }
    return { tipo:'wrong', titulo:'❌ Resultado incorreto', padrao, explicacao:`Sua resposta foi ${respNorm}, mas o resultado correto é ${correta}. Verifique cada passo.`, correto:String(correta), passos:['Identifique todas as operações','Resolva seguindo a ordem: ×÷ antes de +−','Confirme cada resultado parcial'], dica, dificuldade:'Operações Mat.' };
  } catch {
    return { tipo:'warning', titulo:'⚠️ Questão não reconhecida', padrao:null, explicacao:'Não foi possível interpretar a expressão matemática. Verifique se digitou corretamente.', correto:null, passos:null, dica:'Use apenas números e operadores + − × ÷', dificuldade:null };
  }
}

function mostrarFeedback(r) {
  const box = document.getElementById('feedbackBox');
  const cor = r.tipo === 'correct' ? 'correct' : r.tipo === 'wrong' ? 'wrong' : 'warning';
  const icon = r.tipo === 'correct' ? 'check-circle' : r.tipo === 'wrong' ? 'x-circle' : 'alert-triangle';
  let html = `<div class="feedback-box ${cor}">`;
  html += `<div class="feedback-header"><span style="font-size:1.1rem">${r.titulo}</span></div>`;
  html += `<div class="feedback-body ${cor}">`;
  if (r.padrao) html += `<div class="error-pattern-badge">🏷 ${r.padrao}</div>`;
  html += `<div class="feedback-section"><div class="feedback-section-title">Diagnóstico</div><p class="feedback-text">${r.explicacao}</p></div>`;
  if (r.correto) html += `<div class="feedback-section"><div class="feedback-section-title">Resultado correto</div><p class="feedback-text"><strong>${r.correto}</strong></p></div>`;
  if (r.passos && r.passos.length) {
    html += `<div class="feedback-section"><div class="feedback-section-title">Raciocínio correto</div><ul class="feedback-steps">`;
    r.passos.forEach((p,i) => { html += `<li><span class="step-num">${i+1}</span><span>${p}</span></li>`; });
    html += '</ul></div>';
  }
  if (r.dica) html += `<div class="tip-box"><span>💡</span><p><strong>Dica:</strong> ${r.dica}</p></div>`;
  html += '</div></div>';
  box.innerHTML = html;
  box.style.display = 'block';
  box.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function limpar() {
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
  const enunciado = document.getElementById('profEnunciado').value.trim();
  const gabarito = document.getElementById('profGabarito').value.trim();
  const area = document.getElementById('profArea').value;
  const dica = document.getElementById('profDica').value.trim();
  if (!enunciado || !gabarito) { alert('Preencha o enunciado e o gabarito.'); return; }
  const lista = getQuestoesDaEscola(perfil.escola);
  lista.push({ id:Date.now(), enunciado, gabarito, area, dica, escola:perfil.escola, professor:perfil.nome, criado:new Date().toLocaleString('pt-BR') });
  salvarQuestoesDaEscola(perfil.escola, lista);
  document.getElementById('profEnunciado').value = '';
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
