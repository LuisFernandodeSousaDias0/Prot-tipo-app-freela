const VERSAO_DADOS = "6";

const LIMITES = {
  palavraMaxima: 25,
  repeticaoMaxima: 4,
  valorMinimo: 10,
  valorMaximo: 10000,
  diasAntecedencia: 90,
  diasEntreTrocasDeNome: 30,
  vagasAbertasPorUsuario: 5,
  candidaturasPendentesPorUsuario: 10
};

const CHAVES = {
  versao: "freela_versao",
  usuarios: "freela_usuarios",
  sessao: "freela_sessao",
  vagas: "freela_vagas",
  candidaturas: "freela_candidaturas",
  avaliacoes: "freela_avaliacoes",
  aviso: "freela_aviso"
};

const CATEGORIAS = [
  "Mudança e carga",
  "Garçom e eventos",
  "Pequenos reparos",
  "Faxina",
  "Design e redes sociais",
  "Aulas particulares",
  "Montagem de móveis",
  "Entregas",
  "Outros"
];

const CIDADES = [
  "Belo Horizonte",
  "Contagem",
  "Betim",
  "Nova Lima",
  "Ribeirão das Neves",
  "Santa Luzia",
  "Sabará",
  "Lagoa Santa",
  "Vespasiano",
  "Ibirité"
];

const CENTROS_CIDADE = {
  "Belo Horizonte": [-19.9191, -43.9386],
  "Contagem": [-19.9317, -44.0536],
  "Betim": [-19.9678, -44.1983],
  "Nova Lima": [-19.9858, -43.8467],
  "Ribeirão das Neves": [-19.7669, -44.0867],
  "Santa Luzia": [-19.7697, -43.8514],
  "Sabará": [-19.8869, -43.8058],
  "Lagoa Santa": [-19.6272, -43.8903],
  "Vespasiano": [-19.6919, -43.9233],
  "Ibirité": [-20.0222, -44.0589]
};

const COORDENADAS_EXEMPLO = {
  "Savassi": [-19.9386, -43.9346],
  "Pampulha": [-19.8586, -43.9734],
  "Buritis": [-19.9746, -43.969],
  "Funcionários": [-19.933, -43.931],
  "Lourdes": [-19.9338, -43.9437],
  "Santa Tereza": [-19.918, -43.917],
  "Prado": [-19.9263, -43.9617],
  "Sion": [-19.952, -43.931],
  "Centro": [-19.9191, -43.9386],
  "Barro Preto": [-19.9246, -43.9496],
  "Eldorado": [-19.942, -44.04],
  "Industrial": [-19.9565, -44.023],
  "Angola": [-19.964, -44.203],
  "Vale do Sereno": [-19.98, -43.945]
};

const APELIDOS_CIDADE = {
  bh: "Belo Horizonte",
  "beaga": "Belo Horizonte",
  "belo horizonte mg": "Belo Horizonte",
  "neves": "Ribeirão das Neves"
};

