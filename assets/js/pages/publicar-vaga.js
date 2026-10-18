const usuario = montarCabecalho();

const form = document.getElementById("form-vaga");
const campos = {
  titulo: document.getElementById("titulo"),
  categoria: document.getElementById("categoria"),
  descricao: document.getElementById("descricao"),
  cidade: document.getElementById("cidade"),
  bairro: document.getElementById("bairro"),
  remoto: document.getElementById("remoto"),
  data: document.getElementById("data"),
  hora: document.getElementById("hora"),
  valor: document.getElementById("valor"),
  unidade: document.getElementById("unidade")
};

let pontoEscolhido = null;
let marcadorEscolhido = null;
let mapaPublicar = null;

function marcarPonto(latlng) {
  pontoEscolhido = [Number(latlng.lat.toFixed(5)), Number(latlng.lng.toFixed(5))];

  if (!marcadorEscolhido) {
    marcadorEscolhido = L.marker(pontoEscolhido, { icon: iconeVaga(), draggable: true, title: "Local do serviço" }).addTo(mapaPublicar);
    marcadorEscolhido.on("dragend", () => marcarPonto(marcadorEscolhido.getLatLng()));
  } else {
    marcadorEscolhido.setLatLng(pontoEscolhido);
  }

  limparErro(document.getElementById("mapa-publicar"));
}

