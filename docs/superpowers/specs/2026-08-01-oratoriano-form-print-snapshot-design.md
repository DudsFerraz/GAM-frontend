# Quinta fatia de Oratoriano Forms — snapshots de impressão e PDF

## Status

Design aprovado pelo usuário em 2026-08-01. A alternativa visual escolhida é a
A, `Card compacto integrado`. Este documento descreve somente E6 e E7 da Onda
A; não inclui anexos, conclusão, revogação ou descoberta de snapshots.

O documento não foi commitado porque a solicitação da task proíbe commits sem
pedido explícito.

## Contexto atual

As quatro fatias anteriores já entregam histórico, detalhe protegido, criação e
edição integral de rascunho e exclusão segura. O editor usa um único
React Hook Form, cinco etapas horizontais, cards, badges e um blocker local para
alterações não salvas. A página remove o detalhe sensível ao ser abandonada.

O contrato gerado atual já contém:

- `POST /oratorianos/{oratorianoId}/forms/{formId}/print-snapshots`, sem
  `requestBody`, retornando `PrintSnapshotRDTO`;
- `GET /oratorianos/{oratorianoId}/forms/{formId}/print-snapshots/{printSnapshotId}/pdf`,
  retornando `application/pdf`;
- os campos `id`, `formId`, `draftRevision`, `mode`, `generatedAt`,
  `templateVersion`, `pageCount` e `fingerprint` em `PrintSnapshotRDTO`.

O contrato ainda não lista snapshots. Portanto, o frontend conhece somente os
metadados retornados enquanto o workspace atual está aberto.

## Decisão visual aprovada

Usar um card compacto integrado ao quinto passo do editor, com:

- título orientado à ação, descrição curta e metadados seguros;
- ação principal `Gerar e baixar PDF` quando a ficha estiver pronta;
- estados de geração, download, sucesso, retry e revisão desatualizada dentro
  do mesmo card;
- aviso persistente de que os metadados só podem ser reencontrados enquanto a
  página estiver aberta;
- o mesmo card também no detalhe somente leitura quando a conta possuir as
  capacidades necessárias, sem mudar a estrutura do detalhe;
- composição responsiva que mantém o card legível em 320 px, 768 px e telas
  amplas, usando os tokens atuais e os temas claro/escuro.

A alternativa B foi descartada porque duplica a navegação de cinco etapas do
editor. A alternativa C foi descartada porque se aproxima de uma listagem
histórica, embora a Onda A não possa redescobrir snapshots depois de reload.

## Limites de produto

### Atual nesta fatia

- criar um snapshot imutável e selecionar o retorno autoritativo;
- iniciar o download imediatamente como uma segunda operação;
- repetir somente o download quando E7 falhar;
- manter os metadados em memória enquanto a página estiver aberta;
- marcar snapshots de `DIRECT_SYSTEM_ENTRY` com revisão divergente como
  desatualizados;
- manter snapshots de `PAPER_TRANSCRIPTION` válidos mesmo que a ficha seja
  editada depois;
- proteger a saída quando houver alterações não salvas ou snapshot efêmero.

### Fora desta fatia

- query function ou endpoint de listagem;
- persistência, URL, hash, storage do navegador ou UUID digitado;
- preview de PDF, URL permanente, analytics ou console com dados de negócio;
- anexos, upload, conclusão, revogação e qualquer alteração no backend;
- edição manual de `gam-api.ts` ou `routeTree.gen.ts`.

## Tipos e apresentação

`types.ts` adicionará apenas aliases derivados de
`components['schemas']['PrintSnapshotRDTO']`. Nenhum DTO de transporte será
duplicado manualmente.

`presentation.ts` terá mapeamentos frontend-owned para:

- `IDENTIFIED_BLANK` → `PDF identificado em branco`;
- `PREFILLED` → `PDF pré-preenchido`;
- modo, revisão, data de geração, páginas e versão do template;
- valores ausentes, nulos ou futuros com fallbacks neutros em português.

`fingerprint`, UUIDs e referências técnicas não serão renderizados. A data
será formatada pelos helpers existentes. A ausência de revisão será apresentada
como `Revisão não informada`, nunca como valor bruto.

## Transporte e download

`api/oratorianoForms.ts` terá duas funções novas:

1. `createOratorianoFormPrintSnapshot(oratorianoId, formId)`, que faz `POST` no
   path derivado de `paths`, sem segundo argumento e sem modo;
2. `downloadOratorianoFormPdf(oratorianoId, formId, printSnapshotId)`, que faz
   `GET` no path derivado, com `responseType: 'blob'`.

O helper feature-local `download.ts` receberá o `Blob`, criará uma object URL,
disparará um link temporário com filename business-facing sanitizado, removerá
o link e revogará a URL em `finally`. O filename usará nome do Oratoriano,
`ficha`, revisão ou data quando disponíveis, e sempre terminará em `.pdf`; não
usará UUID nem dependerá cegamente de `Content-Disposition`.

