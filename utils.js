// Funções puras da aplicação (sem DOM, sem rede) — por isso são fáceis de testar.

// Lista de times: cada um ligado à sigla do seu estado (UF).
// A região NÃO fica aqui: ela vem da API do IBGE.
export const TIMES = [
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

// Tira acentos e deixa minúsculo: "Grêmio" -> "gremio"
export function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Procura um time pelo nome: primeiro o nome exato, depois "contém".
// Devolve o time ou undefined.
export function encontrarTime(termo, times) {
  const busca = normalizar(termo);
  if (!busca) return undefined;
  return (
    times.find((t) => normalizar(t.nome) === busca) ||
    times.find((t) => normalizar(t.nome).includes(busca))
  );
}

// Times cadastrados num estado (pela sigla UF)
export function timesDoEstado(uf, times) {
  return times.filter((t) => t.uf === uf);
}

// Texto salvo no banco: "São Paulo (SP) · Sudeste"
export function montarResumo(estado) {
  return `${estado.nome} (${estado.sigla}) · ${estado.regiao.nome}`;
}
