/* FAOL – site institucional. Preenche as secoes, anima os numeros e le os dados ao vivo (dados/status.js, gerado
   pela Central a cada 5 min depois da publicacao). Nada de endereco do servidor, dados pessoais ou financeiro. */
(function () {
  "use strict";
  var REDUZIR = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CFG = window.FAOL_CONFIG || {};
  var S = window.FAOL_STATUS || {};

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) { e.setAttribute(k, attrs[k]); }
    if (html !== undefined) { e.innerHTML = html; }
    return e;
  }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* ---------- convite do Discord (botoes "Quero ser motorista" / "Entrar na Central") */
  var links = document.querySelectorAll("[data-convite]");
  for (var i = 0; i < links.length; i++) {
    if (CFG.convite_discord) {
      links[i].href = CFG.convite_discord; links[i].target = "_blank"; links[i].rel = "noopener";
    } else { links[i].href = "#trabalhe"; }
  }

  /* ---------- conteudo fixo */
  var P = {
    ponto: "M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    relogio: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
    nuvem: "M17.5 19H8a5 5 0 1 1 .9-9.9A6 6 0 0 1 20 12a3.5 3.5 0 0 1-2.5 7zM9 21l-1 2M13 21l-1 2M17 21l-1 2",
    radio: "M4 10h16v10H4zM8 10l8-6M8 15h.01M12 15h4",
    cal: "M4 6h16v15H4zM4 10h16M9 3v4M15 3v4",
    cracha: "M5 4h14v17H5zM9 4V2h6v2M12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8 18c.8-2 2.2-3 4-3s3.2 1 4 3"
  };
  var pilares = [
    [P.ponto, "Cenário Nova Friburgo (RJ)", "Cidade com ajustes de operação, tráfego nacional e estacionamento como nas ruas brasileiras."],
    [P.relogio, "Horário oficial de Brasília", "Fluxo proporcional ao período: madrugada tranquila e alta demanda nos horários de pico."],
    [P.nuvem, "Meteorologia em tempo real", "Clima obtido dos boletins oficiais do Aeroporto Santos Dumont."],
    [P.cal, "Calendário operacional", "Feriados nacionais, do estado do Rio e do município."],
    [P.radio, "Central de Operações", "Comunicados de pico, clima e trânsito, além de rádio por linha."],
    [P.cracha, "Matrícula e habilitação", "Ficha funcional, carteira de habilitação FAOL e escala individual."]
  ];
  pilares.forEach(function (p) {
    $("pilares").appendChild(el("div", { "class": "pilar card" },
      '<div class="ic"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5B800" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + p[0] + '"></path></svg></div>' +
      "<h3>" + p[1] + "</h3><p>" + p[2] + "</p>"));
  });

  /* (19/11) total real de partidas por dia (soma dos horarios do mapa) */
  var TOTAL_PARTIDAS = (window.FAOL_LINHAS || []).reduce(function (t, d) { return t + (d.partidas || 0); }, 0) || 1182;
  var tl = document.getElementById("linhas-titulo");
  if (tl) { tl.textContent = "11 linhas. Mais de " + (Math.floor(TOTAL_PARTIDAS / 100) * 100).toLocaleString("pt-BR") + " partidas por dia."; }
  var LINHAS = ["10", "31", "31A", "31B", "32", "32A", "42", "42A", "74", "74A", "100"];
  var rodando = (S.linhas_rodando || []).map(String);
  /* (19/11, item e) cartoes das linhas: dados REAIS dos horarios do mapa (js/linhas.js, gerado pela Central) */
  var DL = window.FAOL_LINHAS || [];
  if (DL.length) {
    $("leds").className = "cartoes-linhas";
    DL.forEach(function (d) {
      var on = rodando.indexOf(String(d.linha)) >= 0;
      var rota = d.circular ? esc(d.origem) + " <small>(circular)</small>"
                            : esc(d.origem) + ' <span class="ida">⇄</span> ' + esc(d.destino);
      if (d.via) { rota += ' <small>via ' + esc(d.via) + '</small>'; }
      var letreiro = esc(d.circular ? d.origem + " (CIRCULAR)" : d.origem + "  ⇄  " + d.destino).toUpperCase();
      var tempo = d.tempo_min ? (d.tempo_min === d.tempo_max ? d.tempo_min : d.tempo_min + "–" + d.tempo_max) + " min" : "—";
      $("leds").appendChild(el("article", { "class": "cl" + (on ? " on" : "") },
        '<div class="cl-led"><b>' + esc(d.linha) + '</b><span class="cl-tela"><span class="cl-rolar">' + letreiro +
        "&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;" + letreiro + "</span></span>" +
        (on ? '<span class="cl-ao">● em operação</span>' : "") + "</div>" +
        (d.variante_de ? '<div class="cl-var">variação da linha ' + esc(d.variante_de) + "</div>" : "") +
        '<h3 class="cl-rota">' + rota + "</h3>" +
        (d.frase ? '<p class="cl-frase">' + esc(d.frase) + "</p>" : "") +
        '<dl class="cl-dados">' +
        "<div><dt>Tempo de viagem</dt><dd>" + tempo + "</dd></div>" +
        "<div><dt>Partidas por dia</dt><dd>" + esc(d.partidas) + "</dd></div>" +
        "<div><dt>Primeira / última</dt><dd>" + esc(d.primeira) + " · " + esc(d.ultima) + "</dd></div>" +
        "<div><dt>Intervalo no pico</dt><dd>" + (d.intervalo_pico ? "~" + d.intervalo_pico + " min" : "—") + "</dd></div>" +
        "</dl>"));
    });
  } else {
    LINHAS.forEach(function (l) {
      var on = rodando.indexOf(l) >= 0;
      $("leds").appendChild(el("div", { "class": "led card" + (on ? " on" : ""), "title": on ? "Em operação agora" : "" }, esc(l)));
    });
  }

  var degraus = [
    ["1", "Em Treinamento", "Viagem acompanhada por um instrutor da empresa antes da liberação.", "#3BA7DD"],
    ["2", "Júnior", "Certificado de conclusão do treinamento e primeiras escalas.", "#2A86BD"],
    ["3", "Pleno", "Tempo de casa, escalas cumpridas e disciplina contam para a promoção.", "#0F2D6E"],
    ["4", "Sênior", "Referência da operação, com destaque no Quadro de Honra.", "#C98F00"]
  ];
  degraus.forEach(function (c) {
    $("degraus").appendChild(el("div", { "class": "degrau card" },
      '<div class="t"><div class="n" style="background:' + c[3] + '">' + c[0] + "</div><h3>" + c[1] + "</h3></div><p>" + c[2] + "</p>"));
  });

  var passos = [
    ["1", "Tenha o OMSI 2 original", "Adquirido na Steam. O openOMSI, que usamos para operar, é gratuito."],
    ["2", "Entre na Central da FAOL", "Nosso atendimento no Discord recebe você na recepção."],
    ["3", "Envie sua candidatura", "Formulário rápido, analisado pelo setor de Recursos Humanos."],
    ["4", "Faça o treinamento", "Uma viagem acompanhada para conhecer a operação."],
    ["5", "Assuma sua primeira escala", "Escolha a linha e o horário. Bom trabalho e boa viagem."]
  ];
  passos.forEach(function (p) {
    $("passos").appendChild(el("li", {}, '<div class="n">' + p[0] + "</div><div><b>" + p[1] + "</b><span>" + p[2] + "</span></div>"));
  });

  var faq = [
    ["Preciso pagar alguma coisa?", "Não. A participação na FAOL é gratuita. É necessário apenas ter o OMSI 2 original na Steam."],
    ["Preciso baixar o mapa?", "Não. Na primeira entrada o próprio servidor envia a cidade e a frota. Pode levar alguns minutos; nas próximas é imediato."],
    ["Como recebo o endereço do servidor?", "Pela Central da FAOL, no momento em que você assume sua escala."],
    ["Posso transmitir ao vivo?", "Sim. Motoristas que transmitem a operação podem se cadastrar como criadores FAOL no Discord; as transmissões em destaque aparecem aqui no site, em Ao vivo na FAOL."],
    ["A FAOL é uma empresa real?", "Não. É um projeto de simulação no openOMSI, sem vínculo com empresas reais de transporte."]
  ];
  faq.forEach(function (q) {
    $("faq").appendChild(el("details", {}, "<summary>" + q[0] + "</summary><p>" + q[1] + "</p>"));
  });

  /* ---------- frota deslizando (duas copias para o laco continuo) */
  var FROTA = window.FAOL_FROTA || [];
  function cartoes(copia) {
    FROTA.forEach(function (b) {
      var f = el("figure", { "class": "bus card" + (copia ? " copia" : "") },
        '<img src="' + esc(b.foto) + '" alt="Ônibus ' + esc(b.modelo) + ' da frota FAOL" loading="lazy" width="400" height="266">' +
        "<figcaption><b>Frota FAOL</b><span>" + esc(b.modelo) + "</span></figcaption>");
      if (copia) { f.setAttribute("aria-hidden", "true"); }
      $("track").appendChild(f);
    });
  }
  cartoes(false); cartoes(true);

  /* ---------- AGORA NA FAOL: antes da inauguracao, numeros fixos; depois, o que a Central publica */
  var inaugurado = S.inaugurado === true;
  var stats;
  if (inaugurado) {
    /* (19/11) com 0 motoristas em escala nao destaca o zero: mostra so a situacao do servidor */
    var nEsc = S.motoristas_em_escala || 0, nLin = (S.linhas_rodando || []).length;
    var sitTxt = { aberto: "Aberto", fechado: "Fechado", manutencao: "Manutenção" }[S.servidor] || "Aberto";
    stats = [
      nEsc > 0 ? { v: nEsc, suf: " / " + (S.vagas || 16), r: "Motoristas em escala agora", cor: "#0F2D6E" }
               : { v: null, txt: sitTxt, r: "Servidor", cor: "#0F2D6E" },
      nLin > 0 ? { v: nLin, suf: "", r: "Linhas rodando agora", cor: "#3BA7DD" }
               : { v: 11, suf: "", r: "Linhas em operação", cor: "#3BA7DD" },
      { v: TOTAL_PARTIDAS, suf: "", r: "Partidas por dia", cor: "#F5B800" },
      { v: null, txt: "24 h", r: "Operação com horário real", cor: "#0F2D6E" }
    ];
  } else {
    stats = [
      { v: 11, suf: "", r: "Linhas em operação", cor: "#0F2D6E" },
      { v: TOTAL_PARTIDAS, suf: "", r: "Partidas por dia", cor: "#3BA7DD" },
      { v: 16, suf: "", r: "Vagas para motoristas", cor: "#F5B800" },
      { v: null, txt: "24 h", r: "Operação com horário real", cor: "#0F2D6E" }
    ];
  }
  var alvos = [];
  stats.forEach(function (s) {
    var c = el("div", { "class": "stat card", "style": "border-top-color:" + s.cor },
      '<div class="v">' + (s.v === null ? s.txt : "0" + esc(s.suf)) + '</div><div class="r">' + esc(s.r) + "</div>");
    $("stats").appendChild(c);
    if (s.v !== null) { alvos.push({ e: c.querySelector(".v"), v: s.v, suf: s.suf }); }
  });
  function contar() {
    if (REDUZIR) { alvos.forEach(function (a) { a.e.textContent = a.v.toLocaleString("pt-BR") + a.suf; }); return; }
    var t0 = null;
    function passo(t) {
      if (t0 === null) { t0 = t; }
      var k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3);
      alvos.forEach(function (a) { a.e.textContent = Math.round(a.v * e).toLocaleString("pt-BR") + a.suf; });
      if (k < 1) { requestAnimationFrame(passo); }
    }
    requestAnimationFrame(passo);
  }
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (ent) {
      if (ent.some(function (x) { return x.isIntersecting; })) { contar(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe($("stats"));
  } else { contar(); }

  /* ---------- situacao do servidor */
  var sit = { aberto: ["verde", "Servidor aberto · atualizado automaticamente pela Central"],
              fechado: ["vermelho", "Servidor fechado no momento · atualizado automaticamente pela Central"],
              manutencao: ["", "Servidor em manutenção programada · atualizado automaticamente pela Central"] };
  if (inaugurado && sit[S.servidor]) {
    $("sit-bola").className = "pulse " + sit[S.servidor][0];
    $("sit-txt").textContent = sit[S.servidor][1] + (S.atualizado ? " · " + S.atualizado : "");
    $("selo-txt").textContent = S.servidor === "aberto" ? "Em operação" : "Operação FAOL";
  }

  /* ---------- Quadro de Honra (so o nome de operador) */
  if (inaugurado && (S.quadro_honra || []).length) {
    $("honra-txt").textContent = "Destaques de " + (S.quadro_honra_mes || "este mês") + ":";
    var ul = $("honra-lista");
    S.quadro_honra.slice(0, 5).forEach(function (h) { ul.appendChild(el("li", {}, esc(h.titulo) + " · " + esc(h.nome))); });
    ul.hidden = false;
  }

  /* ---------- criador ao vivo e proximos eventos */
  if (inaugurado && S.ao_vivo && S.ao_vivo.link) {
    $("live-titulo").textContent = "Ao vivo agora: " + S.ao_vivo.nome;
    $("live-txt").innerHTML = 'Acompanhe a operação: <a href="' + esc(S.ao_vivo.link) + '" target="_blank" rel="noopener">assistir à transmissão</a>.';
  }
  if (inaugurado && (S.eventos || []).length) {
    var ev = $("eventos-lista");
    S.eventos.slice(0, 4).forEach(function (e) { ev.appendChild(el("li", {}, "🎉 " + esc(e.titulo) + " · " + esc(e.quando))); });
    ev.hidden = false;
  }
})();