function chaveCidade(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function encontrarCidade(texto) {
  const chave = chaveCidade(texto);
  if (!chave) return null;
  if (APELIDOS_CIDADE[chave]) return APELIDOS_CIDADE[chave];
  return CIDADES.find((cidade) => chaveCidade(cidade) === chave) || null;
}

function pontoValido(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat > -21 && lat < -19 && lng > -45 && lng < -43;
}

function mesmaCidade(a, b) {
  return chaveCidade(a) === chaveCidade(b);
}

const USUARIOS_INICIAIS = [
  {
    id: 1,
    nome: "Usuário Teste",
    email: "teste@freela.com",
    senha: "123456",
    cidade: "Belo Horizonte",
    titulo: "Montador de móveis e ajudante geral",
    sobre: "Monto móveis e faço pequenos reparos desde 2023. Levo minhas ferramentas, deixo tudo limpo no final e combino o horário certinho. Disponível à noite e aos fins de semana.",
    habilidades: ["Montagem de móveis", "Pequenos reparos", "Mudança e carga"],
    experiencias: [
      { titulo: "Montador de móveis autônomo", local: "Belo Horizonte e região", periodo: "2024 até hoje", descricao: "Guarda-roupas, cozinhas planejadas e escritórios. Mais de 40 montagens feitas." },
      { titulo: "Ajudante de depósito", local: "Atacadão, Contagem", periodo: "2023 a 2024", descricao: "Carga e descarga, organização de estoque e conferência de notas." }
    ],
    foto: "",
    criadoEm: "2026-03-10"
  },
  { id: 2, nome: "Marina Souza", email: "marina@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Arquiteta", sobre: "Arquiteta de interiores. Contrato montadores e ajudantes para as obras dos meus clientes.", habilidades: ["Design e redes sociais"], experiencias: [], foto: "", criadoEm: "2026-02-02" },
  { id: 3, nome: "Carlos Ribeiro", email: "carlos@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Garçom e barman", sobre: "Trabalho em festas e casamentos há 6 anos.", habilidades: ["Garçom e eventos"], experiencias: [{ titulo: "Garçom de eventos", local: "Buffet Sabor de Minas", periodo: "2020 até hoje", descricao: "Casamentos e formaturas de até 300 convidados." }], foto: "", criadoEm: "2026-01-15" },
  { id: 4, nome: "Patrícia Lima", email: "patricia@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Professora", sobre: "", habilidades: ["Aulas particulares"], experiencias: [], foto: "", criadoEm: "2026-04-20" },
  { id: 5, nome: "Renato Melo", email: "renato@freela.com", senha: "123456", cidade: "Contagem", titulo: "Eletricista e reparos em geral", sobre: "Eletricista com curso no SENAI. Faço instalação de chuveiro, tomadas, prateleiras e pequenos consertos.", habilidades: ["Pequenos reparos", "Montagem de móveis"], experiencias: [{ titulo: "Eletricista residencial", local: "Autônomo", periodo: "2021 até hoje", descricao: "" }], foto: "", criadoEm: "2026-05-05" },
  { id: 6, nome: "Ana Paula Ferreira", email: "ana@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Mãe e empreendedora", sobre: "", habilidades: [], experiencias: [], foto: "", criadoEm: "2026-06-11" },
  { id: 7, nome: "Joana Duarte", email: "joana@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Diarista e organizadora", sobre: "Faxina pesada, pós-obra e organização de armários.", habilidades: ["Faxina", "Mudança e carga"], experiencias: [], foto: "", criadoEm: "2026-03-28" },
  { id: 8, nome: "Bruno Costa", email: "bruno@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Designer freelancer", sobre: "Identidade visual, cardápios e posts para pequenos negócios.", habilidades: ["Design e redes sociais"], experiencias: [{ titulo: "Designer gráfico", local: "Agência Ponto, BH", periodo: "2022 a 2025", descricao: "Peças para redes sociais e materiais impressos." }], foto: "", criadoEm: "2026-02-19" },
  { id: 9, nome: "Lanchonete do Zé", email: "ze@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Lanchonete no Barro Preto", sobre: "", habilidades: [], experiencias: [], foto: "", criadoEm: "2026-01-30" },
  { id: 10, nome: "Hortifruti Boa Safra", email: "boasafra@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Hortifruti em Santa Tereza", sobre: "", habilidades: [], experiencias: [], foto: "", criadoEm: "2026-05-14" },
  { id: 11, nome: "Studio Bela", email: "studiobela@freela.com", senha: "123456", cidade: "Belo Horizonte", titulo: "Salão de beleza", sobre: "", habilidades: [], experiencias: [], foto: "", criadoEm: "2026-07-01" }
];

const VAGAS_INICIAIS = [
  { id: 1, titulo: "Ajudante para mudança", categoria: "Mudança e carga", descricao: "Carregar caixas e móveis de um apartamento de 2 quartos, terceiro andar sem elevador.", bairro: "Savassi", cidade: "Belo Horizonte", quando: "Sábado, 8h", valor: 180, unidade: "por dia", autorId: 2, status: "aberta" },
  { id: 2, titulo: "Garçom para aniversário de 15 anos", categoria: "Garçom e eventos", descricao: "Festa para 80 convidados. Servir bebidas e salgados, roupa preta.", bairro: "Pampulha", cidade: "Belo Horizonte", quando: "Sexta, 19h", valor: 150, unidade: "5 horas", autorId: 6, status: "aberta" },
  { id: 3, titulo: "Arte para cardápio de lanchonete", categoria: "Design e redes sociais", descricao: "Cardápio de uma página com 20 itens. Envio as fotos e os preços.", bairro: "Remoto", cidade: "Belo Horizonte", quando: "Entrega até quarta", valor: 120, unidade: "valor fechado", autorId: 9, status: "aberta" },
  { id: 4, titulo: "Montagem de guarda-roupa", categoria: "Montagem de móveis", descricao: "Guarda-roupa de 6 portas, ainda na caixa. Precisa levar ferramentas.", bairro: "Buritis", cidade: "Belo Horizonte", quando: "Hoje, 14h", valor: 90, unidade: "valor fechado", autorId: 4, status: "aberta" },
  { id: 5, titulo: "Faxina pós-obra em apartamento", categoria: "Faxina", descricao: "Apartamento de 70 m² com poeira de reforma. Produtos fornecidos.", bairro: "Funcionários", cidade: "Belo Horizonte", quando: "Segunda, 9h", valor: 220, unidade: "por dia", autorId: 5, status: "aberta" },
  { id: 6, titulo: "Aula de reforço de matemática", categoria: "Aulas particulares", descricao: "Aluno do 8º ano, foco em equações. Duas aulas de uma hora por semana.", bairro: "Lourdes", cidade: "Belo Horizonte", quando: "Terça e quinta, 16h", valor: 60, unidade: "por aula", autorId: 6, status: "aberta" },
  { id: 7, titulo: "Entregador para sábado de feira", categoria: "Entregas", descricao: "Entregas de bicicleta ou moto num raio de 5 km da loja.", bairro: "Santa Tereza", cidade: "Belo Horizonte", quando: "Sábado, 7h", valor: 130, unidade: "por dia", autorId: 10, status: "aberta" },
  { id: 8, titulo: "Posts para Instagram de salão", categoria: "Design e redes sociais", descricao: "8 posts com a identidade do salão, para o mês de novembro.", bairro: "Remoto", cidade: "Belo Horizonte", quando: "Entrega em 5 dias", valor: 200, unidade: "8 posts", autorId: 11, status: "aberta" },
  { id: 9, titulo: "Instalação de prateleiras na sala", categoria: "Pequenos reparos", descricao: "Três prateleiras de madeira em parede de tijolo. Já tenho as buchas e os parafusos.", bairro: "Prado", cidade: "Belo Horizonte", quando: "Quarta, 18h", valor: 80, unidade: "valor fechado", autorId: 1, status: "aberta" },
  { id: 10, titulo: "Faxina na casa nova", categoria: "Faxina", descricao: "Casa de 3 quartos antes da mudança. Produtos por minha conta.", bairro: "Prado", cidade: "Belo Horizonte", quando: "Sex, 24/10, 8h", valor: 200, unidade: "por dia", autorId: 1, status: "em_andamento", contratadoId: 7 },
  { id: 11, titulo: "Montagem de cozinha planejada", categoria: "Montagem de móveis", descricao: "Cozinha com 9 módulos e bancada.", bairro: "Sion", cidade: "Belo Horizonte", quando: "Sáb, 20/09, 8h", valor: 350, unidade: "valor fechado", autorId: 2, status: "concluida", contratadoId: 1, concluidaEm: "2026-09-20" },
  { id: 12, titulo: "Ajudante para mudança de kitnet", categoria: "Mudança e carga", descricao: "Kitnet com poucos móveis, caminhão já contratado.", bairro: "Centro", cidade: "Belo Horizonte", quando: "Dom, 05/10, 9h", valor: 150, unidade: "por dia", autorId: 4, status: "concluida", contratadoId: 1, concluidaEm: "2026-10-05" },
  { id: 13, titulo: "Conserto das prateleiras do estoque", categoria: "Pequenos reparos", descricao: "Prateleiras de aço soltas no estoque.", bairro: "Barro Preto", cidade: "Belo Horizonte", quando: "Seg, 13/10, 15h", valor: 120, unidade: "valor fechado", autorId: 9, status: "concluida", contratadoId: 1, concluidaEm: "2026-10-13" },
  { id: 14, titulo: "Arte para convite de aniversário", categoria: "Design e redes sociais", descricao: "Convite digital para festa de 30 anos.", bairro: "Remoto", cidade: "Belo Horizonte", quando: "Entrega em 3 dias", valor: 90, unidade: "valor fechado", autorId: 1, status: "concluida", contratadoId: 8, concluidaEm: "2026-10-10" },
  { id: 15, titulo: "Ajudante de cozinha para marmitaria", categoria: "Garçom e eventos", descricao: "Preparo de marmitas no horário do almoço, de segunda a sexta. Precisa ter experiência com cozinha.", bairro: "Eldorado", cidade: "Contagem", quando: "Seg, 27/10, 9h", valor: 110, unidade: "por dia", autorId: 5, status: "aberta" },
  { id: 16, titulo: "Pintura de portão de garagem", categoria: "Pequenos reparos", descricao: "Portão de ferro de 3 metros, precisa lixar e pintar. A tinta eu compro.", bairro: "Industrial", cidade: "Contagem", quando: "Sáb, 25/10, 8h", valor: 160, unidade: "valor fechado", autorId: 5, status: "aberta" },
  { id: 17, titulo: "Montagem de estante e rack", categoria: "Montagem de móveis", descricao: "Estante de 5 prateleiras e rack de TV, os dois ainda na caixa.", bairro: "Angola", cidade: "Betim", quando: "Dom, 26/10, 10h", valor: 120, unidade: "valor fechado", autorId: 7, status: "aberta" },
  { id: 18, titulo: "Entregas de bolos de encomenda", categoria: "Entregas", descricao: "Seis entregas de bolo no fim de semana, saindo do Vale do Sereno. Precisa de carro.", bairro: "Vale do Sereno", cidade: "Nova Lima", quando: "Sáb, 25/10, 13h", valor: 140, unidade: "por dia", autorId: 6, status: "aberta" }
];

const CANDIDATURAS_INICIAIS = [
  { id: 1, vagaId: 9, candidatoId: 5, status: "pendente", criadaEm: "2026-10-16" },
  { id: 2, vagaId: 9, candidatoId: 3, status: "pendente", criadaEm: "2026-10-17" },
  { id: 3, vagaId: 10, candidatoId: 7, status: "aceita", criadaEm: "2026-10-12" },
  { id: 4, vagaId: 10, candidatoId: 3, status: "recusada", criadaEm: "2026-10-12" },
  { id: 5, vagaId: 11, candidatoId: 1, status: "aceita", criadaEm: "2026-09-15" },
  { id: 6, vagaId: 12, candidatoId: 1, status: "aceita", criadaEm: "2026-10-01" },
  { id: 7, vagaId: 13, candidatoId: 1, status: "aceita", criadaEm: "2026-10-10" },
  { id: 8, vagaId: 14, candidatoId: 8, status: "aceita", criadaEm: "2026-10-06" },
  { id: 9, vagaId: 2, candidatoId: 1, status: "pendente", criadaEm: "2026-10-17" },
  { id: 10, vagaId: 5, candidatoId: 7, status: "pendente", criadaEm: "2026-10-16" }
];

const AVALIACOES_INICIAIS = [
  { id: 1, vagaId: 11, autorId: 2, avaliadoId: 1, papel: "prestador", nota: 5, comentario: "Chegou no horário, montou tudo nivelado e ainda ajustou as portas que vieram tortas. Vou chamar de novo.", criadaEm: "2026-09-21" },
  { id: 2, vagaId: 11, autorId: 1, avaliadoId: 2, papel: "contratante", nota: 5, comentario: "Explicou tudo antes e pagou na hora.", criadaEm: "2026-09-21" },
  { id: 3, vagaId: 12, autorId: 4, avaliadoId: 1, papel: "prestador", nota: 4, comentario: "Muito cuidadoso com os móveis. Só atrasou uns 20 minutos.", criadaEm: "2026-10-06" },
  { id: 4, vagaId: 13, autorId: 9, avaliadoId: 1, papel: "prestador", nota: 5, comentario: "Resolveu em menos de duas horas e deixou o estoque limpo.", criadaEm: "2026-10-14" },
  { id: 5, vagaId: 14, autorId: 8, avaliadoId: 1, papel: "contratante", nota: 5, comentario: "Briefing claro e pagamento combinado certinho.", criadaEm: "2026-10-11" }
];

function prepararDados() {
  if (localStorage.getItem(CHAVES.versao) === VERSAO_DADOS) return;

  Object.keys(localStorage)
    .filter((chave) => chave.startsWith("freela_"))
    .forEach((chave) => localStorage.removeItem(chave));

  localStorage.setItem(CHAVES.usuarios, JSON.stringify(USUARIOS_INICIAIS));
  const vagasComLocal = VAGAS_INICIAIS.map((vaga) => {
    const ponto = COORDENADAS_EXEMPLO[vaga.bairro];
    return ponto ? { ...vaga, lat: ponto[0], lng: ponto[1] } : vaga;
  });

  localStorage.setItem(CHAVES.vagas, JSON.stringify(vagasComLocal));
  localStorage.setItem(CHAVES.candidaturas, JSON.stringify(CANDIDATURAS_INICIAIS));
  localStorage.setItem(CHAVES.avaliacoes, JSON.stringify(AVALIACOES_INICIAIS));
  localStorage.setItem(CHAVES.versao, VERSAO_DADOS);
}

function ler(chave) {
  return JSON.parse(localStorage.getItem(chave) || "[]");
}

function gravar(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
}

function hojeISO() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 10);
}

