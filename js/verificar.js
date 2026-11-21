/* (21/11) Verificacao de documentos da FAOL: diz a VERDADE ATUAL do vinculo.
   A lista publica (dados/documentos.js) guarda so: codigo, tipo, apelido, matricula, categoria/cargo, situacao atual e
   os periodos do vinculo. Nenhum dado pessoal. Funcao pura (testada sem o site): FAOL_VERIFICAR(codigo, lista, conferido). */
(function (w) {
  "use strict";
  var VINCULO = ["Carteira de Habilitação", "Crachá Funcional", "Extrato da Ficha Funcional", "Ficha Funcional e Disciplinar"];

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (ch) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[ch]; });
  }

  function termos(tipo) {
    if (tipo !== "Carteira de Habilitação") {          /* cracha, ficha e demais documentos de vinculo */
      return { nome: "Vínculo", vig: "Vínculo VIGENTE", susp: "Vínculo SUSPENSO", sem: "Vínculo <b>sem vigência</b>",
               cat: "Cargo atual", ult: "Último cargo", desde: "No quadro da FAOL desde", per: "Fez parte do quadro da FAOL" };
    }
    return { nome: "Habilitação", vig: "Habilitação VIGENTE", susp: "Habilitação <b>SUSPENSA</b>",
             sem: "Habilitação <b>sem vigência</b>", cat: "Categoria atual", ult: "Última categoria",
             desde: "Habilitado desde", per: "Foi habilitado na FAOL" };
  }

  function periodos(ps) {
    return (ps || []).filter(function (p) { return p && p[0]; }).map(function (p) {
      return "no período de " + p[0] + " a " + (p[1] || "hoje");
    });
  }

  function situacao(d, conferido) {
    var t = termos(d.tipo), out = [], st = d.situacao;
    var conf = conferido ? "Situação conferida em " + conferido + "." : "";
    if (st === "Desligado") {
      out.push("⚠️ Documento autêntico, mas o colaborador <b>NÃO faz mais parte do quadro</b> da FAOL.");
      var ps = periodos(d.periodos);
      if (ps.length) { out.push(t.per + " " + ps.join("; ") + "."); }
      if (d.categoria && d.categoria !== "—") { out.push(t.ult + ": " + d.categoria + "."); }
      out.push(t.sem + ".");
    } else if (st === "Afastado") {
      out.push("Documento autêntico. " + t.susp + " (colaborador afastado" + (d.afastado_desde ? " desde " + d.afastado_desde : "") + ").");
      if (d.categoria && d.categoria !== "—") { out.push(t.cat + ": " + d.categoria + "."); }
    } else {
      out.push("✅ Documento autêntico. " + t.vig + ".");
      if (d.categoria && d.categoria !== "—") { out.push(t.cat + ": " + d.categoria + "."); }
      if (d.periodos && d.periodos.length) {
        out.push(t.desde + " " + d.periodos[d.periodos.length - 1][0] + ".");
        if (d.periodos.length > 1) {
          out.push("Períodos anteriores: " + periodos(d.periodos.slice(0, -1)).join("; ") + ".");
        }
      }
    }
    if (conf) { out.push(esc(conf)); }
    return out;
  }

  w.FAOL_VERIFICAR = function (c, lista, conferido) {
    c = String(c || "").trim().toUpperCase();
    var d0 = (lista || {})[c], d = null;
    if (d0) {
      d = {};
      Object.keys(d0).forEach(function (k) { d[k] = k === "periodos" ? (d0[k] || []).map(function (p) { return [esc(p[0]), p[1] ? esc(p[1]) : null]; }) : esc(d0[k]); });
      d.periodos = d0.periodos ? d.periodos : null;
    }
    if (!d) { return { classe: "nao", linhas: ["❌ Código não encontrado. Confira as letras e os números."] }; }
    if (d.anulado) {
      return { classe: "nao", linhas: ["⚠️ Documento anulado em " + d.anulado + " — " + d.tipo + ". Ele não tem mais validade."] };
    }
    var cab = d.tipo + " · " + d.apelido + (d.matricula ? " · " + d.matricula : "") + " · emitido em " + d.data;
    var linhas = [], ligado = VINCULO.indexOf(d.tipo) >= 0 && d.situacao;
    if (d.substituido) {
      linhas.push("Esta via foi substituída em " + d.substituido + ".");
      linhas.push(cab);
      if (ligado) { linhas = linhas.concat(situacao(d, conferido)); }
      return { classe: "aviso", linhas: linhas };
    }
    if (ligado) {
      linhas = situacao(d, conferido);
      linhas.splice(1, 0, cab);
      return { classe: d.situacao === "Desligado" || d.situacao === "Afastado" ? "aviso" : "ok", linhas: linhas };
    }
    return { classe: "ok", linhas: ["✅ Documento válido — " + cab] };
  };
})(window);
