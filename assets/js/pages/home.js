const usuario = montarCabecalho();

const TODAS_CIDADES = "todas";

const estado = {
  busca: "",
  categoria: "Todas",
  cidade: usuario ? encontrarCidade(usuario.cidade) || "Belo Horizonte" : "Belo Horizonte",
  vista: "lista"
};

let mapa = null;
let camadaVagas = null;

const elCategorias = document.getElementById("categorias");
const elLista = document.getElementById("lista-vagas");
const elInfo = document.getElementById("resultado-info");
const elVazio = document.getElementById("vazio");
const elBusca = document.getElementById("busca");
const elCidade = document.getElementById("filtro-cidade");

function vagasAbertas() {
  return lerVagas()
    .filter((vaga) => vaga.status === "aberta")
    .sort((a, b) => b.id - a.id);
}

function ehRemota(vaga) {
  return vaga.bairro === "Remoto";
}

function naCidade(vaga, cidade) {
  return cidade === TODAS_CIDADES || ehRemota(vaga) || mesmaCidade(vaga.cidade || "Belo Horizonte", cidade);
}

function textoCidade(cidade) {
  return cidade === TODAS_CIDADES ? "na Grande BH" : `em ${cidade}`;
}

function saudacaoDoHorario() {
  const hora = new Date().getHours();
  if (hora < 5) return "Boa noite";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function preencherBanner() {
  const cidade = encontrarCidade(usuario.cidade) || "Belo Horizonte";
  const daCidade = vagasAbertas().filter((vaga) => naCidade(vaga, cidade) && vaga.autorId !== usuario.id);
  const total = daCidade.length;

  document.getElementById("saudacao-titulo").textContent =
    `${saudacaoDoHorario()}, ${primeiroNome(usuario.nome)}.`;
  document.getElementById("saudacao-texto").textContent =
    total
      ? `Tem ${total} ${total === 1 ? "bico aberto" : "bicos abertos"} em ${cidade} e a distância. O próximo pode começar hoje.`
      : `Ainda não tem bicos abertos em ${cidade}. Que tal publicar o primeiro?`;

  const pendentes = contarPendentesParaAutor(usuario.id);
  if (pendentes > 0) {
    document.getElementById("alerta-numero").textContent = pendentes;
    document.getElementById("alerta-texto").textContent =
      pendentes === 1 ? "pessoa se candidatou às suas vagas." : "pessoas se candidataram às suas vagas.";
    document.getElementById("banner-alerta").hidden = false;
  }

  const novas = daCidade.slice(0, 2);
  document.querySelector(".banner-novas").hidden = novas.length === 0;
  document.getElementById("lista-novas").innerHTML = novas
    .map((vaga) => `<li>${htmlFichaLink(vaga, usuario)}</li>`)
    .join("");
}

function mostrarAviso() {
  const mensagem = pegarAviso();
  if (!mensagem) return;

  document.getElementById("aviso-texto").textContent = mensagem;
  document.getElementById("aviso").hidden = false;
}

function renderizarCategorias() {
  const categorias = ["Todas", ...CATEGORIAS];

  elCategorias.innerHTML = categorias
    .map((categoria) => `
      <li>
        <button type="button" class="categoria-btn" data-categoria="${escapar(categoria)}" aria-pressed="${categoria === estado.categoria}">
          <span>${ICONES_CATEGORIA[categoria]}</span>
          <span>${categoria === "Todas" ? "Todas as vagas" : escapar(categoria)}</span>
        </button>
      </li>
    `)
    .join("");
}

function renderizarCidades() {
  const opcoes = CIDADES.map((cidade) => {
    const total = vagasAbertas().filter((vaga) => !ehRemota(vaga) && mesmaCidade(vaga.cidade || "Belo Horizonte", cidade)).length;
    const sua = mesmaCidade(cidade, usuario.cidade) ? ", sua cidade" : "";
    return `<option value="${escapar(cidade)}">${escapar(cidade)}${sua} (${total})</option>`;
  });

  elCidade.innerHTML = `${opcoes.join("")}<option value="${TODAS_CIDADES}">Todas as cidades</option>`;
  elCidade.value = estado.cidade;
}

function filtrarVagas() {
  const termo = normalizar(estado.busca.trim());

  return vagasAbertas().filter((vaga) => {
    const naCategoria = estado.categoria === "Todas" || vaga.categoria === estado.categoria;
    const texto = normalizar(`${vaga.titulo} ${vaga.bairro} ${vaga.categoria} ${vaga.cidade || ""}`);
    return naCategoria && naCidade(vaga, estado.cidade) && texto.includes(termo);
  });
}

function preencherVazio() {
  const temOutroFiltro = estado.busca.trim() || estado.categoria !== "Todas";
  const titulo = document.getElementById("vazio-titulo");
  const texto = document.getElementById("vazio-texto");
  const botao = document.getElementById("btn-limpar");

  if (temOutroFiltro) {
    titulo.textContent = `Nenhuma vaga com esse filtro ${textoCidade(estado.cidade)}`;
    texto.textContent = "Tente outra palavra ou veja todas as categorias.";
    botao.textContent = "Limpar filtros";
    botao.dataset.alvo = "filtros";
  } else {
    titulo.textContent = `Ainda não tem vagas ${textoCidade(estado.cidade)}`;
    texto.textContent = "Veja as vagas de outras cidades da Grande BH ou publique a primeira daqui.";
    botao.textContent = "Ver todas as cidades";
    botao.dataset.alvo = "cidades";
  }
}

function renderizarLista() {
  const filtradas = filtrarVagas();

  elVazio.hidden = filtradas.length > 0;
  if (!filtradas.length) preencherVazio();

  elInfo.innerHTML = `<strong>${filtradas.length}</strong> ${filtradas.length === 1 ? "vaga" : "vagas"} ${escapar(textoCidade(estado.cidade))}, contando as feitas a distância`;

  elLista.innerHTML = filtradas
    .map((vaga) => `<li>${htmlFichaLink(vaga, usuario)}</li>`)
    .join("");

  renderizarMapa(filtradas);
}

function renderizarMapa(filtradas) {
  if (estado.vista !== "mapa") return;

  const elMapa = document.getElementById("mapa-vagas");
  const cidadeCentro = estado.cidade === TODAS_CIDADES ? "Belo Horizonte" : estado.cidade;

  if (!mapa) {
    mapa = criarMapa(elMapa, { centro: centroDaCidade(cidadeCentro), zoom: 12 });
    camadaVagas = L.layerGroup().addTo(mapa);
  }

  mapa.invalidateSize();
  camadaVagas.clearLayers();

  const presenciais = filtradas.filter((vaga) => !ehRemota(vaga) && pontoValido(vaga.lat, vaga.lng));
  const pontos = presenciais.map((vaga) => {
    const ponto = pontoAproximado(vaga);
    L.marker(ponto, { icon: iconeVaga(vaga.autorId === usuario.id), title: vaga.titulo, alt: vaga.titulo })
      .bindPopup(htmlPopupVaga(vaga))
      .addTo(camadaVagas);
    return ponto;
  });

  if (pontos.length) {
    mapa.fitBounds(L.latLngBounds(pontos), { padding: [48, 48], maxZoom: 14 });
  } else {
    mapa.setView(centroDaCidade(cidadeCentro), 12);
  }

  const remotas = filtradas.filter(ehRemota);
  document.getElementById("bloco-remotas").hidden = remotas.length === 0;
  document.getElementById("lista-remotas").innerHTML = remotas
    .map((vaga) => `<li>${htmlFichaLink(vaga, usuario)}</li>`)
    .join("");
}

function trocarVista(vista) {
  estado.vista = vista;

  document.querySelectorAll("[data-vista]").forEach((botao) => {
    botao.setAttribute("aria-pressed", String(botao.dataset.vista === vista));
  });

  elLista.hidden = vista === "mapa";
  document.getElementById("vista-mapa").hidden = vista !== "mapa";

  try {
    localStorage.setItem("freela_vista", vista);
  } catch (erro) {}

  renderizarLista();
}

elCategorias.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".categoria-btn");
  if (!botao) return;

  estado.categoria = botao.dataset.categoria;
  elCategorias.querySelectorAll(".categoria-btn").forEach((item) => {
    item.setAttribute("aria-pressed", String(item === botao));
  });
  renderizarLista();
});

elBusca.addEventListener("input", () => {
  estado.busca = elBusca.value;
  renderizarLista();
});

document.getElementById("form-busca").addEventListener("submit", (evento) => {
  evento.preventDefault();
  estado.busca = elBusca.value;
  renderizarLista();
  document.getElementById("vagas").scrollIntoView({ behavior: "smooth" });
});

document.querySelector(".alternar-vista").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-vista]");
  if (botao) trocarVista(botao.dataset.vista);
});

elCidade.addEventListener("change", () => {
  estado.cidade = elCidade.value;
  renderizarLista();
});

document.getElementById("btn-limpar").addEventListener("click", (evento) => {
  if (evento.currentTarget.dataset.alvo === "cidades") {
    estado.cidade = TODAS_CIDADES;
    elCidade.value = TODAS_CIDADES;
    renderizarLista();
    elCidade.focus();
    return;
  }

  estado.busca = "";
  estado.categoria = "Todas";
  elBusca.value = "";
  renderizarCategorias();
  renderizarLista();
  elBusca.focus();
});

if (usuario) {
  preencherBanner();
  mostrarAviso();
  renderizarCategorias();
  renderizarCidades();
  trocarVista(localStorage.getItem("freela_vista") === "mapa" ? "mapa" : "lista");
}