function lerUsuarios() {
  return ler(CHAVES.usuarios);
}

function criarUsuario(dados) {
  const usuarios = lerUsuarios();
  const novo = {
    id: proximoId(usuarios),
    titulo: "",
    sobre: "",
    habilidades: [],
    experiencias: [],
    foto: "",
    criadoEm: hojeISO(),
    ...dados
  };

  usuarios.push(novo);
  gravar(CHAVES.usuarios, usuarios);
  return novo;
}

function buscarUsuarioPorEmail(email) {
  const procurado = email.trim().toLowerCase();
  return lerUsuarios().find((usuario) => usuario.email.toLowerCase() === procurado);
}

function buscarUsuarioPorId(id) {
  return lerUsuarios().find((usuario) => usuario.id === id);
}

function atualizarUsuario(id, campos) {
  const usuarios = lerUsuarios();
  const indice = usuarios.findIndex((usuario) => usuario.id === id);
  if (indice === -1) return null;

  usuarios[indice] = { ...usuarios[indice], ...campos };

  try {
    gravar(CHAVES.usuarios, usuarios);
  } catch (erro) {
    return null;
  }

  const sessao = lerSessao();
  if (sessao && sessao.id === id) salvarSessao(usuarios[indice]);

  return usuarios[indice];
}

