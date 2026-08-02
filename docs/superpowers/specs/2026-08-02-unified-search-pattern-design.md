# Padrão unificado de busca, filtro e ordenação

## Status

Proposta aprovada para implementação no frontend em 2026-08-02.

Este documento descreve o comportamento aceito para as telas de Membros,
Eventos, Contas, Oratorianos e Ocorrências. O backend e o contrato gerado
continuam sendo as autoridades para campos de filtro, valores aceitos e
ordenação.

## Contexto atual

As telas de consulta usam experiências diferentes:

- Membros possui uma barra com pesquisa rápida, filtro avançado, ordenação e
  um toggle separado para alternar entre ativos e inativos.
- Eventos combina campo de título, selects de situação e tipo e botão
  explícito de busca.
- Contas combina um select de campo de busca, termo e botão explícito.
- Oratorianos possui somente campo de nome e botão explícito.
- Ocorrências possui somente um select de situação.

Essa variação faz com que a mesma intenção — localizar, restringir ou ordenar
resultados — seja apresentada de maneiras diferentes. O objetivo é estabelecer
uma interação previsível e reutilizável sem criar um contrato de API paralelo.

## Objetivos

1. Usar uma barra compartilhada com pesquisa rápida, ação `Filtrar` e ação
   `Ordenar` nas telas que possuem esses recursos no contrato.
2. Remover o toggle `Apenas ativos`/`Ativos e inativos` da Busca de Membros.
3. Preservar o comportamento inicial de Membros: sem um filtro de situação
   explícito, a lista começa mostrando somente membros ativos.
4. Transferir a escolha de situação de Membros para `Filtrar`, incluindo as
   opções Ativos, Inativos e Ativos e inativos.
5. Manter filtros, campos e ordenações compatíveis com o contrato gerado,
   convertendo valores de transporte em rótulos portugueses na borda de
   apresentação.
6. Reiniciar a paginação quando a pesquisa, os filtros ou a ordenação mudarem.
7. Preservar estados de carregamento, vazio, erro, proibido e retry já
   existentes em cada tela.

## Fora de escopo

- Alterar rotas, permissões, contratos backend ou o arquivo gerado
  `src/api/generated/gam-api.ts`.
- Criar filtros que não sejam suportados pelo contrato público.
- Alterar cards, diálogos, cadastro, detalhes, lifecycle ou presença.
- Criar uma camada genérica de repositórios, serviços ou domínio.
- Expor identificadores, códigos de permissão ou enums sem apresentação
  traduzida.

## Decisão de arquitetura

Será criado um componente compartilhado em `src/components/` para a
experiência visual e interativa de busca. Ele receberá configuração declarativa
para:

- campo e rótulo da pesquisa rápida;
- campos filtráveis, operadores, tipos de entrada e opções traduzidas;
- campos ordenáveis;
- callback com filtros e critérios de ordenação normalizados.

Os adaptadores de cada feature continuarão em seus próprios diretórios. Eles
serão responsáveis por:

- transformar filtros e ordenações da barra em parâmetros do endpoint;
- validar campos e direções aceitos pelo contrato;
- manter filtros fixos, como `type = ORATORIO`;
- aplicar defaults de consulta que já existem, como ativos em Membros e a
  ordenação cronológica das listas de Eventos;
- mapear valores desconhecidos para uma apresentação neutra quando houver
  renderização.

O componente compartilhado não importará nenhuma feature. Os tipos de filtro
e ordenação compartilhados serão independentes de Membros, e o componente
continuará sendo uma composição de interface, não um cliente HTTP.

## Comportamento por tela

### Membros

- Pesquisa rápida: `name`, com busca automática após uma pequena pausa.
- Filtros: e-mail, telefone, data de nascimento e situação.
- Situação: Ativos, Inativos ou Ativos e inativos. A opção combinada será
  enviada como `IN [ACTIVE, INACTIVE]` na borda da API.
- Ordenação: data de nascimento, situação, primeiro nome e sobrenome, conforme
  os campos já aceitos pelo contrato.
- Estado inicial: sem filtro de situação explícito, a API acrescenta
  `status IN [ACTIVE]`.
- Remover completamente o estado React, a preferência em `localStorage` e as
  props relacionadas ao toggle da lista principal. A capacidade interna de
  incluir inativos em seletores de pessoas, como `MemberSearchPicker`, será
  preservada porque não é parte desta busca de gestão.

