// Lista de canais da StreetTV. Tempos em segundos; fim: null = ate o final do video.
// Para trocar o conteudo, edite apenas este arquivo.
(function () {
  var CANAIS = [
    { numero: 1,  videoId: 'mGbg8v6ECbA', inicio: 0,    fim: null, titulo: 'Passinho do Romano', autor: 'Fezinho Patatyy' },
    { numero: 2,  videoId: 'mrAT_xG-opk', inicio: 225,  fim: null, titulo: 'Negro Drama (ao vivo)', autor: "Racionais MC's" },
    { numero: 3,  videoId: 'PtuP21-8LgE', inicio: 188,  fim: 310,  titulo: 'Final do duelo nacional de MCs', autor: 'César e Drizzy' },
    { numero: 4,  videoId: 'skGyFowTzew', inicio: 3120, fim: 3323, titulo: 'Documentário "Pixo" (2010)', autor: 'João Wainer e Roberto T. Oliveira' },
    { numero: 5,  videoId: 'X0yHGC0ChrI', inicio: 304,  fim: 452,  titulo: 'Turma da Duq (Tiny Desk Brasil)', autor: 'Duquesa' },
    { numero: 6,  videoId: '72TEVpfOOYU', inicio: 228,  fim: 246,  titulo: 'Bolo Um (Playlist de funk explosiva 2)', autor: 'MC Neguinho do Kaxeta' },
    { numero: 7,  videoId: 'gMT9cXizDYQ', inicio: 48,   fim: 130,  titulo: 'Mano Brown, um sobrevivente do inferno', autor: 'Mano Brown' },
    { numero: 8,  videoId: 'p9JHGj_AhVE', inicio: 20,   fim: null, titulo: 'Ooorra (ao vivo)', autor: 'Emicida' },
    { numero: 9,  videoId: 'FdgxqbWmic8', inicio: 3,    fim: null, titulo: 'Amigo', autor: 'Fernandinho Beatbox' },
    { numero: 10, videoId: 'MBSUxUPDKf0', inicio: 1893, fim: 2076, titulo: 'Eu vim de lá (Sala, Podpah)', autor: 'Kyan' },
    { numero: 11, videoId: 'c1syA2pBCEU', inicio: 156,  fim: 223,  titulo: 'Griot (Dia da Rua 2013)', autor: 'MC Marechal' },
    { numero: 12, videoId: 'cyszh9j-CyY', inicio: 135,  fim: 168,  titulo: 'Discurso da vitória de Jones Manoel', autor: 'Jones Manoel' },
    { numero: 13, videoId: '8sgrPuLPu8k', inicio: 847,  fim: 997,  titulo: 'Troca Rima, Ep. 5', autor: 'Nog e Negra Li' },
    { numero: 14, videoId: '1dBsFWV8zN4', inicio: 38,   fim: 209,  titulo: 'Malefícios do dinheiro (Sala, Podpah)', autor: 'Leall' },
    { numero: 15, videoId: 'jWirBw5UIP0', inicio: 0,    fim: null, vertical: true, titulo: 'Emicida declamando "Levanta e anda" com pessoa em situação de rua', autor: 'Emicida' },
    { numero: 16, videoId: 'YrPwqCMTkrk', inicio: 788,  fim: 868,  titulo: 'Don L convida dançarina para o Tiny Desk Brasil', autor: 'Don L e Gabb Cabo Verde' },
    { numero: 17, videoId: 'a407iwijMks', inicio: 22,   fim: null, titulo: 'Discurso do presidente Lula antes de ser preso', autor: 'Luiz Inácio Lula da Silva' },
    { numero: 18, videoId: 'X5gUSmfJLIQ', inicio: 140,  fim: 230,  titulo: 'Mestre das fugas 2 (ao vivo, Podpah)', autor: 'MC Kauan' },
    { numero: 19, videoId: 'uV57CJyxAug', inicio: 232,  fim: 347,  titulo: 'Rap VS Repente no SBT', autor: 'Emicida, Rael, Peneira e Sonhador' },
    { numero: 20, videoId: 'tJuKKqSaUUg', inicio: 810,  fim: 862,  titulo: 'Medley Casal Bonnie e Clyde (Funk TV Visita)', autor: 'MC Menor da VG' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = CANAIS;
  else window.CANAIS = CANAIS;
})();