function lerVagas() {
  return ler(CHAVES.vagas);
}

function buscarVaga(id) {
  return lerVagas().find((vaga) => vaga.id === id);
}

function criarVaga(dados) {
  if (contarVagasAbertas(dados.autorId) >= LIMITES.vagasAbertasPorUsuario) return null;

  const vagas = lerVagas();
  const nova = { id: proximoId(vagas), status: "aberta", criadaEm: hojeISO(), ...dados };
  vagas.push(nova);
  gravar(CHAVES.vagas, vagas);
  return nova;
}

function atualizarVaga(id, campos) {
  const vagas = lerVagas().map((vaga) => (vaga.id === id ? { ...vaga, ...campos } : vaga));
  gravar(CHAVES.vagas, vagas);
}

function lerCandidaturas() {
  return ler(CHAVES.candidaturas);
}

function candidaturasDaVaga(vagaId) {
  return lerCandidaturas().filter((candidatura) => candidatura.vagaId === vagaId);
}

function candidaturasDoUsuario(usuarioId) {
  return lerCandidaturas().filter((candidatura) => candidatura.candidatoId === usuarioId);
}

function buscarCandidatura(vagaId, usuarioId) {
  return lerCandidaturas().find(
    (candidatura) => candidatura.vagaId === vagaId && candidatura.candidatoId === usuarioId
  );
}

