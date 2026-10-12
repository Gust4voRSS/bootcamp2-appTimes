# Futebol por Região

## Autor
Nome completo — Matrícula 0000000

## Descrição
Aplicação web que mostra o estado e a região do Brasil de clubes de futebol brasileiros. É útil para quem quer conhecer a distribuição geográfica dos times ou explorar quais clubes existem em cada região.

## API utilizada
- **API de Localidades do IBGE** — https://servicodados.ibge.gov.br/api/docs/localidades
- Endpoints consumidos:
  - `GET /api/v1/localidades/estados/{UF}` — dados de um estado e da sua região
  - `GET /api/v1/localidades/regioes/{id}/estados` — estados de uma região

## Funcionalidades
- Buscar um time pelo nome, com sugestões enquanto digita, e ver estado, sigla, região e código IBGE do estado
- Escolher uma região e ver todos os seus estados com os times cadastrados em cada um
- Mensagens amigáveis quando o time não é encontrado ou quando a API está fora do ar

## Como executar localmente
1. Clone: `git clone URL_DO_REPOSITORIO`
2. Abra o arquivo `index.html` no navegador

## Links
- **Aplicação no ar (GitHub Pages):** https://seu-usuario.github.io/bootcamp2-app/
- **Repositório:** https://github.com/seu-usuario/bootcamp2-app
