const eu = montarCabecalho();
const parametros = new URLSearchParams(window.location.search);
const perfilId = Number(parametros.get("id")) || (eu ? eu.id : 0);
const ehDono = Boolean(eu) && perfilId === eu.id;
let pessoa = buscarUsuarioPorId(perfilId);

const ABAS = ehDono
  ? ["visao", "trabalhos", "avaliacoes", "caixa", "candidaturas"]
  : ["visao", "trabalhos", "avaliacoes"];

const LEGENDAS_NOTA = ["", "Ruim", "Fraco", "Ok", "Bom", "Excelente"];

const STATUS_CANDIDATURA = {
  pendente: { texto: "Aguardando resposta", classe: "status-pendente" },
  aceita: { texto: "Você foi escolhido", classe: "status-aceita" },
  recusada: { texto: "Não selecionado", classe: "status-recusada" },
  desistiu: { texto: "Você desistiu", classe: "status-recusada" },
  concluida: { texto: "Concluído", classe: "status-concluida" }
};

const STATUS_VAGA = {
  aberta: { texto: "Recebendo candidatos", classe: "status-pendente" },
  em_andamento: { texto: "Em andamento", classe: "status-andamento" },
  concluida: { texto: "Concluída", classe: "status-concluida" }
};

let avaliacaoAtual = null;

function htmlStatus({ texto, classe }) {
  return `<span class="status ${classe}">${texto}</span>`;
}

function htmlLateral() {
  const resumo = resumoAvaliacoes(pessoa.id);
  const trabalhos = trabalhosConcluidos(pessoa.id).length;

  const titulo = pessoa.titulo
    ? `<p class="perfil-titulo">${escapar(pessoa.titulo)}</p>`
    : ehDono
      ? `<p class="perfil-titulo vazio-texto">Adicione um título profissional</p>`
      : "";

  const botaoEditar = ehDono
    ? `<button type="button" class="btn btn-contorno btn-editar" data-acao="editar">${ICONES.lapis} Editar perfil</button>`
    : "";

  const email = ehDono
    ? `<li>${ICONES.email} ${escapar(pessoa.email)}</li>`
    : "";

  const habilidades = (pessoa.habilidades || []).length
    ? `
      <div class="perfil-habilidades">
        <h2>O que sabe fazer</h2>
        <ul class="lista-chips">
          ${pessoa.habilidades.map((h) => `<li>${ICONES_CATEGORIA[h] || ""}${escapar(h)}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  return `
    ${htmlAvatar(pessoa, "perfil-foto")}
    <h1>${escapar(pessoa.nome)}</h1>
    ${titulo}
    ${botaoEditar}
    <div class="perfil-reputacao">
      <div class="reputacao-item">
        <strong>${ICONES.estrela}${resumo.total ? formatarNota(resumo.media) : "Novo"}</strong>
        <span>${resumo.total ? `${resumo.total} ${resumo.total === 1 ? "avaliação" : "avaliações"}` : "ainda sem avaliações"}</span>
      </div>
      <div class="reputacao-item">
        <strong>${trabalhos}</strong>
        <span>${trabalhos === 1 ? "trabalho concluído" : "trabalhos concluídos"}</span>
      </div>
    </div>
    <ul class="perfil-info">
      <li>${ICONES.local} ${escapar(pessoa.cidade || "Cidade não informada")}</li>
      <li>${ICONES.relogio} No Free-la desde ${formatarMesAno(pessoa.criadoEm)}</li>
      ${email}
    </ul>
    ${habilidades}
  `;
}

function htmlAvaliacao(avaliacao, mostrarServico = true) {
  const autor = buscarUsuarioPorId(avaliacao.autorId);
  const vaga = buscarVaga(avaliacao.vagaId);
  const papel = avaliacao.papel === "prestador" ? "Como prestador" : "Como contratante";

  return `
    <li class="avaliacao">
      ${htmlAvatar(autor)}
      <div class="avaliacao-topo">
        <a href="${linkPerfil(avaliacao.autorId)}">${escapar(autor ? autor.nome : "Usuário")}</a>
        ${htmlEstrelas(avaliacao.nota)}
        <span class="papel">${papel}</span>
      </div>
      <p class="comentario">${escapar(avaliacao.comentario)}</p>
      <p class="meta">${mostrarServico && vaga ? `${escapar(vaga.titulo)}, ` : ""}${formatarData(avaliacao.criadaEm)}</p>
    </li>
  `;
}

