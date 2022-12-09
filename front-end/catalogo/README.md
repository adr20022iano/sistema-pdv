# Catálogo Lite PDV

Este projeto é uma base para os catálogos do [Lite PDV](https://github.com/Devap-br/lite-pdv).

## Servidor de desenvolvimento

Execute `npm run dev` para inicializar o projeto em `192.168.0.101:5500`.

## Criando um catálogo

- Criar um repositório em branco com o nome do site.
- Adicionar este repositório como um remote upstream
  `git remote add upstream https://github.com/Devap-br/catalogo-lite-pdv.git`.
- Executar um pull para receber os arquivos e histórico do git do branch `master` deste repositório
  `git pull upstream master`.

## Atualizando um catálogo

- Executar o comando `upstream:update` para realizar a atualização do fork do catálogo. Um `merge` automático das alterações será executado.
- Realizar um `push` do branch `master` do repositório do catálogo para que as atualizações sejam publicadas.

## Configuração de um novo catálogo

- Atualizar arquivo da logo.
- Atualizar nome do projeto nos seguintes arquivos:
  - `index.html`.
  - `angular.json`.
  - `package.json` e em seguida executar `npm i --package-lock-only` para atualizar o `package.lock.json`.
- Alterar paleta de cores.
- Service worker:
  - Atualizar ícones e fav-icon.
  - Atualizar arquivo `manifest.webmanifest.json`.
  - Atualizar theme color no arquivo `index.html`.
  - Atualizar imagem de fundo da página 404.
- Atualizar parâmetros do arquivo `catalog-params.ts`.

###### *Projeto gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 10.1.7.*
