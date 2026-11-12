// Logica pura da StreetTV (sem DOM). Testada com: node --test tests/
(function () {
  function createChannelInput() {
    var buf = '';
    return {
      press: function (d) {
        buf += String(d);
        if (buf.length >= 2) {
          var n = parseInt(buf, 10);
          buf = '';
          return { tipo: 'ir', numero: n };
        }
        return null;
      },
      flush: function () {
        if (!buf) return null;
        var n = parseInt(buf, 10);
        buf = '';
        return { tipo: 'ir', numero: n };
      },
      reset: function () { buf = ''; },
      buffer: function () { return buf; }
    };
  }

  function proximoCanal(atual, total) { return atual >= total ? 1 : atual + 1; }
  function canalAnterior(atual, total) { return atual <= 1 ? total : atual - 1; }
  function movimentarCursor(cursor, passo, total) {
    return passo > 0 ? proximoCanal(cursor, total) : canalAnterior(cursor, total);
  }

  function passoRebote(e, limite, dt) {
    var x = e.x + e.vx * dt, y = e.y + e.vy * dt, vx = e.vx, vy = e.vy;
    var maxX = limite.largura - e.w, maxY = limite.altura - e.h;
    if (x <= 0) { x = 0; vx = Math.abs(vx); }
    else if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    else if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
    return { x: x, y: y, vx: vx, vy: vy, w: e.w, h: e.h };
  }

  function formatarTempo(s) {
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var ss = (sec < 10 ? '0' : '') + sec;
    if (h > 0) return h + ':' + (m < 10 ? '0' : '') + m + ':' + ss;
    return m + ':' + ss;
  }

  var api = {
    createChannelInput: createChannelInput,
    proximoCanal: proximoCanal,
    canalAnterior: canalAnterior,
    movimentarCursor: movimentarCursor,
    passoRebote: passoRebote,
    formatarTempo: formatarTempo
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.StreetLogic = api;
})();
