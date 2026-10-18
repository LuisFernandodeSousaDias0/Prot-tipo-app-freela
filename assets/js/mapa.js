const RAIO_APROXIMADO = 400;

function criarMapa(elemento, { centro, zoom = 13, interativo = true } = {}) {
  const mapa = L.map(elemento, {
    center: centro || CENTROS_CIDADE["Belo Horizonte"],
    zoom,
    scrollWheelZoom: false,
    dragging: interativo,
    touchZoom: interativo,
    doubleClickZoom: interativo,
    boxZoom: interativo,
    keyboard: interativo,
    zoomControl: interativo
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  mapa.on("focus", () => mapa.scrollWheelZoom.enable());
  mapa.on("blur", () => mapa.scrollWheelZoom.disable());

  return mapa;
}

function iconeVaga(destaque = false) {
  return L.divIcon({
    className: "",
    html: `<span class="alfinete${destaque ? " alfinete-destaque" : ""}"><span></span></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36]
  });
}

function pontoAproximado(vaga) {
  return [Math.round(vaga.lat * 400) / 400, Math.round(vaga.lng * 400) / 400];
}

function htmlPopupVaga(vaga) {
  return `
    <div class="popup-vaga">
      <span class="popup-categoria">${escapar(vaga.categoria)}</span>
      <strong>${escapar(vaga.titulo)}</strong>
      <span class="popup-linha">${escapar(vaga.bairro)}, ${escapar(vaga.quando)}</span>
      <span class="popup-rodape">
        <span class="popup-valor">${formatarValor(vaga.valor)} <small>${escapar(vaga.unidade)}</small></span>
        <a href="vaga.html?id=${vaga.id}">Ver vaga</a>
      </span>
    </div>
  `;
}

function centroDaCidade(cidade) {
  return CENTROS_CIDADE[encontrarCidade(cidade)] || CENTROS_CIDADE["Belo Horizonte"];
}
