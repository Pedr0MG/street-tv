// StreetTV — wrapper do YouTube IFrame API
(function () {
  var yt = null, pronto = false, h = {}, atual = null, pendente = null, volume = 80, mudo = false;

  function aplicarFormato(canal) {
    var cv = document.getElementById('camada-video');
    if (cv) cv.classList.toggle('vertical', !!canal.vertical);
  }

  function init(containerId, handlers) {
    h = handlers || {};
    return new Promise(function (resolve) {
      function criar() {
        yt = new YT.Player(containerId, {
          width: '100%', height: '100%',
          playerVars: { controls: 0, modestbranding: 1, rel: 0, disablekb: 1, playsinline: 1, iv_load_policy: 3, fs: 0, autoplay: 1, cc_load_policy: 0, hl: 'pt-BR' },
          events: {
            onReady: function () {
              pronto = true;
              yt.setVolume(volume);
              if (mudo) yt.mute();
              resolve();
              if (pendente) { var c = pendente; pendente = null; carregar(c); }
            },
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.PLAYING) {
                try { yt.unloadModule('captions'); } catch (err) {}
                if (h.onPlaying) h.onPlaying();
              }
              else if (e.data === YT.PlayerState.ENDED && atual) {
                carregar(atual);                       // loop do trecho
                if (h.onFimDoTrecho) h.onFimDoTrecho();
              }
            },
            onError: function (e) { if (h.onErro) h.onErro(e.data); }
          }
        });
      }
      if (window.YT && window.YT.Player) return criar();
      window.onYouTubeIframeAPIReady = criar;
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
  }

  function carregar(canal) {
    atual = canal;
    aplicarFormato(canal);
    if (!pronto) { pendente = canal; return; }
    var o = { videoId: canal.videoId, startSeconds: canal.inicio };
    if (canal.fim != null) o.endSeconds = canal.fim;
    yt.loadVideoById(o);
  }

  window.StreetPlayer = {
    init: init,
    carregar: carregar,
    setVolume: function (v) { volume = v; if (pronto) yt.setVolume(v); },
    mutar: function (m) { mudo = !!m; if (pronto) { m ? yt.mute() : yt.unMute(); } },
    pausar: function () { pendente = null; if (pronto) yt.pauseVideo(); },
    retomar: function () { if (pronto) yt.playVideo(); },
    atual: function () { return atual; },
    info: function () {   // diagnostico: estado (1=tocando), tempo atual e id do video
      if (!pronto) return null;
      var d = yt.getVideoData ? yt.getVideoData() : {};
      return { estado: yt.getPlayerState(), tempo: Math.round(yt.getCurrentTime()), id: d.video_id };
    }
  };
})();
