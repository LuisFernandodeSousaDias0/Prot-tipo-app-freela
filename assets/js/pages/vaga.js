const usuario = montarCabecalho();
const vagaId = Number(new URLSearchParams(window.location.search).get("id"));

const ICONE_DINHEIRO = SVG('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>');
const ICONE_VOLTAR = SVG('<path d="M15 6l-6 6 6 6"/>', 'stroke-width="2.5"');

function textoCandidatos(total) {
  if (total === 0) return "Ninguém ainda";
  return total === 1 ? "1 pessoa" : `${total} pessoas`;
}

function renderizarCabecalho(vaga) {
  const local = vaga.bairro === "Remoto" ? "Remoto" : `${vaga.bairro}, ${vaga.cidade || "Belo Horizonte"}`;

  document.getElementById("vaga-cabecalho").innerHTML = `
    <span class="vaga-categoria"><span>${ICONES_CATEGORIA[vaga.categoria] || ""}</span>${escapar(vaga.categoria)}</span>
    <h1>${escapar(vaga.titulo)}</h1>
    <ul class="vaga-meta">
      <li>${ICONES.local} ${escapar(local)}</li>
      <li>${ICONES.data} ${escapar(vaga.quando)}</li>
    </ul>
  `;
}

function renderizarCorpo(vaga) {
  const candidatos = candidaturasAtivas(vaga.id).length;
  const local = vaga.bairro === "Remoto" ? "Pode ser feito a distância" : `${vaga.bairro}, ${vaga.cidade || "Belo Horizonte"}`;

  document.getElementById("vaga-descricao").textContent =
    vaga.descricao || "Quem publicou não deixou uma descrição. Candidate-se e combine os detalhes direto.";

  const detalhes = [
    { icone: ICONE_DINHEIRO, rotulo: "Pagamento", valor: `${formatarValor(vaga.valor)} ${vaga.unidade}` },
    { icone: ICONES.data, rotulo: "Dia e horário", valor: vaga.quando },
    { icone: ICONES.local, rotulo: "Local", valor: local },
    { icone: ICONES.pessoas, rotulo: "Candidatos", valor: textoCandidatos(candidatos) }
  ];

  if (vaga.criadaEm) {
    detalhes.push({ icone: ICONES.relogio, rotulo: "Publicada em", valor: formatarData(vaga.criadaEm) });
  }

  document.getElementById("vaga-detalhes").innerHTML = detalhes.map((d) => `
    <li>
      <span class="icone-detalhe">${d.icone}</span>
      <div>
        <p class="rotulo">${d.rotulo}</p>
        <p class="valor">${escapar(d.valor)}</p>
      </div>
    </li>
  `).join("");
}

let mapaVaga = null;

function renderizarLocal(vaga) {
  const alvo = document.getElementById("local-vaga");

  if (vaga.bairro === "Remoto") {
    alvo.innerHTML = `
      <div class="local-remoto">
        <span class="icone-detalhe">${SVG('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>')}</span>
        <div>
          <strong>Feito a distância</strong>
          <p>Não precisa ir até nenhum lugar. Os detalhes e as entregas são combinados online com quem publicou.</p>
        </div>
      </div>
    `;
    return;
  }

  const textoRegiao = `Região aproximada de ${escapar(vaga.bairro)}, ${escapar(vaga.cidade || "Belo Horizonte")}. O endereço exato é combinado depois que alguém é escolhido.`;

  if (!pontoValido(vaga.lat, vaga.lng) || typeof L === "undefined") {
    alvo.innerHTML = `<p class="mapa-nota">${textoRegiao}</p>`;
    return;
  }

  if (mapaVaga) return;

  alvo.innerHTML = `
    <div class="mapa mapa-vaga" id="mapa-vaga" aria-label="Mapa com a região aproximada da vaga"></div>
    <p class="mapa-nota">${textoRegiao}</p>
  `;

  const ponto = pontoAproximado(vaga);
  mapaVaga = criarMapa(document.getElementById("mapa-vaga"), { centro: ponto, zoom: 14 });
  L.circle(ponto, {
    radius: RAIO_APROXIMADO,
    color: "#2b1608",
    weight: 2,
    fillColor: "#ff6b2c",
    fillOpacity: 0.35
  }).addTo(mapaVaga);
}

