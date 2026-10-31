// Testes com o executor nativo do Node (node --test) — não precisa instalar nada.
import { test } from "node:test";
import assert from "node:assert/strict";
import { TIMES, normalizar, encontrarTime, timesDoEstado, montarResumo } from "./utils.js";

test("normalizar tira acentos e deixa minúsculo", () => {
  assert.equal(normalizar("  Grêmio "), "gremio");
});

test("encontrarTime acha pelo nome exato, sem acento", () => {
  assert.equal(encontrarTime("gremio", TIMES).uf, "SP");
});

test("encontrarTime acha por parte do nome", () => {
  assert.equal(encontrarTime("vasco", TIMES).nome, "Vasco da Gama");
});

test("encontrarTime devolve undefined para time inexistente ou vazio", () => {
  assert.equal(encontrarTime("Barcelona", TIMES), undefined);
  assert.equal(encontrarTime("   ", TIMES), undefined);
});

test("timesDoEstado lista só os times da UF", () => {
  const nomes = timesDoEstado("DF", TIMES).map((t) => t.nome);
  assert.deepEqual(nomes, ["Gama", "Brasiliense"]);
});

test("montarResumo formata estado e região", () => {
  const estado = { nome: "São Paulo", sigla: "SP", regiao: { nome: "Sudeste" } };
  assert.equal(montarResumo(estado), "São Paulo (SP) · Sudeste");
});
