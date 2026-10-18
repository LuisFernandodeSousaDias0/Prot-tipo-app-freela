if (estaLogado()) {
  window.location.replace("home.html");
}

const form = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const btnOlho = document.getElementById("btn-olho");

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

[campoEmail, campoSenha].forEach((input) => {
  input.addEventListener("input", () => {
    limparErro(input);
    esconderAlerta();
  });
});

function validar() {
  let valido = true;
  const email = campoEmail.value.trim();

  if (email === "") {
    mostrarErro(campoEmail, "Digite seu e-mail.");
    valido = false;
  } else if (!REGEX_EMAIL.test(email)) {
    mostrarErro(campoEmail, "Esse e-mail parece incompleto. Use o formato nome@email.com.");
    valido = false;
  }

  if (campoSenha.value === "") {
    mostrarErro(campoSenha, "Digite sua senha.");
    valido = false;
  }

  return valido;
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  esconderAlerta();

  if (!validar()) {
    form.querySelector("[aria-invalid='true']").focus();
    return;
  }

  const usuario = fazerLogin(campoEmail.value.trim(), campoSenha.value);

  if (!usuario) {
    mostrarAlerta("E-mail ou senha não conferem. Confira os dois e tente de novo.");
    campoSenha.value = "";
    campoSenha.focus();
    return;
  }

  window.location.href = "home.html";
});