/* (19/11) Vinheta: carrega so quando a secao aparece; comeca sem som; botoes de som e de tocar de novo. */
(function () {
  "use strict";
  var v = document.getElementById("vinheta-video");
  if (!v) { return; }
  var reduzir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var som = document.getElementById("v-som"), tocar = document.getElementById("v-tocar");
  function carregar() {
    if (!v.src) { v.src = v.getAttribute("data-src"); }
    if (!reduzir) { var p = v.play(); if (p && p.catch) { p.catch(function () {}); } }
  }
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) {
        if (e.isIntersecting) { carregar(); }
        else if (v.src && !v.paused) { v.pause(); }
      });
    }, { threshold: 0.35 });
    obs.observe(v);
  } else { carregar(); }
  som.addEventListener("click", function () {
    if (!v.src) { carregar(); }
    v.muted = !v.muted;
    som.textContent = v.muted ? "🔇 Som" : "🔊 Som";
    som.setAttribute("aria-label", v.muted ? "Ligar o som" : "Desligar o som");
    if (v.paused) { v.play(); }
  });
  tocar.addEventListener("click", function () {
    if (!v.src) { carregar(); }
    v.currentTime = 0; v.play();
  });
})();

/* (20/11) Ao vivo na FAOL: so aparece com transmissao; sem ninguem, "Proximas transmissoes" ou some. Players so
   carregam quando a secao aparece na tela (nao pesa a abertura). Som desligado ao abrir. */