function htmlVisao() {
  const nome = primeiroNome(pessoa.nome);

  const sobre = pessoa.sobre
    ? `<p class="texto-sobre">${escapar(pessoa.sobre)}</p>`
    : ehDono
      ? `<p class="bloco-vazio">Conte quem você é, como trabalha e quando está disponível.<button type="button" class="link-botao" data-acao="editar">Escrever agora</button></p>`
      : `<p class="bloco-vazio">${escapar(nome)} ainda não escreveu sobre si.</p>`;

  const experiencias = pessoa.experiencias || [];
  const experiencia = experiencias.length
    ? `
      <ul class="linha-tempo">
        ${experiencias.map((exp) => `
          <li>
            <h3>${escapar(exp.titulo)}</h3>
            <p class="meta">${escapar([exp.local, exp.periodo].filter(Boolean).join(", "))}</p>
            ${exp.descricao ? `<p>${escapar(exp.descricao)}</p>` : ""}
          </li>
        `).join("")}
      </ul>
    `
    : ehDono
      ? `<p class="bloco-vazio">Adicione trabalhos e empregos anteriores, como num currículo.<button type="button" class="link-botao" data-acao="editar">Adicionar experiência</button></p>`
      : `<p class="bloco-vazio">Nenhuma experiência informada.</p>`;

  const ultimas = avaliacoesRecebidas(pessoa.id).slice(0, 2);
  const blocoAvaliacoes = ultimas.length
    ? `
      <div class="bloco">
        <div class="bloco-topo">
          <h2>Últimas avaliações</h2>
          <button type="button" class="link-botao" data-ir-aba="avaliacoes">Ver todas</button>
        </div>
        <ul class="lista-linhas">${ultimas.map((a) => htmlAvaliacao(a)).join("")}</ul>
      </div>
    `
    : "";

  return `
    <div class="bloco">
      <div class="bloco-topo"><h2>Sobre</h2></div>
      <div class="bloco-corpo">${sobre}</div>
    </div>
    <div class="bloco">
      <div class="bloco-topo"><h2>Experiência</h2></div>
      <div class="bloco-corpo">${experiencia}</div>
    </div>
    ${blocoAvaliacoes}
  `;
}

function htmlTrabalhos() {
  const lista = trabalhosConcluidos(pessoa.id);
  const nome = primeiroNome(pessoa.nome);

  if (!lista.length) {
    const texto = ehDono
      ? `Os serviços que você concluir pelo Free-la aparecem aqui. <a href="home.html">Procurar bicos</a>`
      : `${escapar(nome)} ainda não concluiu serviços pelo Free-la.`;
    return `<div class="bloco"><div class="bloco-corpo"><p class="bloco-vazio">${texto}</p></div></div>`;
  }

  const itens = lista.map((vaga) => {
    const recebida = lerAvaliacoes().find((a) => a.vagaId === vaga.id && a.avaliadoId === pessoa.id);
    const avaliacao = recebida
      ? `<div class="trabalho-avaliacao">${htmlEstrelas(recebida.nota)}<p>"${escapar(recebida.comentario)}"</p></div>`
      : "";

    return `
      <li class="trabalho">
        <h3>${escapar(vaga.titulo)}</h3>
        <p class="valor">${formatarValor(vaga.valor)}</p>
        <p class="meta">Para <a href="${linkPerfil(vaga.autorId)}">${escapar(nomeAutor(vaga))}</a>, em ${escapar(vaga.bairro)}. Concluído em ${formatarData(vaga.concluidaEm)}.</p>
        ${avaliacao}
      </li>
    `;
  }).join("");

  return `
    <div class="bloco">
      <div class="bloco-topo"><h2>Serviços concluídos pelo Free-la</h2></div>
      <ul class="lista-linhas">${itens}</ul>
    </div>
  `;
}

