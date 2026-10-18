const usuarioLogado = lerSessao();

if (usuarioLogado) {
  const acoes = document.querySelector(".topo-acoes");
  acoes.innerHTML = `<a href="pages/home.html" class="btn btn-primario">Ir para as vagas</a>`;

  document.querySelectorAll(".hero-acoes, .chamada .container").forEach((bloco) => {
    bloco.querySelectorAll("a").forEach((link) => link.remove());
    bloco.insertAdjacentHTML("beforeend", `<a href="pages/home.html" class="btn ${bloco.classList.contains("hero-acoes") ? "btn-primario" : "btn-escuro"} btn-grande">Ir para as vagas</a>`);
  });
}