function iniciarMapaPublicar() {
  if (typeof L === "undefined") {
    document.getElementById("campo-mapa").hidden = true;
    return;
  }

  mapaPublicar = criarMapa(document.getElementById("mapa-publicar"), {
    centro: centroDaCidade(campos.cidade.value),
    zoom: 13
  });

  mapaPublicar.on("click", (evento) => marcarPonto(evento.latlng));

  document.getElementById("usar-centro").addEventListener("click", () => {
    const centro = centroDaCidade(campos.cidade.value);
    mapaPublicar.setView(centro, 14);
    marcarPonto({ lat: centro[0], lng: centro[1] });
  });

  campos.cidade.addEventListener("change", () => {
    if (encontrarCidade(campos.cidade.value)) mapaPublicar.setView(centroDaCidade(campos.cidade.value), 13);
  });
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatarHora(hora) {
  if (!hora) return "";
  const [h, m] = hora.split(":").map(Number);
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function formatarQuando(data, hora) {
  if (!data) return "Dia a combinar";

  const [ano, mes, dia] = data.split("-").map(Number);
  const escolhida = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diferenca = Math.round((escolhida - hoje) / 86400000);

  let textoDia;
  if (diferenca === 0) textoDia = "Hoje";
  else if (diferenca === 1) textoDia = "Amanhã";
  else textoDia = `${DIAS_SEMANA[escolhida.getDay()]}, ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;

  const textoHora = formatarHora(hora);
  return textoHora ? `${textoDia}, ${textoHora}` : textoDia;
}

function lerFormulario() {
  return {
    titulo: limparEspacos(campos.titulo.value),
    categoria: campos.categoria.value,
    descricao: campos.descricao.value.trim().replace(/\n{3,}/g, "\n\n"),
    cidade: limparEspacos(campos.cidade.value),
    bairro: campos.remoto.checked ? "Remoto" : limparEspacos(campos.bairro.value),
    data: campos.data.value,
    hora: campos.hora.value,
    valor: Number(campos.valor.value),
    unidade: campos.unidade.value
  };
}

function atualizarPrevia() {
  const dados = lerFormulario();

  const vagaPrevia = {
    titulo: dados.titulo || "Título da sua vaga",
    categoria: dados.categoria || "Categoria",
    bairro: dados.bairro || "Bairro",
    quando: formatarQuando(dados.data, dados.hora),
    valor: dados.valor > 0 ? dados.valor : 0,
    unidade: dados.unidade
  };

  const rodape = `<p class="ficha-autor">Por <strong>${escapar(usuario.nome)}</strong></p>`;
  document.getElementById("previa-ficha").innerHTML = htmlFicha(vagaPrevia, rodape);

  const elDescricao = document.getElementById("previa-descricao");
  elDescricao.textContent = dados.descricao || "A descrição aparece aqui.";
  elDescricao.classList.toggle("vazio-texto", !dados.descricao);

  document.getElementById("contador-titulo").textContent = `${campos.titulo.value.length}/60`;
  document.getElementById("contador-descricao").textContent = `${campos.descricao.value.length}/400`;
}

function mostrarErro(input, mensagem) {
  const campo = input.closest(".campo");
  campo.classList.add("erro");
  campo.querySelector(".campo-erro").textContent = mensagem;
  input.setAttribute("aria-invalid", "true");
}

function limparErro(input) {
  const campo = input.closest(".campo");
  if (!campo) return;
  campo.classList.remove("erro");
  input.removeAttribute("aria-invalid");
}

function horaAgora() {
  const agora = new Date();
  return `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
}

function validar(dados) {
  const erros = [];

  erros.push([campos.titulo, validarTextoLivre(dados.titulo, { nome: "o título", minimo: 5, maximo: 60 })]);

  if (!CATEGORIAS.includes(dados.categoria)) {
    erros.push([campos.categoria, "Escolha a categoria que mais combina com o serviço."]);
  }

  erros.push([campos.descricao, validarTextoLivre(dados.descricao, { nome: "a descrição", minimo: 20, maximo: 400 })]);
  erros.push([campos.cidade, validarCidade(dados.cidade)]);

  if (!campos.remoto.checked && mapaPublicar && !pontoValido(pontoEscolhido?.[0], pontoEscolhido?.[1])) {
    erros.push([document.getElementById("mapa-publicar"), "Marque no mapa onde vai ser o serviço, ou use o centro da cidade."]);
  }

  if (!campos.remoto.checked) {
    const erroBairro = validarLugar(dados.bairro, "o", "bairro");
    erros.push([campos.bairro, erroBairro ? `${erroBairro} Ou marque que pode ser feito a distância.` : ""]);
  }

  const limiteData = somarDias(hojeISO(), LIMITES.diasAntecedencia);
  if (!dados.data) {
    erros.push([campos.data, "Escolha o dia do serviço."]);
  } else if (dados.data < hojeISO()) {
    erros.push([campos.data, "Esse dia já passou. Escolha hoje ou uma data futura."]);
  } else if (dados.data > limiteData) {
    erros.push([campos.data, `Escolha uma data nos próximos ${LIMITES.diasAntecedencia} dias.`]);
  }

  if (dados.data === hojeISO() && dados.hora && dados.hora <= horaAgora()) {
    erros.push([campos.hora, "Esse horário já passou. Escolha um horário mais tarde ou outro dia."]);
  }

  if (!campos.valor.value) {
    erros.push([campos.valor, "Digite quanto você vai pagar, em reais."]);
  } else if (!Number.isInteger(dados.valor)) {
    erros.push([campos.valor, "Use um valor em reais inteiros, sem centavos."]);
  } else if (dados.valor < LIMITES.valorMinimo || dados.valor > LIMITES.valorMaximo) {
    erros.push([campos.valor, `O valor precisa ficar entre ${formatarValor(LIMITES.valorMinimo)} e ${formatarValor(LIMITES.valorMaximo)}.`]);
  }

  if (!["valor fechado", "por dia", "por hora"].includes(dados.unidade)) {
    erros.push([campos.unidade, "Escolha a forma de cobrança."]);
  }

  let valido = true;
  erros.forEach(([campo, mensagem]) => {
    if (mensagem) {
      mostrarErro(campo, mensagem);
      valido = false;
    }
  });

  return valido;
}

function verificarLimite() {
  const atingiu = contarVagasAbertas(usuario.id) >= LIMITES.vagasAbertasPorUsuario;
  document.getElementById("alerta-limite").classList.toggle("visivel", atingiu);
  form.querySelector("button[type='submit']").disabled = atingiu;
  return !atingiu;
}

campos.categoria.innerHTML += CATEGORIAS
  .map((categoria) => `<option value="${escapar(categoria)}">${escapar(categoria)}</option>`)
  .join("");

campos.data.min = hojeISO();
campos.data.max = somarDias(hojeISO(), LIMITES.diasAntecedencia);

if (usuario) {
  campos.cidade.value = usuario.cidade || "Belo Horizonte";
}

campos.remoto.addEventListener("change", () => {
  campos.bairro.disabled = campos.remoto.checked;
  document.getElementById("campo-mapa").hidden = campos.remoto.checked;
  if (!campos.remoto.checked && mapaPublicar) mapaPublicar.invalidateSize();
  if (campos.remoto.checked) {
    campos.bairro.value = "";
    limparErro(campos.bairro);
  }
});

Object.values(campos).forEach((input) => {
  const evento = input.tagName === "SELECT" || input.type === "checkbox" ? "change" : "input";
  input.addEventListener(evento, () => {
    limparErro(input);
    atualizarPrevia();
  });
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = lerFormulario();

  if (!verificarLimite()) {
    document.getElementById("alerta-limite").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!validar(dados)) {
    form.querySelector("[aria-invalid='true']").focus();
    return;
  }

  const criada = criarVaga({
    titulo: dados.titulo,
    categoria: dados.categoria,
    descricao: dados.descricao,
    cidade: encontrarCidade(dados.cidade),
    bairro: dados.bairro,
    ...(campos.remoto.checked || !pontoEscolhido ? {} : { lat: pontoEscolhido[0], lng: pontoEscolhido[1] }),
    data: dados.data,
    hora: dados.hora,
    quando: formatarQuando(dados.data, dados.hora),
    valor: dados.valor,
    unidade: dados.unidade,
    autorId: usuario.id
  });

  if (!criada) {
    verificarLimite();
    return;
  }

  form.querySelector("button[type='submit']").disabled = true;

  guardarAviso(`Vaga "${dados.titulo}" publicada. Ela já aparece no topo da lista.`);
  window.location.href = "home.html";
});

if (usuario) {
  atualizarPrevia();
  verificarLimite();
  iniciarMapaPublicar();
}