function htmlPreco(vaga) {
  return `<p class="preco">${formatarValor(vaga.valor)}<small>${escapar(vaga.unidade)}</small></p>`;
}

function renderizarAcao(vaga) {
  const elAcao = document.getElementById("cartao-acao");
  const autor = buscarUsuarioPorId(vaga.autorId);
  const nomeAutor = autor ? primeiroNome(autor.nome) : "quem publicou";
  let conteudo = "";

  if (vaga.autorId === usuario.id) {
    const pendentes = candidaturasDaVaga(vaga.id).filter((c) => c.status === "pendente").length;
    const ajuda = {
      aberta: pendentes ? "Escolha quem vai fazer o serviço na sua caixa de entrada." : "Assim que alguém se candidatar, aparece na sua caixa de entrada.",
      em_andamento: "Você já escolheu alguém. Marque como concluído quando terminar.",
      concluida: "Serviço concluído."
    }[vaga.status];

    conteudo = `
      ${htmlPreco(vaga)}
      <a href="perfil.html#caixa" class="btn btn-escuro btn-grande">${ICONES.caixa} Ver candidatos${pendentes ? ` (${pendentes})` : ""}</a>
      <p class="acao-ajuda">${ajuda}</p>
    `;
  } else {
    const candidatura = buscarCandidatura(vaga.id, usuario.id);

    if (!candidatura && vaga.status === "aberta") {
      conteudo = `
        ${htmlPreco(vaga)}
        <button type="button" class="btn btn-primario btn-grande" data-acao="candidatar">Candidatar-se</button>
        <p class="acao-ajuda">${escapar(nomeAutor)} recebe seu perfil e escolhe quem vai fazer o serviço.</p>
      `;
    } else if (!candidatura) {
      conteudo = `
        ${htmlPreco(vaga)}
        <button type="button" class="btn btn-grande" disabled>Vaga preenchida</button>
        <p class="acao-ajuda">Essa vaga não recebe mais candidaturas. Veja as parecidas abaixo.</p>
      `;
    } else if (candidatura.status === "pendente") {
      conteudo = `
        ${htmlPreco(vaga)}
        <button type="button" class="btn btn-escuro btn-grande" disabled>${ICONES.check} Candidatura enviada</button>
        <p class="acao-ajuda">A resposta aparece em <a href="perfil.html#candidaturas">Minhas candidaturas</a>. <button type="button" data-acao="desistir">Desistir</button></p>
      `;
    } else if (candidatura.status === "desistiu") {
      conteudo = `
        ${htmlPreco(vaga)}
        <span class="status status-recusada">Você desistiu</span>
        <p class="acao-ajuda">Quem desiste não pode se candidatar de novo à mesma vaga.</p>
      `;
    } else if (candidatura.status === "aceita" && vaga.status === "concluida") {
      const avaliou = jaAvaliou(vaga.id, usuario.id);
      conteudo = `
        ${htmlPreco(vaga)}
        <span class="status status-concluida">Serviço concluído</span>
        <p class="acao-ajuda">${avaliou ? "Você já avaliou esse serviço." : `<a href="perfil.html#candidaturas">Avaliar ${escapar(nomeAutor)}</a>`}</p>
      `;
    } else if (candidatura.status === "aceita") {
      conteudo = `
        ${htmlPreco(vaga)}
        <span class="status status-aceita">Você foi escolhido</span>
        <p class="acao-ajuda">Combine os detalhes com ${escapar(nomeAutor)}.</p>
      `;
    } else {
      conteudo = `
        ${htmlPreco(vaga)}
        <span class="status status-recusada">Não selecionado</span>
        <p class="acao-ajuda">Outra pessoa foi escolhida para essa vaga.</p>
      `;
    }
  }

  elAcao.innerHTML = conteudo;
}