function htmlAvaliacoes() {
  const resumo = resumoAvaliacoes(pessoa.id);
  const lista = avaliacoesRecebidas(pessoa.id);

  if (!resumo.total) {
    const texto = ehDono
      ? "Depois de concluir um serviço, quem trabalhou com você pode deixar uma avaliação."
      : `${escapar(primeiroNome(pessoa.nome))} ainda não recebeu avaliações.`;
    return `<div class="bloco"><div class="bloco-corpo"><p class="bloco-vazio">${texto}</p></div></div>`;
  }

  const barras = resumo.porNota.map(({ nota, quantidade }) => {
    const largura = (quantidade / resumo.total) * 100;
    return `
      <li>
        <span>${nota} ${nota === 1 ? "estrela" : "estrelas"}</span>
        <span class="trilho" aria-hidden="true"><span class="preenchido" style="width: ${largura}%; display: block;"></span></span>
        <span>${quantidade}</span>
      </li>
    `;
  }).join("");

  return `
    <div class="bloco">
      <div class="bloco-corpo resumo-notas">
        <div class="media-grande">
          <strong>${formatarNota(resumo.media)}</strong>
          ${htmlEstrelas(resumo.media)}
          <p>${resumo.total} ${resumo.total === 1 ? "avaliação" : "avaliações"}</p>
        </div>
        <ul class="barras" aria-label="Quantidade de avaliações por nota">${barras}</ul>
      </div>
    </div>
    <div class="bloco">
      <div class="bloco-topo"><h2>O que dizem</h2></div>
      <ul class="lista-linhas">${lista.map((a) => htmlAvaliacao(a)).join("")}</ul>
    </div>
  `;
}

function htmlMetaVaga(vaga) {
  return `
    <ul class="meta">
      <li>${ICONES.data} ${escapar(vaga.quando)}</li>
      <li>${ICONES.local} ${escapar(vaga.bairro)}</li>
      <li>${formatarValor(vaga.valor)} ${escapar(vaga.unidade)}</li>
    </ul>
  `;
}

function htmlCandidato(candidatura, vaga) {
  const candidato = buscarUsuarioPorId(candidatura.candidatoId);
  if (!candidato) return "";

  const resumo = resumoAvaliacoes(candidato.id);
  const nota = resumo.total
    ? `<span class="nota-curta">${ICONES.estrela}${formatarNota(resumo.media)}</span> (${resumo.total})`
    : "Ainda sem avaliações";
  const detalhe = [candidato.titulo, (candidato.habilidades || []).slice(0, 2).join(", ")].filter(Boolean)[0] || "Sem título profissional";

  return `
    <li class="candidato">
      ${htmlAvatar(candidato)}
      <div class="candidato-dados">
        <a href="${linkPerfil(candidato.id)}">${escapar(candidato.nome)}</a>
        <p>${escapar(detalhe)}</p>
        <p>${nota}</p>
      </div>
      <div class="candidato-acoes">
        <button type="button" class="btn btn-primario" data-acao="aceitar" data-vaga="${vaga.id}" data-pessoa="${candidato.id}">Aceitar</button>
        <button type="button" class="btn btn-contorno" data-acao="recusar" data-vaga="${vaga.id}" data-pessoa="${candidato.id}">Recusar</button>
      </div>
    </li>
  `;
}

