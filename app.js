// StreetTV — estado, telas, controle remoto, canais, card, guia, power, sobre
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var Estado = window.Estado = {
    tela: 'cena',            // 'cena' | 'zoom' | 'tv'
    canal: 1, ligada: true, volume: 80, mudo: false,
    controleAberto: false, guiaAberto: false, sobreAberto: false, cursor: 1,
    foraDoAr: {}, zoomT: null
  };
  var TOTAL = CANAIS.length;
  var mundo = $('mundo'), tvCena = $('tv-cena'), modoTv = $('modo-tv'), controle = $('controle');
  var versao = 0, inicioTroca = 0, playerIniciado = false, abrirSobreAoEntrar = false, canalValidoAtual = true;
  var entrada = StreetLogic.createChannelInput(), entradaTimer = null;
  var entradaGuia = StreetLogic.createChannelInput(), entradaGuiaTimer = null;
  var cardTimer = null, osdTimer = null;

  /* ---------- CENA / ZOOM ---------- */
  function calcularZoom() {
    mundo.style.transform = 'none';
    var r = tvCena.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var alvoW = Math.min(0.94 * vw, 0.94 * vh * 900 / 620);
    var s = alvoW / r.width;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    return 'translate(' + (vw / 2 - s * cx) + 'px,' + (vh / 2 - s * cy) + 'px) scale(' + s + ')';
  }

  function entrarNaTV() {
    if (Estado.tela !== 'cena') return;
    Estado.tela = 'zoom';
    Estado.zoomT = calcularZoom();
    mundo.style.transform = 'none';
    void mundo.offsetWidth;
    mundo.classList.add('animando');
    modoTv.hidden = false;
    modoTv.className = '';
    void modoTv.offsetWidth;
    modoTv.classList.add('entrando');
    mundo.style.transform = Estado.zoomT;
    $('dica-cena').style.display = 'none';
    setTimeout(function () {
      Estado.tela = 'tv';
      modoTv.classList.remove('entrando');
      modoTv.classList.add('visivel');
      $('cena').classList.add('em-tv');   // a cena ampliada continua atras da TV
      mundo.classList.remove('animando');
      aoEntrar();
    }, 1250);
  }

  function sairDaTV() {
    if (Estado.tela !== 'tv') return;
    Estado.tela = 'zoom';
    fecharTudo();
    controle.hidden = true;
    StreetPlayer.pausar();
    versao++;
    clearTimeout(entradaTimer); entrada.reset();
    StreetFx.estatica.esconder();
    var z = calcularZoom();
    mundo.classList.remove('animando');
    mundo.style.transform = z;
    $('cena').classList.remove('em-tv');
    void mundo.offsetWidth;
    modoTv.classList.remove('visivel');
    modoTv.classList.add('saindo');
    mundo.classList.add('animando');
    mundo.style.transform = 'none';
    setTimeout(function () {
      Estado.tela = 'cena';
      modoTv.hidden = true;
      modoTv.className = '';
      mundo.classList.remove('animando');
      $('dica-cena').style.display = '';
    }, 1250);
  }

  window.entrarNaTV = entrarNaTV;
  window.sairDaTV = sairDaTV;

  /* ---------- AO ENTRAR NA TV ---------- */
  function aoEntrar() {
    controle.hidden = false;
    Estado.ligada = true;
    var d = $('desligada'); d.className = '';
    if (!playerIniciado) {
      playerIniciado = true;
      StreetPlayer.init('yt-player', { onPlaying: aoTocar, onErro: aoErro });
    }
    irParaCanal(Estado.canal);
    if (abrirSobreAoEntrar) { abrirSobreAoEntrar = false; abrirSobre(); }
  }

  /* ---------- CANAIS ---------- */
  function canalPorNumero(n) { return CANAIS[n - 1]; }

  function irParaCanal(numero) {
    if (!Estado.ligada) return;
    var v = ++versao;
    var valido = numero >= 1 && numero <= TOTAL;
    canalValidoAtual = valido;
    clearTimeout(entradaTimer); entrada.reset();   // digito pendente nao pode trocar de canal depois
    inicioTroca = Date.now();
    esconderCard();
    if (valido) {
      var canal = canalPorNumero(numero);
      Estado.canal = numero;
      StreetFx.estatica.mostrar(2500);
      StreetFx.semSinal.esconder();
      StreetPlayer.setVolume(Estado.volume);
      StreetPlayer.mutar(Estado.mudo);
      StreetPlayer.carregar(canal);
      mostrarCard(canal);
    } else {
      StreetPlayer.pausar();
      StreetFx.estatica.mostrar(600).then(function () {
        if (v === versao) StreetFx.semSinal.mostrar(numero);
      });
    }
  }

  function aoTocar() {
    // som vazando: o video comecou depois de sair da TV, desligar ou ir para canal inexistente
    if (!Estado.ligada || Estado.tela !== 'tv' || !canalValidoAtual) { StreetPlayer.pausar(); return; }
    // um erro atrasado de outro canal nao pode ficar por cima de um video que toca
    StreetFx.semSinal.esconder();
    if (Estado.foraDoAr[Estado.canal]) { delete Estado.foraDoAr[Estado.canal]; marcarForaDoAr(); }
    var resto = Math.max(0, 650 - (Date.now() - inicioTroca));
    var v = versao;
    setTimeout(function () { if (v === versao) StreetFx.estatica.esconder(); }, resto);
  }

  function aoErro() {
    Estado.foraDoAr[Estado.canal] = true;
    marcarForaDoAr();
    StreetFx.estatica.esconder();
    StreetFx.semSinal.mostrar(Estado.canal, location.protocol === 'file:' ? 'ABRA VIA SERVIDOR (VEJA O README)' : 'CANAL FORA DO AR');
  }

  /* ---------- CARD E OSD ---------- */
  function mostrarCard(c) {
    $('card-num').textContent = c.numero;
    $('card-titulo').textContent = c.titulo;
    $('card-autor').textContent = c.autor;
    var card = $('card');
    card.classList.add('ativo');
    clearTimeout(cardTimer);
    cardTimer = setTimeout(esconderCard, 5000);
  }
  function esconderCard() { clearTimeout(cardTimer); $('card').classList.remove('ativo'); }

  function mostrarOsd(texto, ms) {
    var o = $('osd');
    o.textContent = texto;
    o.classList.add('ativo');
    clearTimeout(osdTimer);
    osdTimer = setTimeout(function () { o.classList.remove('ativo'); }, ms || 1600);
  }

  /* ---------- DIGITACAO ---------- */
  function digitar(d) {
    if (Estado.guiaAberto) return digitarGuia(d);
    var a = entrada.press(d);
    clearTimeout(entradaTimer);
    if (a) {
      mostrarOsd(String(a.numero), 900);
      irParaCanal(a.numero);
    } else {
      mostrarOsd(entrada.buffer() + '-', 1700);
      entradaTimer = setTimeout(function () {
        var b = entrada.flush();
        if (b) { mostrarOsd(String(b.numero), 900); irParaCanal(b.numero); }
      }, 1500);
    }
  }

  /* ---------- GUIA ---------- */
  var guiaRenderizado = false;
  function renderGuia() {
    if (guiaRenderizado) return;
    guiaRenderizado = true;
    var ol = $('guia-lista');
    CANAIS.forEach(function (c) {
      var li = document.createElement('li');
      li.dataset.n = c.numero;
      li.innerHTML = '<span class="g-num"></span><span class="g-tit"></span><span class="g-aut"></span>';
      li.children[0].textContent = (c.numero < 10 ? '0' : '') + c.numero;
      li.children[1].textContent = c.titulo;
      li.children[2].textContent = c.autor;
      li.addEventListener('click', function () { Estado.cursor = c.numero; marcarCursor(); confirmarGuia(); });
      ol.appendChild(li);
    });
  }
  function marcarCursor() {
    var itens = $('guia-lista').children;
    for (var i = 0; i < itens.length; i++) itens[i].classList.toggle('ativo', i + 1 === Estado.cursor);
    var el = itens[Estado.cursor - 1];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }
  function marcarForaDoAr() {
    if (!guiaRenderizado) return;
    var itens = $('guia-lista').children;
    for (var i = 0; i < itens.length; i++) itens[i].classList.toggle('no-ar', !!Estado.foraDoAr[i + 1]);
  }
  function abrirGuia() {
    if (Estado.sobreAberto) fecharSobre();
    renderGuia();
    clearTimeout(entradaTimer); entrada.reset();
    Estado.guiaAberto = true;
    Estado.cursor = Estado.canal;
    entradaGuia.reset();
    $('guia').hidden = false;
    marcarForaDoAr();
    marcarCursor();
  }
  function fecharGuia() {
    Estado.guiaAberto = false;
    clearTimeout(entradaGuiaTimer); entradaGuia.reset();
    $('guia').hidden = true;
  }
  function confirmarGuia() {
    var n = Estado.cursor;
    fecharGuia();
    irParaCanal(n);
  }
  function irCursorPara(n) {
    if (n >= 1 && n <= TOTAL) { Estado.cursor = n; marcarCursor(); }
  }
  function digitarGuia(d) {
    var a = entradaGuia.press(d);
    clearTimeout(entradaGuiaTimer);
    if (a) irCursorPara(a.numero);
    else entradaGuiaTimer = setTimeout(function () {
      var b = entradaGuia.flush(); if (b) irCursorPara(b.numero);
    }, 1500);
  }

  /* ---------- SOBRE ---------- */
  function abrirSobre() {
    if (Estado.guiaAberto) fecharGuia();
    clearTimeout(entradaTimer); entrada.reset();
    Estado.sobreAberto = true;
    $('sobre').hidden = false;
    $('sobre').scrollTop = 0;
  }
  function fecharSobre() { Estado.sobreAberto = false; $('sobre').hidden = true; }

  function fecharTudo() {
    fecharGuia(); fecharSobre(); fecharControle();
    esconderCard();
  }

  /* ---------- POWER ---------- */
  function power() {
    var d = $('desligada');
    if (Estado.ligada) {
      Estado.ligada = false;
      versao++;
      clearTimeout(entradaTimer); entrada.reset();
      fecharGuia(); fecharSobre(); esconderCard();
      StreetPlayer.pausar();
      StreetFx.estatica.esconder();
      StreetFx.semSinal.esconder();
      d.className = 'tubo';
      setTimeout(function () { if (!Estado.ligada) d.className = 'apagada'; }, 560);
    } else {
      Estado.ligada = true;
      d.className = '';
      irParaCanal(Estado.canal);
    }
  }

  /* ---------- CONTROLE REMOTO ---------- */
  // [id, centro x, centro y, largura, altura] em fracao da imagem (249x784)
  var BOTOES = [
    ['power', .763, .073, .17, .054],
    ['menu', .245, .161, .20, .045, 1],
    ['info', .767, .158, .17, .054],
    ['ch+', .500, .160, .22, .050, 1],
    ['vol-', .245, .240, .24, .050, 1],
    ['vol+', .762, .240, .24, .050, 1],
    ['ch-', .502, .320, .22, .050, 1],
    ['mudo', .245, .321, .17, .054],
    ['s', .771, .320, .17, .054],
    [1, .249, .418, .16, .051], [2, .506, .418, .16, .051], [3, .759, .418, .16, .051],
    [4, .249, .499, .16, .051], [5, .506, .499, .16, .051], [6, .759, .499, .16, .051],
    [7, .249, .579, .16, .051], [8, .506, .579, .16, .051], [9, .759, .579, .16, .051],
    ['100', .249, .661, .16, .051], [0, .506, .661, .16, .051], ['av', .759, .661, .16, .051]
  ];

  function montarControle() {
    var corpo = $('controle-corpo');
    BOTOES.forEach(function (b) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'bt' + (b[5] ? ' ret' : '');
      el.setAttribute('aria-label', String(b[0]));
      el.style.left = (b[1] * 100) + '%';
      el.style.top = (b[2] * 100) + '%';
      el.style.width = (b[3] * 100) + '%';
      el.style.height = (b[4] * 100) + '%';
      el.addEventListener('click', function (ev) { ev.stopPropagation(); acaoControle(b[0]); });
      corpo.appendChild(el);
    });
    if (/debug/.test(location.search)) controle.classList.add('debug');
  }

  function abrirControle() { Estado.controleAberto = true; controle.classList.add('aberto'); }
  function fecharControle() { Estado.controleAberto = false; controle.classList.remove('aberto'); }

  function acaoControle(b) {
    if (typeof b === 'string' && /^\d+$/.test(b) && b !== '100') b = parseInt(b, 10);
    if (b === 'power') return power();
    if (!Estado.ligada) return;
    if (Estado.sobreAberto) { if (b === 'av' || b === 'menu') fecharSobre(); return; }
    if (typeof b === 'number') return digitar(b);
    if (Estado.guiaAberto) {
      if (b === 'ch+') { Estado.cursor = StreetLogic.movimentarCursor(Estado.cursor, 1, TOTAL); marcarCursor(); }
      else if (b === 'ch-') { Estado.cursor = StreetLogic.movimentarCursor(Estado.cursor, -1, TOTAL); marcarCursor(); }
      else if (b === 's') confirmarGuia();
      else if (b === 'menu') fecharGuia();
      else if (b === 'av') abrirSobre();
      return;
    }
    switch (b) {
      case 'ch+': irParaCanal(StreetLogic.proximoCanal(Estado.canal, TOTAL)); break;
      case 'ch-': irParaCanal(StreetLogic.canalAnterior(Estado.canal, TOTAL)); break;
      case 'vol+': mudarVolume(10); break;
      case 'vol-': mudarVolume(-10); break;
      case 'mudo':
        Estado.mudo = !Estado.mudo;
        StreetPlayer.mutar(Estado.mudo);
        mostrarOsd(Estado.mudo ? 'MUDO' : 'SOM', 1400);
        break;
      case 'menu': abrirGuia(); break;
      case 'info': mostrarCard(canalPorNumero(Estado.canal)); break;
      case 'av': abrirSobre(); break;
    }
  }

  function mudarVolume(passo) {
    Estado.volume = Math.max(0, Math.min(100, Estado.volume + passo));
    if (Estado.mudo) { Estado.mudo = false; StreetPlayer.mutar(false); }
    StreetPlayer.setVolume(Estado.volume);
    var n = Estado.volume / 10;
    mostrarOsd('VOL ' + new Array(n + 1).join('▮') + new Array(11 - n).join('▯'), 1400);
  }

  /* ---------- EVENTOS ---------- */
  montarControle();
  tvCena.addEventListener('click', entrarNaTV);
  $('voltar').addEventListener('click', sairDaTV);
  $('link-sobre').addEventListener('click', function () {
    if (Estado.tela !== 'cena') return;   // durante o zoom nao arma a flag
    abrirSobreAoEntrar = true;
    entrarNaTV();
  });

  controle.addEventListener('click', function () { if (!Estado.controleAberto) abrirControle(); });
  document.addEventListener('click', function (e) {
    if (Estado.controleAberto && !controle.contains(e.target)) fecharControle();
  });

  document.addEventListener('keydown', function (e) {
    if (Estado.tela !== 'tv' || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, mapa = {
      ArrowUp: 'ch+', PageUp: 'ch+', ArrowDown: 'ch-', PageDown: 'ch-',
      ArrowRight: 'vol+', ArrowLeft: 'vol-', Enter: 's',
      m: 'mudo', M: 'mudo', g: 'menu', G: 'menu', i: 'info', I: 'info', a: 'av', A: 'av'
    };
    if (/^[0-9]$/.test(k)) { e.preventDefault(); return acaoControle(parseInt(k, 10)); }
    if (k === 'Escape') {
      if (Estado.sobreAberto) fecharSobre();
      else if (Estado.guiaAberto) fecharGuia();
      else if (Estado.controleAberto) fecharControle();
      return;
    }
    if (mapa[k]) { e.preventDefault(); acaoControle(mapa[k]); }
  });

  // redimensionar no modo TV: refaz o zoom para a parede continuar alinhada com a moldura
  window.addEventListener('resize', function () {
    if (Estado.tela === 'tv') {
      var z = calcularZoom();
      mundo.style.transform = z;
      Estado.zoomT = z;
    }
  });

  window.acaoControle = acaoControle;
  window.irParaCanal = irParaCanal;
  window.mostrarCard = mostrarCard;
  window.mostrarOsd = mostrarOsd;
  window.abrirGuia = abrirGuia;
  window.fecharGuia = fecharGuia;
  window.abrirSobre = abrirSobre;
  window.fecharSobre = fecharSobre;
})();