function candidaturasAtivas(vagaId) {
  return candidaturasDaVaga(vagaId).filter((c) => c.status === "pendente" || c.status === "aceita");
}

function contarPendentesDoCandidato(usuarioId) {
  return candidaturasDoUsuario(usuarioId).filter((c) => {
    const vaga = buscarVaga(c.vagaId);
    return c.status === "pendente" && vaga && vaga.status === "aberta";
  }).length;
}

function candidatar(vagaId, usuarioId) {
  const vaga = buscarVaga(vagaId);

  if (!vaga || vaga.status !== "aberta") {
    return { ok: false, erro: "Essa vaga não está mais recebendo candidaturas." };
  }

  if (vaga.autorId === usuarioId) {
    return { ok: false, erro: "Você não pode se candidatar à sua própria vaga." };
  }

  const existente = buscarCandidatura(vagaId, usuarioId);
  if (existente && existente.status === "desistiu") {
    return { ok: false, erro: "Você desistiu dessa vaga e não pode se candidatar de novo." };
  }
  if (existente) {
    return { ok: false, erro: "Você já se candidatou a essa vaga." };
  }

  if (contarPendentesDoCandidato(usuarioId) >= LIMITES.candidaturasPendentesPorUsuario) {
    return {
      ok: false,
      erro: `Você já tem ${LIMITES.candidaturasPendentesPorUsuario} candidaturas esperando resposta. Aguarde ou desista de alguma antes.`
    };
  }

  const lista = lerCandidaturas();
  lista.push({ id: proximoId(lista), vagaId, candidatoId: usuarioId, status: "pendente", criadaEm: hojeISO() });
  gravar(CHAVES.candidaturas, lista);
  return { ok: true };
}