function htmlEtapaVaga(vaga) {
  const candidaturas = candidaturasDaVaga(vaga.id);

  if (vaga.status === "aberta") {
    const pendentes = candidaturas.filter((c) => c.status === "pendente");
    const recusados = candidaturas.filter((c) => c.status === "recusada").length;

    const lista = pendentes.length
      ? `<ul class="lista-linhas">${pendentes.map((c) => htmlCandidato(c, vaga)).join("")}</ul>`
      : `<div class="bloco-corpo"><p class="bloco-vazio">Ninguém se candidatou ainda. Assim que alguém se candidatar, aparece aqui.</p></div>`;

    const rodape = recusados
      ? `<p class="recusados">${recusados} ${recusados === 1 ? "candidato recusado" : "candidatos recusados"}</p>`
      : "";

    return lista + rodape;
  }

  const contratado = buscarUsuarioPorId(vaga.contratadoId);
  const nome = contratado ? contratado.nome : "a pessoa escolhida";
  const link = contratado ? `<a href="${linkPerfil(contratado.id)}"><strong>${escapar(nome)}</strong></a>` : nome;

  if (vaga.status === "em_andamento") {
    return `
      <div class="bloco-corpo mensagem-etapa">
        <p>Você escolheu ${link}. Quando o serviço terminar, marque como concluído para vocês poderem se avaliar.</p>
        <button type="button" class="btn btn-escuro" data-acao="concluir" data-vaga="${vaga.id}">Marcar como concluído</button>
      </div>
    `;
  }

  if (!jaAvaliou(vaga.id, eu.id)) {
    return `
      <div class="bloco-corpo mensagem-etapa">
        <p>Serviço concluído por ${link}. Como foi trabalhar com ${escapar(primeiroNome(nome))}?</p>
        <button type="button" class="btn btn-primario" data-acao="avaliar" data-vaga="${vaga.id}" data-pessoa="${vaga.contratadoId}" data-papel="prestador">Avaliar ${escapar(primeiroNome(nome))}</button>
      </div>
    `;
  }

  const minha = lerAvaliacoes().find((a) => a.vagaId === vaga.id && a.autorId === eu.id);
  return `
    <div class="bloco-corpo mensagem-etapa">
      <p>Serviço concluído por ${link}. Sua avaliação: ${htmlEstrelas(minha.nota)}</p>
    </div>
  `;
}

function pendenciasCaixa() {
  const minhas = lerVagas().filter((vaga) => vaga.autorId === eu.id);
  const candidatos = contarPendentesParaAutor(eu.id);
  const semAvaliar = minhas.filter((v) => v.status === "concluida" && !jaAvaliou(v.id, eu.id)).length;
  return candidatos + semAvaliar;
}

function prioridadeVaga(vaga) {
  if (vaga.status === "aberta" && candidaturasDaVaga(vaga.id).some((c) => c.status === "pendente")) return 0;
  if (vaga.status === "concluida" && !jaAvaliou(vaga.id, eu.id)) return 1;
  if (vaga.status === "em_andamento") return 2;
  if (vaga.status === "aberta") return 3;
  return 4;
}

function htmlCaixa() {
  const minhas = lerVagas()
    .filter((vaga) => vaga.autorId === eu.id)
    .sort((a, b) => prioridadeVaga(a) - prioridadeVaga(b) || b.id - a.id);

  if (!minhas.length) {
    return `
      <div class="bloco">
        <div class="bloco-corpo">
          <p class="bloco-vazio">Quando você publicar uma vaga, os candidatos aparecem aqui. <a href="publicar-vaga.html">Publicar vaga</a></p>
        </div>
      </div>
    `;
  }

  return minhas.map((vaga) => `
    <article class="bloco caixa-vaga">
      <div class="bloco-topo">
        <div class="caixa-vaga-titulo">
          <h3>${escapar(vaga.titulo)}</h3>
          ${htmlMetaVaga(vaga)}
        </div>
        ${htmlStatus(STATUS_VAGA[vaga.status])}
      </div>
      ${htmlEtapaVaga(vaga)}
    </article>
  `).join("");
}

