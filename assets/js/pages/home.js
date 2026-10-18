const usuario = lerSessao();
const vagas = lerVagas();
let candidaturas = usuario ? lerCandidaturas(usuario.id) : [];

const estado = {
  busca: "",
  categoria: "Todas"
};

const elChips = document.getElementById("chips");
const elLista = document.getElementById("lista-vagas");
const elInfo = document.getElementById("resultado-info");
const elVazio = document.getElementById("vazio");
const elBusca = document.getElementById("busca");

const ICONE_LOCAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const ICONE_DATA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
const ICONE_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function preencherCabecalho() {
  const primeiroNome = usuario.nome.split(" ")[0];
  const iniciais = usuario.nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  document.getElementById("avatar").textContent = iniciais;
  document.getElementById("usuario-nome").textContent = usuario.nome;
  document.getElementById("saudacao-titulo").textContent = `Olá, ${primeiroNome}.`;
  document.getElementById("saudacao-texto").textContent =
    `${vagas.length} bicos abertos em BH agora.`;
}

function renderizarChips() {
  const categorias = ["Todas", ...new Set(vagas.map((vaga) => vaga.categoria))];

  elChips.innerHTML = categorias
    .map((categoria) => `
      <li>
        <button type="button" class="chip" data-categoria="${escapar(categoria)}" aria-pressed="${categoria === estado.categoria}">
          ${escapar(categoria)}
        </button>
      </li>
    `)
    .join("");
}

function filtrarVagas() {
  const termo = normalizar(estado.busca.trim());

  return vagas.filter((vaga) => {
    const naCategoria = estado.categoria === "Todas" || vaga.categoria === estado.categoria;
    const textoVaga = normalizar(`${vaga.titulo} ${vaga.bairro} ${vaga.categoria}`);
    return naCategoria && textoVaga.includes(termo);
  });
}

function htmlBotaoCandidatar(vagaId) {
  const enviada = candidaturas.includes(vagaId);

  return `
    <button type="button" class="btn btn-primario btn-candidatar" data-vaga="${vagaId}" aria-pressed="${enviada}">
      ${enviada ? `${ICONE_CHECK} Candidatura enviada` : "Candidatar-se"}
    </button>
  `;
}

function renderizarLista() {
  const filtradas = filtrarVagas();

  elVazio.hidden = filtradas.length > 0;
  elInfo.hidden = filtradas.length === 0;
  elInfo.innerHTML = `<strong>${filtradas.length}</strong> ${filtradas.length === 1 ? "vaga encontrada" : "vagas encontradas"}`;

  elLista.innerHTML = filtradas
    .map((vaga) => `
      <li>
        <article class="ficha">
          <h3 class="ficha-titulo">${escapar(vaga.titulo)}</h3>
          <p class="ficha-valor">${formatarValor(vaga.valor)}<small>${escapar(vaga.unidade)}</small></p>
          <span class="ficha-categoria">${escapar(vaga.categoria)}</span>
          <ul class="ficha-info">
            <li>${ICONE_LOCAL} ${escapar(vaga.bairro)}</li>
            <li>${ICONE_DATA} ${escapar(vaga.quando)}</li>
          </ul>
          <div class="ficha-rodape">
            <p class="ficha-autor">Publicada por <strong>${escapar(vaga.autor)}</strong></p>
            ${htmlBotaoCandidatar(vaga.id)}
          </div>
        </article>
      </li>
    `)
    .join("");
}

elChips.addEventListener("click", (evento) => {
  const chip = evento.target.closest(".chip");
  if (!chip) return;

  estado.categoria = chip.dataset.categoria;
  elChips.querySelectorAll(".chip").forEach((botao) => {
    botao.setAttribute("aria-pressed", String(botao === chip));
  });
  renderizarLista();
});

elBusca.addEventListener("input", () => {
  estado.busca = elBusca.value;
  renderizarLista();
});

elLista.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".btn-candidatar");
  if (!botao) return;

  const vagaId = Number(botao.dataset.vaga);

  if (candidaturas.includes(vagaId)) {
    candidaturas = candidaturas.filter((id) => id !== vagaId);
  } else {
    candidaturas.push(vagaId);
  }

  salvarCandidaturas(usuario.id, candidaturas);
  botao.outerHTML = htmlBotaoCandidatar(vagaId);
});

document.getElementById("btn-limpar").addEventListener("click", () => {
  estado.busca = "";
  estado.categoria = "Todas";
  elBusca.value = "";
  renderizarChips();
  renderizarLista();
  elBusca.focus();
});

document.getElementById("btn-sair").addEventListener("click", sair);

if (usuario) {
  preencherCabecalho();
  renderizarChips();
  renderizarLista();
}
