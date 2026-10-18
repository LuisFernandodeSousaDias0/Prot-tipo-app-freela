const usuario = lerSessao();

if (usuario) {
  const primeiroNome = usuario.nome.split(" ")[0];
  const cidade = usuario.cidade || "Belo Horizonte";

  document.getElementById("bv-titulo").textContent = `Tudo pronto, ${primeiroNome}.`;
  document.getElementById("bv-texto-trabalhar").textContent =
    `Veja os bicos abertos na região de ${cidade} e candidate-se aos que combinam com seu tempo.`;
}