function htmlCandidaturas() {
  const lista = candidaturasDoUsuario(eu.id)
    .map((c) => ({ candidatura: c, vaga: buscarVaga(c.vagaId) }))
    .filter(({ vaga }) => vaga)
    .sort((a, b) => b.candidatura.id - a.candidatura.id);

  if (!lista.length) {
    return `
      <div class="bloco">
        <div class="bloco-corpo">
          <p class="bloco-vazio">Você ainda não se candidatou a nenhuma vaga. <a href="home.html">Procurar bicos</a></p>
        </div>
      </div>
    `;
  }

  const itens = lista.map(({ candidatura, vaga }) => {
    const autor = buscarUsuarioPorId(vaga.autorId);
    const nomeAutorVaga = autor ? autor.nome : "Anônimo";
    let chave = candidatura.status;
    if (candidatura.status === "aceita" && vaga.status === "concluida") chave = "concluida";

    let acoes = "";
    if (candidatura.status === "pendente") {
      acoes = `<button type="button" class="btn btn-contorno" data-acao="desistir" data-vaga="${vaga.id}">Desistir</button>`;
    } else if (chave === "concluida" && !jaAvaliou(vaga.id, eu.id)) {
      acoes = `<button type="button" class="btn btn-primario" data-acao="avaliar" data-vaga="${vaga.id}" data-pessoa="${vaga.autorId}" data-papel="contratante">Avaliar ${escapar(primeiroNome(nomeAutorVaga))}</button>`;
    }

    const dica = candidatura.status === "aceita" && vaga.status === "em_andamento"
      ? `<p class="meta">Combine os detalhes com ${escapar(primeiroNome(nomeAutorVaga))}. Quando terminar, ${escapar(primeiroNome(nomeAutorVaga))} marca como concluído.</p>`
      : "";

    return `
      <li class="candidatura-item">
        <div>
          <h3>${escapar(vaga.titulo)}</h3>
          <p class="meta">Por <a href="${linkPerfil(vaga.autorId)}">${escapar(nomeAutorVaga)}</a>, ${formatarValor(vaga.valor)} ${escapar(vaga.unidade)}</p>
          ${dica}
        </div>
        <div class="acoes-linha">
          ${htmlStatus(STATUS_CANDIDATURA[chave])}
          ${acoes}
        </div>
      </li>
    `;
  }).join("");

  return `
    <div class="bloco">
      <div class="bloco-topo"><h2>Vagas em que você se candidatou</h2></div>
      <ul class="lista-linhas">${itens}</ul>
    </div>
  `;
}

function atualizarContagens() {
  const trabalhos = trabalhosConcluidos(pessoa.id).length;
  const avaliacoes = avaliacoesRecebidas(pessoa.id).length;

  document.getElementById("contagem-trabalhos").textContent = trabalhos || "";
  document.getElementById("contagem-avaliacoes").textContent = avaliacoes || "";

  if (ehDono) {
    const pendencias = pendenciasCaixa();
    const candidaturas = candidaturasDoUsuario(eu.id).length;
    document.getElementById("contagem-caixa").textContent = pendencias || "";
    document.getElementById("contagem-caixa").setAttribute("aria-label", `${pendencias} pendências`);
    document.getElementById("contagem-candidaturas").textContent = candidaturas || "";
  }
}

function renderizarTudo() {
  pessoa = buscarUsuarioPorId(perfilId);

  document.title = `${ehDono ? "Meu perfil" : pessoa.nome} | Free-la`;
  document.getElementById("perfil-lateral").innerHTML = htmlLateral();
  document.getElementById("painel-visao").innerHTML = htmlVisao();
  document.getElementById("painel-trabalhos").innerHTML = htmlTrabalhos();
  document.getElementById("painel-avaliacoes").innerHTML = htmlAvaliacoes();

  if (ehDono) {
    document.getElementById("painel-caixa").innerHTML = htmlCaixa();
    document.getElementById("painel-candidaturas").innerHTML = htmlCandidaturas();
  }

  atualizarContagens();
}