function renderizarAutor(vaga) {
  const autor = buscarUsuarioPorId(vaga.autorId);
  if (!autor) return;

  const resumo = resumoAvaliacoes(autor.id);
  const contratacoes = lerVagas().filter((v) => v.autorId === autor.id && v.status === "concluida").length;

  const nota = resumo.total
    ? `${htmlEstrelas(resumo.media)} <strong>${formatarNota(resumo.media)}</strong> (${resumo.total})`
    : `${ICONES.estrela} Ainda sem avaliações`;

  document.getElementById("cartao-autor").innerHTML = `
    <h2>${vaga.autorId === usuario.id ? "Publicada por você" : "Quem publicou"}</h2>
    <div class="autor-cabeca">
      ${htmlAvatar(autor)}
      <div>
        <a href="${linkPerfil(autor.id)}">${escapar(autor.nome)}</a>
        ${autor.titulo ? `<p>${escapar(autor.titulo)}</p>` : ""}
      </div>
    </div>
    <ul class="autor-dados">
      <li>${nota}</li>
      <li>${ICONES.maleta} ${contratacoes === 0 ? "Primeira contratação pelo Free-la" : `Já contratou <strong>${contratacoes}</strong> ${contratacoes === 1 ? "vez" : "vezes"} pelo Free-la`}</li>
      <li>${ICONES.relogio} No Free-la desde ${formatarMesAno(autor.criadoEm)}</li>
    </ul>
    <a href="${linkPerfil(autor.id)}" class="btn btn-contorno">Ver perfil completo</a>
  `;
}

function renderizarParecidas(vaga) {
  const cidade = encontrarCidade(usuario.cidade) || "Belo Horizonte";
  const perto = (v) => v.bairro === "Remoto" || mesmaCidade(v.cidade || "Belo Horizonte", cidade);
  const pontos = (v) => (v.categoria === vaga.categoria ? 2 : 0) + (perto(v) ? 1 : 0);
  const lista = lerVagas()
    .filter((v) => v.status === "aberta" && v.id !== vaga.id && v.autorId !== usuario.id && perto(v))
    .sort((a, b) => pontos(b) - pontos(a) || b.id - a.id)
    .slice(0, 3);

  if (!lista.length) {
    document.getElementById("secao-parecidas").hidden = true;
    return;
  }

  document.getElementById("vagas-parecidas").innerHTML = lista
    .map((v) => `<li>${htmlFichaLink(v, usuario)}</li>`)
    .join("");
}

function renderizarTudo() {
  const vaga = buscarVaga(vagaId);

  if (!vaga) {
    document.getElementById("vaga").innerHTML = `
      <div class="container vaga-nao-encontrada">
        <h1>Vaga não encontrada</h1>
        <p>Ela pode ter sido removida ou o link está incorreto.</p>
        <a href="home.html" class="btn btn-primario">${ICONE_VOLTAR} Ver vagas abertas</a>
      </div>
    `;
    return;
  }

  document.title = `${vaga.titulo} | Free-la`;
  renderizarCabecalho(vaga);
  renderizarCorpo(vaga);
  renderizarLocal(vaga);
  renderizarAcao(vaga);
  renderizarAutor(vaga);
  renderizarParecidas(vaga);
}

document.getElementById("cartao-acao").addEventListener("click", async (evento) => {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return;

  if (botao.dataset.acao === "candidatar") {
    const resultado = candidatar(vagaId, usuario.id);
    mostrarToast(resultado.ok ? "Candidatura enviada." : resultado.erro);
  } else if (botao.dataset.acao === "desistir") {
    const ok = await confirmar({
      titulo: "Desistir da candidatura?",
      texto: "Você não vai poder se candidatar de novo a essa vaga.",
      botao: "Desistir",
      perigo: true
    });
    if (!ok) return;
    desistirCandidatura(vagaId, usuario.id);
    mostrarToast("Candidatura retirada.");
  }

  renderizarTudo();
});

if (usuario) renderizarTudo();