### Eventos

- Pesquisa rápida: título.
- Filtros: situação e tipo, com rótulos vindos de `presentation.ts`.
- Ordenação: título, início, término, tipo e situação, após validação dos
  campos permitidos pelo endpoint.
- Quando nenhuma ordenação for escolhida na interface, preservar a ordenação
  padrão atual por data de início decrescente.

### Contas

- Pesquisa rápida: nome de exibição.
- Filtro: e-mail, com a mesma semântica de conteúdo já aceita pela busca
  atual.
- Ordenação: e-mail, nome de exibição e data de criação, com validação na API
  da feature.
- Remover o select `Buscar por`; escolher e-mail passa a ser uma intenção de
  filtro, enquanto o caminho comum usa a pesquisa rápida por nome.

### Oratorianos

- Pesquisa rápida: nome.
- Ordenação: frequência anual somente quando selecionada e aceita pelo
  endpoint; o default continua sendo o definido pelo contrato.
- Não exibir filtros adicionais fictícios. Se não existir outro campo de
  filtro suportado, a barra mostra apenas os controles aplicáveis à consulta.

### Ocorrências

- Reutilizar a busca de Eventos com o filtro fixo `type = ORATORIO`.
- Pesquisa rápida: título do evento, usando o campo suportado pelo endpoint.
- Filtro: situação.
- Ordenação: campos aceitos para Eventos, mantendo a ordenação cronológica
  padrão da lista quando o usuário não escolher outra.

## Fluxo de dados

```text
barra compartilhada
  -> filtros e sorts da interface
  -> página da feature reinicia page = 0
  -> hook TanStack Query usa a consulta normalizada na query key
  -> API da feature valida e adapta para SearchDTO + query params
  -> cards preservam loading, error, forbidden, empty e paginação existentes
```

A pesquisa rápida usará o debounce que já existe em Membros. Filtros e
ordenação serão aplicados pelo mesmo callback, sem um botão adicional de
`Buscar`. Mudanças de página continuarão sendo controladas pela página e
permanecerão parte da query key.

## Acessibilidade e linguagem

- Todos os campos terão labels associados e os botões terão nomes acessíveis
  em português.
- Filtros e ordenação continuarão opcionais e não receberão marcador de
  obrigatoriedade.
- A barra manterá foco visível, controles de teclado e semântica de botão.
- Enums de situação e tipo serão exibidos por mapas tipados das features.
- Valores desconhecidos, nulos ou futuros usarão fallback neutro em português;
  não haverá fallback para o valor bruto.
- O layout continuará responsivo: a barra empilha no mobile e distribui os
  controles em telas maiores.

## Testes e critérios de aceitação

Serão adicionados ou ajustados testes focados para:

1. renderizar a barra compartilhada sem o toggle de Membros;
2. aplicar pesquisa rápida com debounce e reiniciar a página;
3. abrir/remover filtros, exibir contadores e traduzir opções;
4. aplicar e alternar direções de ordenação;
5. enviar o default de membros ativos e os três estados do filtro de situação;
6. serializar filters e sorts corretos para Events, Accounts, Oratorianos e
   Ocorrências;
7. manter o filtro fixo `ORATORIO` na consulta de Ocorrências;
8. preservar os estados assíncronos e a paginação das listas.

Critérios observáveis:

- Nenhuma das cinco telas apresenta o antigo formulário específico com botão
  `Buscar` quando a consulta usar a barra padronizada.
- A tela de Membros não exibe `Apenas ativos` nem `Ativos e inativos` como
  toggle, e ainda começa com ativos.
- O usuário consegue escolher a situação de Membros dentro de `Filtrar`.
- A pesquisa rápida, os filtros e a ordenação produzem consultas equivalentes
  aos campos aceitos pelo contrato.
- O padrão visual e os rótulos de ação são iguais entre as telas aplicáveis.
- Lint e build passam sem editar artefatos gerados.

## Impacto documental

Após a implementação, a documentação de arquitetura deverá deixar de afirmar
que `SearchAndFilter` é exclusivo de Membros e registrar a barra compartilhada
como composição cross-feature. A documentação deve manter separado o
comportamento atual já implementado do que ainda não for suportado pelo
contrato.