function ativarAba(nome, focar = false) {
  if (!ABAS.includes(nome)) nome = "visao";

  document.querySelectorAll(".aba").forEach((aba) => {
    const ativa = aba.dataset.aba === nome;
    aba.setAttribute("aria-selected", String(ativa));
    aba.tabIndex = ativa ? 0 : -1;
    if (ativa) aba.parentElement.scrollLeft = aba.offsetLeft - aba.parentElement.offsetLeft - 16;
    if (ativa && focar) aba.focus();
  });

  document.querySelectorAll(".painel-aba").forEach((painel) => {
    painel.hidden = painel.id !== `painel-${nome}`;
  });

  history.replaceState(null, "", `${window.location.search}#${nome}`);
}

function montarEstrelasEscolha() {
  const grupo = document.getElementById("estrelas-escolha");

  grupo.insertAdjacentHTML("beforeend", [1, 2, 3, 4, 5].map((n) => `
    <label>
      <input type="radio" name="nota" value="${n}">
      ${ICONES.estrela}
      <span class="sr-only">${n} ${n === 1 ? "estrela" : "estrelas"}, ${LEGENDAS_NOTA[n]}</span>
    </label>
  `).join(""));

  grupo.addEventListener("change", () => {
    const nota = Number(grupo.querySelector("input:checked").value);
    pintarEstrelas(nota);
    document.getElementById("nota-legenda").textContent = `${nota} de 5, ${LEGENDAS_NOTA[nota].toLowerCase()}.`;
    document.getElementById("nota-legenda").style.color = "";
  });
}

function pintarEstrelas(nota) {
  document.querySelectorAll("#estrelas-escolha label").forEach((label, indice) => {
    label.classList.toggle("ativa", indice < nota);
  });
}

function abrirAvaliacao(vagaId, avaliadoId, papel) {
  const avaliado = buscarUsuarioPorId(avaliadoId);
  const vaga = buscarVaga(vagaId);
  avaliacaoAtual = { vagaId, avaliadoId, papel };

  document.getElementById("avaliar-titulo").textContent = `Avaliar ${primeiroNome(avaliado.nome)}`;
  document.getElementById("avaliar-servico").textContent = `Serviço: ${vaga.titulo}`;
  document.getElementById("form-avaliar").reset();
  document.getElementById("nota-legenda").textContent = "Escolha de 1 a 5 estrelas.";
  document.getElementById("nota-legenda").style.color = "";
  document.getElementById("avaliar-comentario").closest(".campo").classList.remove("erro");
  pintarEstrelas(0);

  document.getElementById("modal-avaliar").showModal();
}

document.getElementById("form-avaliar").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const marcada = document.querySelector("#estrelas-escolha input:checked");
  const comentario = document.getElementById("avaliar-comentario");
  let valido = true;

  if (!marcada) {
    const legenda = document.getElementById("nota-legenda");
    legenda.textContent = "Escolha uma nota antes de enviar.";
    legenda.style.color = "var(--erro)";
    valido = false;
  }

  const erroComentario = validarTextoLivre(comentario.value, { nome: "o comentário", minimo: 10, maximo: 300 });
  if (erroComentario) {
    const campo = comentario.closest(".campo");
    campo.classList.add("erro");
    campo.querySelector(".campo-erro").textContent = erroComentario;
    valido = false;
  }

  if (!valido) return;

  const enviada = criarAvaliacao({
    vagaId: avaliacaoAtual.vagaId,
    autorId: eu.id,
    avaliadoId: avaliacaoAtual.avaliadoId,
    papel: avaliacaoAtual.papel,
    nota: Number(marcada.value),
    comentario: limparEspacos(comentario.value)
  });

  document.getElementById("modal-avaliar").close();
  renderizarTudo();
  mostrarToast(enviada ? "Avaliação enviada." : "Essa avaliação não pode mais ser enviada.");
});

document.getElementById("avaliar-comentario").addEventListener("input", (evento) => {
  evento.target.closest(".campo").classList.remove("erro");
});

document.querySelectorAll("[data-fechar]").forEach((botao) => {
  botao.addEventListener("click", () => botao.closest("dialog").close());
});

document.querySelector(".abas").addEventListener("click", (evento) => {
  const aba = evento.target.closest(".aba");
  if (aba) ativarAba(aba.dataset.aba);
});

