// StreetTV — estatica de TV e tela "Sem sinal" com logo flutuante
(function () {
  var W = 176, H = 132;
  var cEst = null, cFix = null, ctxEst, ctxFix;
  var estAtiva = false, estTimer = null, estResolve = null;
  var semAtivo = false, logoEst = null, ultimo = 0, raf = 0;

  function el(id) { return document.getElementById(id); }

  function prep(c) {
    c.width = W; c.height = H;
    return c.getContext('2d');
  }

  function ruido(ctx) {
    var img = ctx.createImageData(W, H), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function frame(t) {
    raf = 0;
    if (!estAtiva && !semAtivo) return;
    if (estAtiva) ruido(ctxEst);
    if (semAtivo) {
      ruido(ctxFix);
      var dt = Math.min((t - ultimo) / 1000, 0.05);
      ultimo = t;
      var tela = el('tela'), logo = el('logo-stv');
      var k = tela.clientWidth / 700;
      var lim = { largura: tela.clientWidth, altura: tela.clientHeight };
      logoEst.w = logo.offsetWidth; logoEst.h = logo.offsetHeight;
      logoEst.vx = Math.sign(logoEst.vx || 1) * 120 * k;
      logoEst.vy = Math.sign(logoEst.vy || 1) * 85 * k;
      logoEst = StreetLogic.passoRebote(logoEst, lim, dt);
      logo.style.transform = 'translate(' + logoEst.x + 'px,' + logoEst.y + 'px)';
    }
    raf = requestAnimationFrame(frame);
  }
  function iniciarLoop() { if (!raf) { ultimo = performance.now(); raf = requestAnimationFrame(frame); } }

  function iniciar() {
    if (cEst) return;
    cEst = el('estatica'); cFix = el('estatica-fixa');
    ctxEst = prep(cEst); ctxFix = prep(cFix);
  }

  var estatica = {
    mostrar: function (ms) {
      iniciar();
      if (estResolve) { clearTimeout(estTimer); estResolve(); estResolve = null; }
      estAtiva = true; cEst.classList.add('ativa'); iniciarLoop();
      return new Promise(function (res) {
        estResolve = res;
        estTimer = setTimeout(function () { estatica.esconder(); }, ms);
      });
    },
    esconder: function () {
      iniciar();
      clearTimeout(estTimer);
      estAtiva = false; cEst.classList.remove('ativa');
      if (estResolve) { var r = estResolve; estResolve = null; r(); }
    }
  };

  var semSinal = {
    mostrar: function (numero, mensagem) {
      iniciar();
      var box = el('sem-sinal');
      el('sem-sinal-titulo').textContent = mensagem || 'SEM SINAL';
      el('sem-sinal-num').textContent = (numero === null || numero === undefined) ? '' : 'CANAL ' + numero;
      box.hidden = false;
      var tela = el('tela'), logo = el('logo-stv');
      if (!semAtivo) {
        logoEst = { x: Math.random() * tela.clientWidth * 0.4, y: Math.random() * tela.clientHeight * 0.4, vx: 1, vy: 1, w: logo.offsetWidth, h: logo.offsetHeight };
      }
      semAtivo = true; iniciarLoop();
    },
    esconder: function () {
      iniciar();
      semAtivo = false;
      el('sem-sinal').hidden = true;
    }
  };

  window.StreetFx = { estatica: estatica, semSinal: semSinal };
})();