function desistirCandidatura(vagaId, usuarioId) {
  const lista = lerCandidaturas().map((c) =>
    c.vagaId === vagaId && c.candidatoId === usuarioId && c.status === "pendente"
      ? { ...c, status: "desistiu", desistiuEm: hojeISO() }
      : c
  );
  gravar(CHAVES.candidaturas, lista);
}

function aceitarCandidato(vagaId, candidatoId) {
  const vaga = buscarVaga(vagaId);
  const candidatura = buscarCandidatura(vagaId, candidatoId);
  if (!vaga || vaga.status !== "aberta" || !candidatura || candidatura.status !== "pendente") return false;

  const lista = lerCandidaturas().map((c) => {
    if (c.vagaId !== vagaId) return c;
    if (c.candidatoId === candidatoId) return { ...c, status: "aceita" };
    if (c.status === "pendente") return { ...c, status: "recusada" };
    return c;
  });

  gravar(CHAVES.candidaturas, lista);
  atualizarVaga(vagaId, { status: "em_andamento", contratadoId: candidatoId });
  return true;
}

function recusarCandidato(vagaId, candidatoId) {
  const lista = lerCandidaturas().map((c) =>
    c.vagaId === vagaId && c.candidatoId === candidatoId && c.status === "pendente"
      ? { ...c, status: "recusada" }
      : c
  );
  gravar(CHAVES.candidaturas, lista);
}

function concluirVaga(vagaId) {
  const vaga = buscarVaga(vagaId);
  if (!vaga || vaga.status !== "em_andamento") return false;

  atualizarVaga(vagaId, { status: "concluida", concluidaEm: hojeISO() });
  return true;
}