document.querySelector(".abas").addEventListener("keydown", (evento) => {
  if (!["ArrowRight", "ArrowLeft"].includes(evento.key)) return;
  const atual = ABAS.indexOf(document.querySelector(".aba[aria-selected='true']").dataset.aba);
  const passo = evento.key === "ArrowRight" ? 1 : -1;
  ativarAba(ABAS[(atual + passo + ABAS.length) % ABAS.length], true);
});

document.getElementById("perfil").addEventListener("click", async (evento) => {
  const irAba = evento.target.closest("[data-ir-aba]");
  if (irAba) {
    ativarAba(irAba.dataset.irAba, true);
    return;
  }

  const botao = evento.target.closest("[data-acao]");
  if (!botao) return;

  const vagaId = Number(botao.dataset.vaga);
  const pessoaId = Number(botao.dataset.pessoa);
  const acao = botao.dataset.acao;

  if (acao === "editar") {
    abrirEdicao();
    return;
  }

  if (acao === "avaliar") {
    abrirAvaliacao(vagaId, pessoaId, botao.dataset.papel);
    return;
  }

  if (acao === "aceitar") {
    const candidato = buscarUsuarioPorId(pessoaId);
    const outros = candidaturasDaVaga(vagaId).filter((c) => c.status === "pendente" && c.candidatoId !== pessoaId).length;
    const ok = await confirmar({
      titulo: `Escolher ${primeiroNome(candidato.nome)}?`,
      texto: outros
        ? `A vaga para de receber candidaturas e ${outros === 1 ? "o outro candidato é recusado" : `os outros ${outros} candidatos são recusados`}. Não dá para desfazer.`
        : "A vaga para de receber candidaturas. Não dá para desfazer.",
      botao: `Escolher ${primeiroNome(candidato.nome)}`
    });
    if (!ok) return;
    mostrarToast(aceitarCandidato(vagaId, pessoaId) ? `${primeiroNome(candidato.nome)} foi escolhido para a vaga.` : "Essa candidatura não está mais disponível.");
  } else if (acao === "recusar") {
    const ok = await confirmar({
      titulo: "Recusar candidato?",
      texto: "A pessoa vai ver que não foi selecionada e não pode se candidatar de novo a essa vaga.",
      botao: "Recusar",
      perigo: true
    });
    if (!ok) return;
    recusarCandidato(vagaId, pessoaId);
    mostrarToast("Candidato recusado.");
  } else if (acao === "concluir") {
    const ok = await confirmar({
      titulo: "O serviço terminou?",
      texto: "Marque como concluído só depois que o serviço estiver feito. Depois disso, vocês dois podem se avaliar.",
      botao: "Marcar como concluído"
    });
    if (!ok) return;
    mostrarToast(concluirVaga(vagaId) ? "Serviço marcado como concluído." : "Essa vaga não está em andamento.");
  } else if (acao === "desistir") {
    const ok = await confirmar({
      titulo: "Desistir da candidatura?",
      texto: "Você não vai poder se candidatar de novo a essa vaga.",
      botao: "Desistir",
      perigo: true
    });
    if (!ok) return;
    desistirCandidatura(vagaId, eu.id);
    mostrarToast("Candidatura retirada.");
  }

  renderizarTudo();
});

function iniciar() {
  if (!pessoa) {
    document.getElementById("perfil").innerHTML = `
      <div class="perfil-nao-encontrado">
        <h1>Perfil não encontrado</h1>
        <p>Esse usuário não existe ou foi removido.</p>
        <a href="home.html" class="btn btn-primario">Voltar para as vagas</a>
      </div>
    `;
    document.getElementById("perfil").style.display = "block";
    return;
  }

  if (ehDono) {
    document.querySelector(".usuario-link").setAttribute("aria-current", "page");
  } else {
    document.querySelectorAll(".so-dono").forEach((aba) => aba.remove());
  }

  montarEstrelasEscolha();
  renderizarTudo();
  ativarAba(window.location.hash.slice(1));
}

if (eu) iniciar();