(function () {
  "use strict";
  var S = window.FAOL_STATUS || {}, T = S.transmissoes || {}, sec = document.getElementById("aovivo");
  if (!sec || !S.inaugurado) { return; }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  var dest = T.destaques || [], agenda = T.agenda || [];
  if (!dest.length && !agenda.length) { return; }
  sec.hidden = false;
  if (!dest.length) {
    document.getElementById("av-rotulo").textContent = "Próximas transmissões";
    document.getElementById("av-titulo").textContent = "📅 Agenda dos criadores FAOL.";
    var ul = document.getElementById("av-agenda"); ul.hidden = false;
    ul.innerHTML = agenda.map(function (a) { return "<li><b>" + esc(a.nome) + "</b> — " + esc(a.quando) + "</li>"; }).join("");
    return;
  }
  var grade = document.getElementById("av-grade");
  grade.innerHTML = dest.map(function (d, i) {
    var info = [d.linha ? "Linha " + esc(d.linha) : "", d.escala ? esc(d.escala) : ""].filter(Boolean).join(" · ");
    return '<article class="av-card"><div class="av-player" data-embed="' + esc(d.embed || "") + '">' +
      '<div class="av-capa">' + (d.embed ? "Carregando a transmissão…" : "Transmissão no canal do criador") + "</div></div>" +
      '<div class="av-info"><b>' + esc(d.nome) + "</b><span>" + (info || "Em operação na FAOL") + "</span>" +
      '<a href="' + esc(d.link) + '" target="_blank" rel="noopener">Assistir no canal</a></div></article>';
  }).join("");
  if ((T.tambem || []).length) {
    var p = document.getElementById("av-tambem"); p.hidden = false;
    p.innerHTML = "Também ao vivo: " + T.tambem.map(function (t) { return '<a href="' + esc(t.link) + '" target="_blank" rel="noopener">' + esc(t.nome) + "</a>"; }).join(" · ");
  }
  function carregar() {
    Array.prototype.forEach.call(grade.querySelectorAll(".av-player"), function (pl) {
      var u = pl.getAttribute("data-embed");
      if (u && !pl.querySelector("iframe")) {
        var f = document.createElement("iframe");
        f.src = u; f.allow = "autoplay; fullscreen; picture-in-picture"; f.allowFullscreen = true; f.loading = "lazy";
        f.title = "Transmissão ao vivo";
        pl.appendChild(f);
      }
    });
  }
  if ("IntersectionObserver" in window) {
    var o = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { carregar(); o.disconnect(); } }, { threshold: 0.15 });
    o.observe(sec);
  } else { carregar(); }
})();
