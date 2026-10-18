const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar");
const editar = {
  nome: document.getElementById("editar-nome"),
  cidade: document.getElementById("editar-cidade"),
  titulo: document.getElementById("editar-titulo-prof"),
  sobre: document.getElementById("editar-sobre"),
  foto: document.getElementById("editar-foto"),
  habilidades: document.getElementById("editar-habilidades"),
  experiencias: document.getElementById("lista-experiencias")
};

const MAXIMO_EXPERIENCIAS = 8;

let fotoRascunho = "";
let trocaNome = { pode: true, diasRestantes: 0 };

function atualizarPreviaFoto() {
  const previa = document.getElementById("editar-foto-previa");
  previa.innerHTML = htmlAvatar({ nome: editar.nome.value || pessoa.nome, foto: fotoRascunho });
  document.getElementById("remover-foto").hidden = !fotoRascunho;
}

function atualizarContadoresEdicao() {
  document.getElementById("contador-titulo-prof").textContent = `${editar.titulo.value.length}/60`;
  document.getElementById("contador-sobre").textContent = `${editar.sobre.value.length}/500`;
}

function htmlExperienciaEdicao(exp = {}) {
  return `
    <div class="experiencia-edicao">
      <div class="campo">
        <label>O que você fazia
          <input type="text" data-exp="titulo" maxlength="60" value="${escapar(exp.titulo || "")}" placeholder="Ex.: Garçom de eventos">
        </label>
        <p class="campo-erro"></p>
      </div>
      <div class="campos-linha">
        <div class="campo">
          <label>Onde
            <input type="text" data-exp="local" maxlength="60" value="${escapar(exp.local || "")}" placeholder="Ex.: Buffet Sabor de Minas">
          </label>
          <p class="campo-erro"></p>
        </div>
        <div class="campo">
          <label>Quando
            <input type="text" data-exp="periodo" maxlength="30" value="${escapar(exp.periodo || "")}" placeholder="Ex.: 2022 a 2024">
          </label>
          <p class="campo-erro"></p>
        </div>
      </div>
      <div class="campo">
        <label>Detalhes
          <textarea data-exp="descricao" maxlength="200" placeholder="O que você fazia no dia a dia (opcional)">${escapar(exp.descricao || "")}</textarea>
        </label>
        <p class="campo-erro"></p>
      </div>
      <button type="button" class="btn-remover" data-remover-exp>${ICONES.lixo} Remover experiência</button>
    </div>
  `;
}

function abrirEdicao() {
  pessoa = buscarUsuarioPorId(eu.id);
  fotoRascunho = pessoa.foto || "";

  trocaNome = infoTrocaDeNome(pessoa);
  editar.nome.value = pessoa.nome;
  editar.nome.readOnly = !trocaNome.pode;
  document.getElementById("editar-nome-ajuda").textContent = trocaNome.pode
    ? `Você pode trocar o nome uma vez a cada ${LIMITES.diasEntreTrocasDeNome} dias.`
    : `Você trocou o nome recentemente. Poderá trocar de novo em ${trocaNome.diasRestantes} ${trocaNome.diasRestantes === 1 ? "dia" : "dias"}.`;
  editar.cidade.value = pessoa.cidade || "";
  editar.titulo.value = pessoa.titulo || "";
  editar.sobre.value = pessoa.sobre || "";
  editar.foto.value = "";

  const marcadas = pessoa.habilidades || [];
  editar.habilidades.innerHTML = CATEGORIAS.filter((c) => c !== "Outros").map((categoria) => `
    <label class="chip-marcar">
      <input type="checkbox" value="${escapar(categoria)}" ${marcadas.includes(categoria) ? "checked" : ""}>
      ${ICONES.check}
      ${escapar(categoria)}
    </label>
  `).join("");

  editar.experiencias.innerHTML = (pessoa.experiencias || []).map((exp) => htmlExperienciaEdicao(exp)).join("");

  formEditar.querySelectorAll(".campo.erro").forEach((campo) => campo.classList.remove("erro"));
  atualizarBotaoExperiencia();
  atualizarPreviaFoto();
  atualizarContadoresEdicao();
  modalEditar.showModal();
}

function reduzirImagem(arquivo, tamanho = 320) {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        const lado = Math.min(imagem.width, imagem.height);
        const canvas = document.createElement("canvas");
        canvas.width = tamanho;
        canvas.height = tamanho;
        canvas.getContext("2d").drawImage(
          imagem,
          (imagem.width - lado) / 2,
          (imagem.height - lado) / 2,
          lado,
          lado,
          0,
          0,
          tamanho,
          tamanho
        );
        resolver(canvas.toDataURL("image/jpeg", 0.85));
      };
      imagem.onerror = rejeitar;
      imagem.src = leitor.result;
    };

    leitor.onerror = rejeitar;
    leitor.readAsDataURL(arquivo);
  });
}

editar.foto.addEventListener("change", async () => {
  const arquivo = editar.foto.files[0];
  if (!arquivo) return;

  if (!arquivo.type.startsWith("image/")) {
    mostrarToast("Escolha um arquivo de imagem, como JPG ou PNG.");
    return;
  }

  try {
    fotoRascunho = await reduzirImagem(arquivo);
    atualizarPreviaFoto();
  } catch (erro) {
    mostrarToast("Não foi possível ler essa imagem. Tente outra.");
  }
});

