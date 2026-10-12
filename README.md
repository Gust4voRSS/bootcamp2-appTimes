# Futebol por Região

## Autor
Gustavo Rodrigues Sousa Spindola - RA22654035

## Descrição
Aplicação web que mostra o estado e a região do Brasil de clubes de futebol brasileiros, e permite salvar os times favoritos num banco de dados. É útil para quem quer conhecer a distribuição geográfica dos times ou explorar quais clubes existem em cada região.

## Links
- **Repositório GitHub:** https://github.com/gust4vorss/bootcamp2-app
- **Aplicação no ar (GitHub Pages):** https://gust4vorss.github.io/bootcamp2-app/
- **Imagem no Docker Hub:** https://hub.docker.com/r/gust4vorss/bootcamp2-app

## Rodar com Docker (um comando só)
```
docker run -d -p 8080:80 gust4vorss/bootcamp2-app:1.1
```
Depois abra **http://localhost:8080** no navegador.

## API utilizada
- **API de Localidades do IBGE** — https://servicodados.ibge.gov.br/api/docs/localidades
- Endpoints consumidos:
  - `GET /api/v1/localidades/estados/{UF}` — dados de um estado e da sua região
  - `GET /api/v1/localidades/regioes/{id}/estados` — estados de uma região

## Funcionalidades
- Buscar um time pelo nome, com sugestões enquanto digita, e ver estado, sigla, região e código IBGE do estado
- Favoritar um time (fica salvo no banco de dados)
- Ver a lista "Meus favoritos", que carrega sozinha ao abrir a página
- Excluir um time dos favoritos
- Escolher uma região e ver todos os seus estados com os times cadastrados em cada um
- Mensagens amigáveis quando o time não é encontrado, quando ele já é favorito ou quando a API/banco está fora do ar

## Persistência de dados
- **Banco escolhido:** Supabase (PostgreSQL), acessado direto do frontend pela biblioteca `supabase-js`.
- **O que é salvo:** os times favoritos do usuário, com o estado e a região de cada um.
- **Estrutura da tabela `favoritos`:**

| Coluna | Tipo | Para que serve |
|---|---|---|
| `id` | bigint (automático) | Identificador de cada favorito |
| `criado_em` | timestamptz (automático) | Data e hora em que foi salvo |
| `nome_item` | text (único) | Nome do time (não deixa repetir) |
| `dados_extra` | text | Estado e região, ex.: "São Paulo (SP) · Sudeste" |

- **Operações (CRUD):** criar (botão ⭐ Favoritar), listar (seção Meus favoritos) e excluir (botão Excluir).
- O script que cria a tabela está no arquivo `banco.sql`.
- **Limitação conhecida:** as políticas de acesso (RLS) estão abertas para o papel `anon`, ou seja, qualquer visitante pode ver, adicionar e excluir favoritos, e a lista é a mesma para todo mundo. Numa versão futura, o ideal é adicionar login (Supabase Auth) para que cada usuário tenha os próprios favoritos.

## Como executar localmente
1. Clone: `git clone https://github.com/gust4vorss/bootcamp2-app`
2. Abra o arquivo `index.html` com a extensão Live Server do VS Code (por usar `type="module"`, o arquivo precisa ser aberto por um servidor, não com duplo clique)
3. Ou rode com Docker usando o comando da seção acima

## Sidequests

### SQ1 · .dockerignore
O arquivo `.dockerignore` lista o que **não** deve entrar na imagem: a pasta `.git`, o `README.md`, os prints, o `banco.sql`, os próprios arquivos do Docker e rascunhos. Quando rodamos `docker build`, o Docker primeiro envia a pasta inteira para o "construtor" (o chamado *contexto de build*). Ignorando esses arquivos, o envio é menor, o build fica mais rápido e a imagem leva só o necessário para o site funcionar, sem histórico do Git ou arquivos que não servem para nada dentro do servidor.

### SQ2 · Versionamento de imagem
No Docker Hub existem três tags:
- `1.0` — primeira versão funcional (busca, regiões e favoritos)
- `1.1` — melhoria: contador de favoritos no título da seção
- `latest` — aponta para a versão mais recente (igual à 1.1)

### SQ3 · Descrição no Docker Hub
A aba *Overview* do repositório no Docker Hub explica o que é a aplicação, traz o comando `docker run` pronto para copiar e o link deste repositório.

### SQ4 · Explorando a orquestração
Rodei dois containers da mesma imagem ao mesmo tempo, um na porta 8080 e outro na 8081:

![docker ps mostrando dois containers](prints/sq4-docker-ps.png)

**Se eu tivesse 100 containers, como gerenciaria?**
Abrir e acompanhar 100 containers com `docker run` um por um seria impossível de manter. Para isso existem orquestradores, e o mais usado é o **Kubernetes**. Nele, várias máquinas formam um **cluster**, e o Kubernetes decide sozinho em qual máquina cada container vai rodar. Os containers ficam dentro de **pods**, que são a menor unidade que o Kubernetes gerencia. Em vez de criar container por container, eu diria apenas "quero 100 **réplicas** desta imagem", e o Kubernetes manteria esse número: se um container cair, ele sobe outro no lugar automaticamente. Ele também distribui os acessos entre as réplicas (balanceamento de carga) e permite atualizar da versão 1.0 para a 1.1 aos poucos, sem deixar o site fora do ar.