Erros de uma resposta blob serão reduzidos a status e código estáveis. O
frontend nunca exibirá o texto do blob, `message`, `details` ou payload bruto,
nem tentará baixar a resposta de erro. A menor extensão necessária da camada
de erros compartilhará o fallback existente para 403, 404, 409, falha de
geração e rede.

## Estado, hooks e fluxo

O helper de query usará exatamente a chave prevista para a Onda A:

```text
['oratoriano-forms', 'snapshots', oratorianoId, formId]
```

Essa chave receberá somente um array de metadados de
`PrintSnapshotRDTO`. Blobs, bytes e object URLs não entrarão no Query cache.
Não haverá `useQuery` de snapshots nem prefetch.

O card será composto por `FormPrintSection`, reutilizado no quinto passo do
`OratorianoFormEditor` e no detalhe somente leitura. Ele receberá o nome
business-facing, o detalhe autoritativo, permissões, `isDirty` do editor e os
identificadores apenas como props internas de chamada.

O fluxo de criação será:

1. conferir `ORATORIANO_FORM_GET` + `ORATORIANO_FORM_PDF_GENERATE` e o estado
   autoritativo;
2. para entrada direta, impedir geração enquanto `isDirty` for verdadeiro e
   orientar o salvamento;
3. executar E6 sem optimistic update;
4. inserir o retorno autoritativo na chave efêmera e selecioná-lo;
5. executar E7 separadamente;
6. preservar o snapshot selecionado quando E7 falhar.

Um retry de download recebe apenas o snapshot selecionado e chama somente E7.
Pending de E6 desabilita apenas `Gerar e baixar PDF`; pending de E7 desabilita
apenas o download correspondente. Nenhum retry automático de E6 será criado.

Para `DIRECT_SYSTEM_ENTRY`, o snapshot é atual somente quando sua
`draftRevision` é igual à revisão autoritativa atual. Um salvamento posterior
não remove o metadado; apenas o apresenta como desatualizado. Para
`PAPER_TRANSCRIPTION`, a revisão não invalida o snapshot identificado em
branco.

## Proteção de saída

O editor não terá um segundo blocker. Um guard único, montado pela página,
combinará:

```text
shouldBlock = isDirty || knownSnapshots.length > 0
```

Esse guard usará `useBlocker`/`beforeunload` para navegação interna, refresh,
fechamento e navegação externa. A confirmação interna distinguirá:

- alterações não salvas, que serão descartadas; e
- documento efêmero, que não poderá ser reencontrado pela aplicação e exigirá
  outro PDF; para transcrição de papel, outro documento precisará ser impresso
  e assinado.

Ao permanecer, o cache permanece intacto. Ao confirmar a saída, a chave exata
de snapshots é removida e a navegação prossegue. A página usará um único
diálogo para não concorrer com o blocker de dirty state existente. O PDF já
baixado não será descrito como apagado do computador.

## Testes de aceitação

### Transporte e infraestrutura

- E6 usa POST, path correto, ausência de body e ausência de modo;
- E7 usa GET, path com snapshot e `responseType: 'blob'`;
- blob PDF gera link temporário, remove link e revoga object URL;
- filename é sanitizado, business-facing e não contém UUID;
- erros blob 403/404/409/rede são seguros e não baixam conteúdo de erro;
- nenhum blob entra no Query cache.

### Hooks e fluxo

- retorno de E6 fica somente na chave efêmera e é selecionado;
- criação falha não chama E7;
- E7 falha preserva o snapshot;
- retry chama somente E7;
- pending evita snapshots duplicados;
- entrada direta exige formulário salvo e compara `draftRevision`;
- papel não é invalidado apenas por edição posterior;
- cleanup remove a chave exata sem função de listagem ou persistência.

### Componente e blocker

- permissões ausentes ocultam ou indisponibilizam a ação sem código técnico;
- loading, vazio, sucesso, erro, retry e snapshot desatualizado são acessíveis;
- nomes de ação permanecem visíveis durante pending;
- card funciona em 320 px, 768 px e desktop, em claro e escuro;
- formulário limpo sem snapshot não bloqueia;
- formulário dirty bloqueia;
- snapshot efêmero bloqueia mesmo com formulário limpo;
- permanecer preserva metadados, sair remove-os e há apenas um diálogo;
- `beforeunload` e listeners são limpos.

## Verificação e documentação

Antes da entrega serão executados os testes focados, `npm test`, `npm run lint`,
`npm run build` e `git diff --check`. A falha preexistente do build em testes de
Events, causada pelo diff já existente de `gam-api.ts`, será reportada
separadamente se permanecer.

Após a implementação, serão atualizados somente os documentos frontend que
descrevem o comportamento entregue. A limitação transitória da Onda A ficará
explícita: snapshots criados nesta sessão podem ser baixados, mas não são
redescobertos após reload.
