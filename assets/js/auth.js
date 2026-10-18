function fazerLogin(email, senha) {
  const usuario = buscarUsuarioPorEmail(email);

  if (!usuario || usuario.senha !== senha) {
    return null;
  }

  salvarSessao(usuario);
  return usuario;
}

function cadastrar({ nome, email, cidade, senha }) {
  if (buscarUsuarioPorEmail(email)) {
    return null;
  }

  const usuario = criarUsuario({ nome, email, cidade, senha });
  salvarSessao(usuario);
  return usuario;
}

function sair() {
  apagarSessao();
  window.location.href = "login.html";
}

function estaLogado() {
  return lerSessao() !== null;
}

function protegerPagina() {
  if (!estaLogado()) {
    window.location.replace("login.html");
  }
}
