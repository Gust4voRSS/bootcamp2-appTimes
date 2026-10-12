// Biblioteca do Supabase (banco de dados), carregada direto da internet
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ⚠️ TROQUE PELOS DADOS DO SEU PROJETO NO SUPABASE (botão "Connect")
const SUPABASE_URL = "https://nevcoobntdchfwnygvky.supabase.co";
const SUPABASE_CHAVE = "sb_publishable_M3kFLYd_ykYJZx7oNhr0uw_deDjeT1R";

const supabase = createClient(SUPABASE_URL, SUPABASE_CHAVE);

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

// Evita que um texto vire HTML na página
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
    const resumo = `${estado.nome} (${estado.sigla}) · ${estado.regiao.nome}`;

    area.innerHTML = `
      <article class="cartao regiao-${estado.regiao.sigla}">
        <h3>${time.nome}</h3>
        <dl>
          <dt>Estado</dt><dd>${estado.nome} (${estado.sigla})</dd>
          <dt>Região</dt><dd>${estado.regiao.nome}</dd>
          <dt>Sigla da região</dt><dd>${estado.regiao.sigla}</dd>
          <dt>Código IBGE do estado</dt><dd>${estado.id}</dd>
        </dl>
        <button id="botao-favoritar" class="botao-favoritar">⭐ Favoritar</button>
        <p id="aviso-favorito"></p>
      </article>`;

    document.getElementById("botao-favoritar").addEventListener("click", () => {
      salvarFavorito(time.nome, resumo);
    });
  } catch (erro) {
    console.error(erro);
    area.innerHTML = `<p class="erro">Não foi possível consultar o IBGE agora. Verifique sua conexão e tente novamente.</p>`;
  }
}

// ---------- Funcionalidade 2: listar times por região ----------

async function listarRegiao(idRegiao, nomeRegiao) {
  const area = document.getElementById("resultado-regiao");

  if (!idRegiao) {
    area.innerHTML = "";
    return;
  }

  area.innerHTML = `<p class="carregando">Carregando estados da região ${nomeRegiao}...</p>`;

  try {
    const estados = await buscarJSON(`${API_IBGE}/regioes/${idRegiao}/estados`);
    estados.sort((a, b) => a.nome.localeCompare(b.nome));

    const blocos = estados.map((estado) => {
      const times = TIMES.filter((t) => t.uf === estado.sigla);
      const lista = times.length
        ? `<ul>${times.map((t) => `<li>${t.nome}</li>`).join("")}</ul>`
        : `<p class="vazio">Nenhum time cadastrado</p>`;
      return `
        <article class="cartao-estado">
          <h3>${estado.nome} <span>${estado.sigla}</span></h3>
          ${lista}
        </article>`;
    }).join("");

    area.innerHTML = `
      <p class="resumo">A região ${nomeRegiao} tem ${estados.length} estados.</p>
      <div class="grade">${blocos}</div>`;
  } catch (erro) {
    console.error(erro);
    area.innerHTML = `<p class="erro">Não foi possível carregar a região agora. Tente novamente em instantes.</p>`;
  }
}

// ---------- Funcionalidade 3: favoritos no banco (Supabase) ----------

// CREATE: salva um time favorito
async function salvarFavorito(nome, extra) {
  const aviso = document.getElementById("aviso-favorito");
  aviso.className = "carregando";
  aviso.textContent = "Salvando...";

  const { error } = await supabase
    .from("favoritos")
    .insert({ nome_item: nome, dados_extra: extra });

  if (error) {
    console.error(error);
    if (error.code === "23505") {
      // 23505 = o time já existe na tabela (coluna "unique")
      aviso.className = "aviso";
      aviso.textContent = `${nome} já está nos seus favoritos.`;
    } else {
      aviso.className = "erro";
      aviso.textContent = "Não foi possível salvar agora. Tente novamente.";
    }
    return;
  }

  aviso.className = "sucesso";
  aviso.textContent = `${nome} foi adicionado aos favoritos! ⭐`;
  listarFavoritos();
}

// READ: busca os favoritos no banco
async function listarFavoritos() {
  const area = document.getElementById("lista-favoritos");

  const { data, error } = await supabase
    .from("favoritos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error(error);
    area.innerHTML = `<p class="erro">Não foi possível carregar os favoritos agora.</p>`;
    return;
  }

  renderizarLista(data);
}

// Desenha a lista de favoritos na tela
function renderizarLista(favoritos) {
  const area = document.getElementById("lista-favoritos");
       document.getElementById("contador").textContent = favoritos.length;

  if (!favoritos.length) {
    area.innerHTML = `<p class="vazio">Você ainda não tem favoritos. Busque um time e clique em ⭐ Favoritar.</p>`;
    return;
  }

  area.innerHTML = `
    <ul class="favoritos">
      ${favoritos.map((f) => `
        <li>
          <div>
            <strong>${escaparHTML(f.nome_item)}</strong>
            <span>${escaparHTML(f.dados_extra ?? "")}</span>
          </div>
          <button class="botao-excluir" data-id="${f.id}" data-nome="${escaparHTML(f.nome_item)}">Excluir</button>
        </li>`).join("")}
    </ul>`;
}

// DELETE: remove um favorito
async function removerFavorito(id) {
  const { error } = await supabase.from("favoritos").delete().eq("id", id);

  if (error) {
    console.error(error);
    alert("Não foi possível excluir agora. Tente novamente.");
    return;
  }

  listarFavoritos();
}

// ---------- Eventos ----------

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

// Um único "ouvinte" para todos os botões Excluir da lista
document.getElementById("lista-favoritos").addEventListener("click", (evento) => {
  const botao = evento.target.closest(".botao-excluir");
  if (!botao) return;
  if (confirm(`Remover ${botao.dataset.nome} dos favoritos?`)) {
    removerFavorito(botao.dataset.id);
  }
});

preencherSugestoes();
listarFavoritos(); // carrega os favoritos assim que a página abre