document.getElementById("remover-foto").addEventListener("click", () => {
  fotoRascunho = "";
  editar.foto.value = "";
  atualizarPreviaFoto();
});

function atualizarBotaoExperiencia() {
  const total = editar.experiencias.querySelectorAll(".experiencia-edicao").length;
  document.getElementById("adicionar-experiencia").hidden = total >= MAXIMO_EXPERIENCIAS;
}

document.getElementById("adicionar-experiencia").addEventListener("click", () => {
  editar.experiencias.insertAdjacentHTML("beforeend", htmlExperienciaEdicao());
  atualizarBotaoExperiencia();
  editar.experiencias.lastElementChild.querySelector("input").focus();
});

editar.experiencias.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-remover-exp]");
  if (botao) {
    botao.closest(".experiencia-edicao").remove();
    atualizarBotaoExperiencia();
  }
});

editar.nome.addEventListener("input", () => {
  editar.nome.closest(".campo").classList.remove("erro");
  atualizarPreviaFoto();
});

editar.cidade.addEventListener("input", () => {
  editar.cidade.closest(".campo").classList.remove("erro");
});

[editar.titulo, editar.sobre].forEach((campo) => campo.addEventListener("input", atualizarContadoresEdicao));

function erroEdicao(input, mensagem) {
  const campo = input.closest(".campo");
  campo.classList.add("erro");
  campo.querySelector(".campo-erro").textContent = mensagem;
}

formEditar.addEventListener("input", (evento) => {
  const campo = evento.target.closest(".campo");
  if (campo) campo.classList.remove("erro");
});

function validarEdicao() {
  const erros = [];
  const nome = limparEspacos(editar.nome.value);

  if (nome !== pessoa.nome) {
    erros.push([editar.nome, trocaNome.pode ? validarNomePessoa(nome) : "Você ainda não pode trocar o nome."]);
  }

  erros.push([editar.cidade, validarCidade(editar.cidade.value)]);
  erros.push([editar.titulo, validarTextoLivre(editar.titulo.value, { nome: "o título profissional", minimo: 3, maximo: 60, obrigatorio: false })]);
  erros.push([editar.sobre, validarTextoLivre(editar.sobre.value, { nome: "o texto sobre você", minimo: 10, maximo: 500, obrigatorio: false })]);

  editar.experiencias.querySelectorAll(".experiencia-edicao").forEach((bloco) => {
    const campo = (chave) => bloco.querySelector(`[data-exp="${chave}"]`);
    const algumPreenchido = ["titulo", "local", "periodo", "descricao"].some((c) => campo(c).value.trim());
    if (!algumPreenchido) return;

    erros.push([campo("titulo"), validarTextoLivre(campo("titulo").value, { nome: "a experiência", minimo: 3, maximo: 60 })]);
    erros.push([campo("local"), validarTextoLivre(campo("local").value, { nome: "o local", minimo: 2, maximo: 60, obrigatorio: false })]);
    erros.push([campo("periodo"), campo("periodo").value.trim().length > 30 ? "Use no máximo 30 caracteres." : temRepeticao(campo("periodo").value) ? "Esse período não parece válido." : ""]);
    erros.push([campo("descricao"), validarTextoLivre(campo("descricao").value, { nome: "os detalhes", minimo: 5, maximo: 200, obrigatorio: false })]);
  });

  let valido = true;
  erros.forEach(([input, mensagem]) => {
    if (mensagem) {
      erroEdicao(input, mensagem);
      valido = false;
    }
  });

  return valido;
}

formEditar.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!validarEdicao()) {
    formEditar.querySelector(".campo.erro input, .campo.erro textarea").focus();
    return;
  }

  const nome = limparEspacos(editar.nome.value);
  const nomeMudou = nome !== pessoa.nome;

  const experiencias = [...editar.experiencias.querySelectorAll(".experiencia-edicao")]
    .map((bloco) => {
      const valor = (chave) => limparEspacos(bloco.querySelector(`[data-exp="${chave}"]`).value);
      return { titulo: valor("titulo"), local: valor("local"), periodo: valor("periodo"), descricao: valor("descricao") };
    })
    .filter((exp) => exp.titulo);

  const habilidades = [...editar.habilidades.querySelectorAll("input:checked")]
    .map((input) => input.value)
    .filter((valor) => CATEGORIAS.includes(valor));

  const campos = {
    cidade: encontrarCidade(editar.cidade.value),
    titulo: limparEspacos(editar.titulo.value),
    sobre: editar.sobre.value.trim().replace(/\n{3,}/g, "\n\n"),
    habilidades,
    experiencias,
    foto: fotoRascunho
  };

  if (nomeMudou) {
    campos.nome = nome;
    campos.nomeAlteradoEm = hojeISO();
  }

  const salvo = atualizarUsuario(eu.id, campos);

  if (!salvo) {
    mostrarToast("Não deu para salvar. A foto pode estar grande demais, tente outra.");
    return;
  }

  modalEditar.close();
  preencherAvatarCabecalho(salvo);
  renderizarTudo();
  mostrarToast("Perfil atualizado.");
});
