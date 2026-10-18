const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const REGEX_LUGAR = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:[ '.-]+[A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*$/;

function limparEspacos(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

function contarLetras(texto) {
  return (texto.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length;
}

function temPalavraGigante(texto) {
  return texto.split(/\s+/).some((palavra) => palavra.length > LIMITES.palavraMaxima);
}

function temRepeticao(texto) {
  const regex = new RegExp(`(.)\\1{${LIMITES.repeticaoMaxima},}`, "i");
  return regex.test(texto.replace(/\s/g, ""));
}

function contrair(rotulo) {
  return rotulo
    .replace(/^o /, "no ")
    .replace(/^a /, "na ")
    .replace(/^os /, "nos ")
    .replace(/^as /, "nas ");
}

function validarTextoLivre(texto, { nome, minimo = 0, maximo = 500, obrigatorio = true }) {
  const limpo = texto.trim();
  const em = contrair(nome);

  if (!limpo) {
    return obrigatorio ? `Preencha ${nome}.` : "";
  }

  if (limpo.length < minimo) {
    return `${nome[0].toUpperCase() + nome.slice(1)} precisa ter pelo menos ${minimo} caracteres.`;
  }

  if (limpo.length > maximo) {
    return `${nome[0].toUpperCase() + nome.slice(1)} pode ter no máximo ${maximo} caracteres.`;
  }

  if (contarLetras(limpo) < Math.min(3, minimo || 3)) {
    return `Use palavras de verdade ${em}, não só números ou símbolos.`;
  }

  if (temPalavraGigante(limpo)) {
    return `Tem uma palavra muito longa ${em}. Separe com espaços.`;
  }

  if (temRepeticao(limpo)) {
    return `Evite repetir a mesma letra ou símbolo várias vezes seguidas ${em}.`;
  }

  return "";
}

function validarNomePessoa(nome) {
  const limpo = limparEspacos(nome);

  if (!limpo) return "Digite seu nome.";
  if (limpo.length < 3) return "O nome precisa ter pelo menos 3 letras.";
  if (limpo.length > 60) return "O nome pode ter no máximo 60 caracteres.";
  if (!REGEX_NOME.test(limpo)) return "Use só letras no nome, sem números ou símbolos.";
  if (temPalavraGigante(limpo) || temRepeticao(limpo)) return "Esse nome não parece válido. Confira e tente de novo.";

  return "";
}

function validarLugar(texto, artigo, nome) {
  const limpo = limparEspacos(texto);
  const preposicao = artigo === "a" ? "na" : "no";
  const maiusculo = nome[0].toUpperCase() + nome.slice(1);

  if (!limpo) return `Digite ${artigo} ${nome}.`;
  if (limpo.length < 2) return `Digite ${artigo} ${nome} completo.`;
  if (limpo.length > 50) return `${maiusculo} pode ter no máximo 50 caracteres.`;
  if (!REGEX_LUGAR.test(limpo) || contarLetras(limpo) < 2) return `Use só letras e números ${preposicao} ${nome}.`;
  if (temPalavraGigante(limpo) || temRepeticao(limpo)) return `Esse nome de ${nome} não parece válido. Confira e tente de novo.`;

  return "";
}

function validarEmail(email) {
  const limpo = email.trim();

  if (!limpo) return "Digite seu e-mail.";
  if (limpo.length > 100) return "Esse e-mail é longo demais.";
  if (!REGEX_EMAIL.test(limpo)) return "Esse e-mail parece incompleto. Use o formato nome@email.com.";

  return "";
}

function somarDias(dataISO, dias) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function validarCidade(texto) {
  if (!limparEspacos(texto)) return "Escolha sua cidade.";
  if (!encontrarCidade(texto)) return "Por enquanto o Free-la funciona só na Grande BH. Escolha uma cidade da lista.";
  return "";
}

function preencherListaCidades() {
  document.querySelectorAll("datalist#cidades").forEach((lista) => {
    lista.innerHTML = CIDADES.map((cidade) => `<option value="${cidade}"></option>`).join("");
  });
}

preencherListaCidades();
