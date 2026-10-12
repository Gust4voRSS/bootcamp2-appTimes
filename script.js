// URL base da API de Localidades do IBGE (pública, sem chave)
const API_IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";

// Lista de times: cada um ligado à sigla do seu estado (UF).
// A região NÃO fica aqui: ela vem da API do IBGE.
const TIMES = [
  // Sudeste
  { nome: "Palmeiras", uf: "SP" },
  { nome: "Corinthians", uf: "SP" },
  { nome: "São Paulo", uf: "SP" },
  { nome: "Santos", uf: "SP" },
  { nome: "Red Bull Bragantino", uf: "SP" },
  { nome: "Mirassol", uf: "SP" },
  { nome: "Flamengo", uf: "RJ" },
  { nome: "Fluminense", uf: "RJ" },
  { nome: "Vasco da Gama", uf: "RJ" },
  { nome: "Botafogo", uf: "RJ" },
  { nome: "Atlético Mineiro", uf: "MG" },
  { nome: "Cruzeiro", uf: "MG" },
  // Sul
  { nome: "Grêmio", uf: "RS" },
  { nome: "Internacional", uf: "RS" },
  { nome: "Juventude", uf: "RS" },
  { nome: "Athletico Paranaense", uf: "PR" },
  { nome: "Coritiba", uf: "PR" },
  { nome: "Chapecoense", uf: "SC" },
  { nome: "Avaí", uf: "SC" },
  { nome: "Figueirense", uf: "SC" },
  // Nordeste
  { nome: "Bahia", uf: "BA" },
  { nome: "Vitória", uf: "BA" },
  { nome: "Fortaleza", uf: "CE" },
  { nome: "Ceará", uf: "CE" },
  { nome: "Sport", uf: "PE" },
  { nome: "Náutico", uf: "PE" },
  { nome: "Santa Cruz", uf: "PE" },
  { nome: "CRB", uf: "AL" },
  { nome: "CSA", uf: "AL" },
  // Centro-Oeste
  { nome: "Goiás", uf: "GO" },
  { nome: "Atlético Goianiense", uf: "GO" },
  { nome: "Cuiabá", uf: "MT" },
  { nome: "Gama", uf: "DF" },
  { nome: "Brasiliense", uf: "DF" },
  // Norte
  { nome: "Remo", uf: "PA" },
  { nome: "Paysandu", uf: "PA" },
  { nome: "Manaus", uf: "AM" },
];

// ---------- Funções auxiliares ----------

// Tira acentos e deixa minúsculo: "Grêmio" -> "gremio"
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Evita que o texto digitado pelo usuário vire HTML na página
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Faz a requisição e devolve o JSON (ou lança erro se a API falhar)
async function buscarJSON(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
  return resposta.json();
}

// Preenche as sugestões do campo de busca
function preencherSugestoes() {
  const lista = document.getElementById("lista-times");
  lista.innerHTML = TIMES.map((t) => `<option value="${t.nome}">`).join("");
}

// ---------- Funcionalidade 1: buscar um time ----------

async function buscarTime(termo) {
  const area = document.getElementById("resultado-time");
  const busca = normalizar(termo);

  // Primeiro tenta o nome exato; se não achar, tenta "contém"
  const time =
    TIMES.find((t) => normalizar(t.nome) === busca) ||
    TIMES.find((t) => normalizar(t.nome).includes(busca));

  if (!time) {
    area.innerHTML = `<p class="aviso">Não encontrei "${escaparHTML(termo)}" na lista. Tente outro nome, como Flamengo ou Grêmio.</p>`;
    return;
  }

  area.innerHTML = `<p class="carregando">Consultando o IBGE...</p>`;

  try {
    const estado = await buscarJSON(`${API_IBGE}/estados/${time.uf}`);
    area.innerHTML = `
      <article class="cartao regiao-${estado.regiao.sigla}">
        <h3>${time.nome}</h3>
        <dl>
          <dt>Estado</dt><dd>${estado.nome} (${estado.sigla})</dd>
          <dt>Região</dt><dd>${estado.regiao.nome}</dd>
          <dt>Sigla da região</dt><dd>${estado.regiao.sigla}</dd>
          <dt>Código IBGE do estado</dt><dd>${estado.id}</dd>
        </dl>
      </article>`;
  } catch (erro) {
    console.error(erro);
    area.innerHTML = `<p class="erro">Não foi possível consultar o IBGE agora. Verifique sua conexão e tente novamente.</p>`;
  }
}
document.getElementById("form-time").addEventListener("submit", (evento) => {
  evento.preventDefault(); // impede o formulário de recarregar a página
  const termo = document.getElementById("campo-time").value;
  if (termo.trim()) buscarTime(termo);
});

document.getElementById("select-regiao").addEventListener("change", (evento) => {
  const select = evento.target;
  const nome = select.options[select.selectedIndex].text;
  listarRegiao(select.value, nome);
});

preencherSugestoes();
