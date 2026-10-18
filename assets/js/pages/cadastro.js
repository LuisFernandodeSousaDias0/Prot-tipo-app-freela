if (estaLogado()) {
  window.location.replace("home.html");
}

const form = document.getElementById("form-cadastro");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoCidade = document.getElementById("cidade");
const campoSenha = document.getElementById("senha");
const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const btnOlho = document.getElementById("btn-olho");

const SENHA_MINIMA = 6;

btnOlho.addEventListener("click", () => {
  const mostrando = campoSenha.type === "text";
  campoSenha.type = mostrando ? "password" : "text";
  btnOlho.setAttribute("aria-pressed", String(!mostrando));
  btnOlho.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Esconder senha");
});

function mostrarErro(input, mensagem) {
  const campo = input.closest(".campo");
  campo.classList.add("erro");
  campo.querySelector(".campo-erro").textContent = mensagem;
  input.setAttribute("aria-invalid", "true");
}

function limparErro(input) {
  input.closest(".campo").classList.remove("erro");
  input.removeAttribute("aria-invalid");
}

function mostrarAlerta(mensagem) {
  alertaTexto.textContent = mensagem;
  alerta.classList.add("visivel");
}

function esconderAlerta() {
  alerta.classList.remove("visivel");
}

[campoNome, campoEmail, campoCidade, campoSenha].forEach((input) => {
  input.addEventListener("input", () => {
    limparErro(input);
    esconderAlerta();
  });
});

function validar() {
  let valido = true;

  const erros = [
    [campoNome, validarNomePessoa(campoNome.value)],
    [campoEmail, validarEmail(campoEmail.value)],
    [campoCidade, validarCidade(campoCidade.value)]
  ];

  const senha = campoSenha.value;
  let erroSenha = "";
  if (senha === "") erroSenha = "Crie uma senha.";
  else if (senha.length < SENHA_MINIMA) erroSenha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres. Faltam ${SENHA_MINIMA - senha.length}.`;
  else if (senha.length > 64) erroSenha = "A senha pode ter no máximo 64 caracteres.";
  else if (!senha.trim()) erroSenha = "A senha não pode ser só espaços.";
  erros.push([campoSenha, erroSenha]);

  erros.forEach(([campo, mensagem]) => {
    if (mensagem) {
      mostrarErro(campo, mensagem);
      valido = false;
    }
  });

  return valido;
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  esconderAlerta();

  if (!validar()) {
    form.querySelector("[aria-invalid='true']").focus();
    return;
  }

  const usuario = cadastrar({
    nome: limparEspacos(campoNome.value),
    email: campoEmail.value.trim().toLowerCase(),
    cidade: encontrarCidade(campoCidade.value),
    senha: campoSenha.value
  });

  if (!usuario) {
    mostrarErro(campoEmail, "Já existe uma conta com esse e-mail. Entre com ela ou use outro e-mail.");
    campoEmail.focus();
    return;
  }

  window.location.href = "boas-vindas.html";
});