function contarPendentesParaAutor(autorId) {
  const minhas = lerVagas().filter((vaga) => vaga.autorId === autorId && vaga.status === "aberta").map((v) => v.id);
  return lerCandidaturas().filter((c) => minhas.includes(c.vagaId) && c.status === "pendente").length;
}

function contarVagasAbertas(autorId) {
  return lerVagas().filter((vaga) => vaga.autorId === autorId && vaga.status !== "concluida").length;
}

function infoTrocaDeNome(usuario) {
  if (!usuario.nomeAlteradoEm) return { pode: true, diasRestantes: 0 };

  const passados = diasEntreDatas(usuario.nomeAlteradoEm, hojeISO());
  const restantes = LIMITES.diasEntreTrocasDeNome - passados;
  return { pode: restantes <= 0, diasRestantes: Math.max(restantes, 0) };
}

function diasEntreDatas(inicioISO, fimISO) {
  const [a1, m1, d1] = inicioISO.split("-").map(Number);
  const [a2, m2, d2] = fimISO.split("-").map(Number);
  return Math.round((new Date(a2, m2 - 1, d2) - new Date(a1, m1 - 1, d1)) / 86400000);
}

function lerAvaliacoes() {
  return ler(CHAVES.avaliacoes);
}

function avaliacoesRecebidas(usuarioId) {
  return lerAvaliacoes()
    .filter((avaliacao) => avaliacao.avaliadoId === usuarioId)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

function jaAvaliou(vagaId, autorId) {
  return lerAvaliacoes().some((avaliacao) => avaliacao.vagaId === vagaId && avaliacao.autorId === autorId);
}

function podeAvaliar(vagaId, autorId, avaliadoId) {
  const vaga = buscarVaga(vagaId);
  if (!vaga || vaga.status !== "concluida" || jaAvaliou(vagaId, autorId)) return false;

  const participantes = [vaga.autorId, vaga.contratadoId];
  return participantes.includes(autorId) && participantes.includes(avaliadoId) && autorId !== avaliadoId;
}

function criarAvaliacao(dados) {
  if (!podeAvaliar(dados.vagaId, dados.autorId, dados.avaliadoId)) return false;
  if (!Number.isInteger(dados.nota) || dados.nota < 1 || dados.nota > 5) return false;

  const lista = lerAvaliacoes();
  lista.push({ id: proximoId(lista), criadaEm: hojeISO(), ...dados });
  gravar(CHAVES.avaliacoes, lista);
  return true;
}

function resumoAvaliacoes(usuarioId) {
  const lista = avaliacoesRecebidas(usuarioId);
  const total = lista.length;
  const media = total ? lista.reduce((soma, a) => soma + a.nota, 0) / total : 0;
  const porNota = [5, 4, 3, 2, 1].map((nota) => ({
    nota,
    quantidade: lista.filter((a) => a.nota === nota).length
  }));

  return { total, media, porNota };
}

function trabalhosConcluidos(usuarioId) {
  return lerVagas()
    .filter((vaga) => vaga.status === "concluida" && vaga.contratadoId === usuarioId)
    .sort((a, b) => (b.concluidaEm || "").localeCompare(a.concluidaEm || ""));
}

function salvarSessao(usuario) {
  localStorage.setItem(CHAVES.sessao, JSON.stringify({ id: usuario.id }));
}

function lerSessao() {
  const dados = localStorage.getItem(CHAVES.sessao);
  if (!dados) return null;
  return buscarUsuarioPorId(JSON.parse(dados).id) || null;
}

function apagarSessao() {
  localStorage.removeItem(CHAVES.sessao);
}

function guardarAviso(mensagem) {
  sessionStorage.setItem(CHAVES.aviso, mensagem);
}

function pegarAviso() {
  const mensagem = sessionStorage.getItem(CHAVES.aviso);
  sessionStorage.removeItem(CHAVES.aviso);
  return mensagem;
}

prepararDados();
