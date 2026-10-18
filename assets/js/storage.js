const CHAVE_USUARIOS = "freela_usuarios";
const CHAVE_SESSAO = "freela_sessao";
const CHAVE_VAGAS = "freela_vagas";

const USUARIOS_INICIAIS = [
  { id: 1, nome: "Usuário Teste", email: "teste@freela.com", senha: "123456" }
];

const VAGAS_INICIAIS = [
  { id: 1, titulo: "Ajudante para mudança", categoria: "Mudança e carga", bairro: "Savassi", quando: "Sábado, 8h", valor: 180, unidade: "por dia", autor: "Marina S." },
  { id: 2, titulo: "Garçom para aniversário de 15 anos", categoria: "Garçom e eventos", bairro: "Pampulha", quando: "Sexta, 19h", valor: 150, unidade: "5 horas", autor: "Carlos R." },
  { id: 3, titulo: "Arte para cardápio de lanchonete", categoria: "Design e redes sociais", bairro: "Remoto", quando: "Entrega até quarta", valor: 120, unidade: "valor fechado", autor: "Lanchonete do Zé" },
  { id: 4, titulo: "Montagem de guarda-roupa", categoria: "Pequenos reparos", bairro: "Buritis", quando: "Hoje, 14h", valor: 90, unidade: "valor fechado", autor: "Patrícia L." },
  { id: 5, titulo: "Faxina pós-obra em apartamento", categoria: "Faxina", bairro: "Funcionários", quando: "Segunda, 9h", valor: 220, unidade: "por dia", autor: "Renato M." },
  { id: 6, titulo: "Aula de reforço de matemática", categoria: "Aulas particulares", bairro: "Lourdes", quando: "Terça e quinta, 16h", valor: 60, unidade: "por aula", autor: "Ana Paula F." },
  { id: 7, titulo: "Entregador para sábado de feira", categoria: "Entregas", bairro: "Santa Tereza", quando: "Sábado, 7h", valor: 130, unidade: "por dia", autor: "Hortifruti Boa Safra" },
  { id: 8, titulo: "Posts para Instagram de salão", categoria: "Design e redes sociais", bairro: "Remoto", quando: "Entrega em 5 dias", valor: 200, unidade: "8 posts", autor: "Studio Bela" }
];

function lerLista(chave, inicial) {
  const dados = localStorage.getItem(chave);

  if (!dados) {
    localStorage.setItem(chave, JSON.stringify(inicial));
    return inicial;
  }

  return JSON.parse(dados);
}

function lerUsuarios() {
  return lerLista(CHAVE_USUARIOS, USUARIOS_INICIAIS);
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function buscarUsuarioPorEmail(email) {
  return lerUsuarios().find(
    (usuario) => usuario.email.toLowerCase() === email.toLowerCase()
  );
}

function lerVagas() {
  return lerLista(CHAVE_VAGAS, VAGAS_INICIAIS);
}

function chaveCandidaturas(usuarioId) {
  return `freela_candidaturas_${usuarioId}`;
}

function lerCandidaturas(usuarioId) {
  const dados = localStorage.getItem(chaveCandidaturas(usuarioId));
  return dados ? JSON.parse(dados) : [];
}

function salvarCandidaturas(usuarioId, idsVagas) {
  localStorage.setItem(chaveCandidaturas(usuarioId), JSON.stringify(idsVagas));
}

function salvarSessao(usuario) {
  const sessao = { id: usuario.id, nome: usuario.nome, email: usuario.email };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function lerSessao() {
  const dados = localStorage.getItem(CHAVE_SESSAO);
  return dados ? JSON.parse(dados) : null;
}

function apagarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
}
