const SVG = (conteudo, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${conteudo}</svg>`;

const ICONES = {
  local: SVG('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  data: SVG('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  check: SVG('<path d="M20 6 9 17l-5-5"/>', 'stroke-width="2.5"'),
  pessoas: SVG('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>'),
  busca: SVG('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  estrela: SVG('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>'),
  maleta: SVG('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
  relogio: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  caixa: SVG('<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z"/>'),
  email: SVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  lapis: SVG('<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'),
  mais: SVG('<path d="M12 5v14M5 12h14"/>'),
  lixo: SVG('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  fechar: SVG('<path d="M6 6l12 12M18 6 6 18"/>')
};

const ICONES_CATEGORIA = {
  "Todas": SVG('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  "Mudança e carga": SVG('<path d="M2 6h12v10H2zM14 9h4.5L22 12.5V16h-8"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/>'),
  "Garçom e eventos": SVG('<path d="M7 3h10l-1.2 6.5a3.9 3.9 0 0 1-7.6 0Z"/><path d="M12 13.5V20M8 21h8"/>'),
  "Pequenos reparos": SVG('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5l3 3 5.8-5.8a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.6-.4-.4-2.6Z"/>'),
  "Faxina": SVG('<path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7l-1.6-4.5L6 9.6 10.4 8Z"/><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>'),
  "Design e redes sociais": SVG('<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-3.5 3.5H15a2 2 0 0 0-1.5 3.3A1.4 1.4 0 0 1 12 21Z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="11" cy="7" r="1.2"/><circle cx="16" cy="8.5" r="1.2"/>'),
  "Aulas particulares": SVG('<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H3ZM21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7Z"/>'),
  "Montagem de móveis": SVG('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>'),
  "Entregas": SVG('<circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="m5.5 17 3.5-7h6l3.5 7M9 10 7.5 6H5M15 10l-2-4h2.5"/>'),
  "Outros": SVG('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function formatarValor(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatarData(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

function formatarMesAno(dataISO) {
  if (!dataISO) return "";
  const [ano, mes] = dataISO.split("-").map(Number);
  return `${MESES[mes - 1]} de ${ano}`;
}

function pegarIniciais(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

function primeiroNome(nome) {
  return nome.trim().split(/\s+/)[0];
}

function htmlAvatar(usuario, classe = "") {
  if (!usuario) return `<span class="avatar ${classe}" aria-hidden="true">?</span>`;

  if (usuario.foto) {
    const foto = String(usuario.foto).startsWith("data:image/") ? escapar(usuario.foto) : "";
    if (foto) return `<span class="avatar ${classe}" aria-hidden="true"><img src="${foto}" alt=""></span>`;
  }

  return `<span class="avatar ${classe}" aria-hidden="true">${escapar(pegarIniciais(usuario.nome))}</span>`;
}

function htmlEstrelas(nota, rotulo = true) {
  const cheias = Math.round(nota);
  const estrelas = [1, 2, 3, 4, 5]
    .map((n) => `<span class="${n <= cheias ? "cheia" : ""}">${ICONES.estrela}</span>`)
    .join("");
  const texto = rotulo ? `<span class="sr-only">${nota.toFixed(1).replace(".", ",")} de 5 estrelas</span>` : "";

  return `<span class="estrelas">${estrelas}${texto}</span>`;
}

function formatarNota(media) {
  return media.toFixed(1).replace(".", ",");
}

function nomeAutor(vaga) {
  const autor = buscarUsuarioPorId(vaga.autorId);
  return autor ? autor.nome : "Anônimo";
}

function linkPerfil(usuarioId) {
  return `perfil.html?id=${usuarioId}`;
}

function htmlFicha(vaga, conteudoRodape = "") {
  return `
    <article class="ficha">
      <h3 class="ficha-titulo">${escapar(vaga.titulo)}</h3>
      <p class="ficha-valor">${formatarValor(vaga.valor)}<small>${escapar(vaga.unidade)}</small></p>
      <span class="ficha-categoria">${escapar(vaga.categoria)}</span>
      <ul class="ficha-info">
        <li>${ICONES.local} ${escapar(vaga.bairro)}</li>
        <li>${ICONES.data} ${escapar(vaga.quando)}</li>
      </ul>
      ${conteudoRodape ? `<div class="ficha-rodape">${conteudoRodape}</div>` : ""}
    </article>
  `;
}

function htmlFichaLink(vaga, usuarioAtual) {
  const autor = buscarUsuarioPorId(vaga.autorId);
  const resumo = resumoAvaliacoes(vaga.autorId);
  const nota = resumo.total ? `<span class="nota-curta">${ICONES.estrela}${formatarNota(resumo.media)}</span>` : "";
  const candidatos = candidaturasAtivas(vaga.id).length;

  let selo = `<span class="ficha-candidatos">${ICONES.pessoas} ${candidatos === 0 ? "Seja o primeiro" : candidatos === 1 ? "1 candidato" : `${candidatos} candidatos`}</span>`;

  if (usuarioAtual && vaga.autorId === usuarioAtual.id) {
    selo = `<span class="ficha-selo ficha-selo-sua">Sua vaga</span>`;
  } else if (usuarioAtual) {
    const candidatura = buscarCandidatura(vaga.id, usuarioAtual.id);
    if (candidatura && candidatura.status === "desistiu") {
      selo = `<span class="ficha-selo ficha-selo-sua">Você desistiu</span>`;
    } else if (candidatura && candidatura.status === "recusada") {
      selo = `<span class="ficha-selo ficha-selo-sua">Não selecionado</span>`;
    } else if (candidatura) {
      selo = `<span class="ficha-selo">${ICONES.check} Candidatura enviada</span>`;
    }
  }

  const cidadeVaga = vaga.cidade || "Belo Horizonte";
  const outraCidade = vaga.bairro !== "Remoto" && usuarioAtual && !mesmaCidade(cidadeVaga, usuarioAtual.cidade);
  const local = outraCidade ? `${vaga.bairro}, ${cidadeVaga}` : vaga.bairro;

  return `
    <a class="ficha ficha-link" href="vaga.html?id=${vaga.id}">
      <h3 class="ficha-titulo">${escapar(vaga.titulo)}</h3>
      <p class="ficha-valor">${formatarValor(vaga.valor)}<small>${escapar(vaga.unidade)}</small></p>
      <span class="ficha-categoria">${escapar(vaga.categoria)}</span>
      <ul class="ficha-info">
        <li>${ICONES.local} ${escapar(local)}</li>
        <li>${ICONES.data} ${escapar(vaga.quando)}</li>
      </ul>
      <div class="ficha-rodape">
        <span class="ficha-autor-mini">
          ${htmlAvatar(autor, "avatar-mini")}
          <span>${escapar(autor ? autor.nome : "Anônimo")}</span>
          ${nota}
        </span>
        ${selo}
      </div>
    </a>
  `;
}

function preencherAvatarCabecalho(usuario) {
  const elAvatar = document.getElementById("avatar");
  elAvatar.outerHTML = htmlAvatar(usuario).replace('class="avatar ', 'id="avatar" class="avatar ');
  document.getElementById("usuario-nome").textContent = primeiroNome(usuario.nome);
}

function montarCabecalho() {
  const usuario = lerSessao();
  if (!usuario) return null;

  const pagina = document.body.dataset.pagina;

  preencherAvatarCabecalho(usuario);

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === pagina) link.setAttribute("aria-current", "page");
  });

  document.getElementById("btn-sair").addEventListener("click", sair);

  return usuario;
}

function mostrarToast(mensagem) {
  document.querySelector(".toast")?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `${ICONES.check}<span>${escapar(mensagem)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

function confirmar({ titulo, texto, botao = "Confirmar", perigo = false }) {
  let dialogo = document.getElementById("modal-confirmar");

  if (!dialogo) {
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="modal modal-pequeno" id="modal-confirmar" aria-labelledby="confirmar-titulo" aria-describedby="confirmar-texto">
        <form method="dialog">
          <div class="modal-corpo">
            <h2 id="confirmar-titulo"></h2>
            <p id="confirmar-texto"></p>
          </div>
          <div class="modal-rodape">
            <button type="submit" class="btn btn-contorno" value="nao">Voltar</button>
            <button type="submit" class="btn" value="sim" id="confirmar-sim"></button>
          </div>
        </form>
      </dialog>
    `);
    dialogo = document.getElementById("modal-confirmar");
  }

  document.getElementById("confirmar-titulo").textContent = titulo;
  document.getElementById("confirmar-texto").textContent = texto;

  const botaoSim = document.getElementById("confirmar-sim");
  botaoSim.textContent = botao;
  botaoSim.className = `btn ${perigo ? "btn-perigo" : "btn-primario"}`;

  dialogo.returnValue = "";
  dialogo.showModal();
  botaoSim.focus();

  return new Promise((resolver) => {
    dialogo.addEventListener("close", () => resolver(dialogo.returnValue === "sim"), { once: true });
  });
}
