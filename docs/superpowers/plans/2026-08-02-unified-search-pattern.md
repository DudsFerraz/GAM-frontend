# Plano de implementação — padrão unificado de busca

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-08-02-unified-search-pattern-design.md`,
mantendo a mudança restrita às buscas do frontend.

## Estratégia de entrega

A implementação será feita em camadas pequenas:

1. criar a composição compartilhada da barra;
2. adaptar Membros sem quebrar o `MemberSearchPicker` interno;
3. adaptar Events e sua reutilização por Ocorrências;
4. adaptar Accounts;
5. adaptar Oratorianos;
6. atualizar documentação, executar verificações e revisar o diff.

Cada feature continuará convertendo a configuração visual para o contrato
gerado em seu próprio adaptador. O componente compartilhado não fará chamadas
HTTP e não conhecerá nenhuma feature.

## 1. Confirmar o baseline

Executar antes da implementação:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Registrar qualquer falha preexistente separadamente. Não alterar artefatos
gerados nem limpar mudanças que não pertençam à issue.

## 2. Criar a barra compartilhada

Arquivos previstos:

- `src/components/SearchAndFilter/SearchAndFilter.tsx`
- `src/components/SearchAndFilter/types.ts`
- `src/components/SearchAndFilter/index.ts`
- `src/components/SearchAndFilter/SearchAndFilter.test.tsx`
- remoção de `src/features/manage/members/components/SearchAndFilter/`

Tarefas:

1. Extrair o comportamento visual existente de Membros para `src/components/`
   sem importar tipos ou módulos de uma feature.
2. Usar a estrutura do contrato gerado para filtros e manter os valores
   `string | string[]`, permitindo o filtro combinado de situação de Membros.
3. Configurar pesquisa rápida, campos filtráveis, operadores, entradas de
   texto/data/select e campos ordenáveis por props declarativas.
4. Renderizar `Filtrar` somente quando houver campos filtráveis e `Ordenar`
   somente quando houver campos ordenáveis, mantendo o padrão comum quando os
   recursos existirem.
5. Preservar debounce de pesquisa rápida, contadores, chips, alternância de
   direção e ordenação por prioridade.
6. Adicionar `aria-expanded`, `aria-controls`, labels associadas, nomes
   acessíveis para remoção de filtros e `type="button"` nos controles.
7. Garantir que valores de opções sejam exibidos por suas opções traduzidas;
   usar fallback neutro para valor desconhecido em vez de renderizar o valor
   técnico.
8. Cobrir pesquisa, filtro, remoção, ordenação, arrays de valores e ausência
   de controles opcionais com testes de comportamento.

## 3. Adaptar a Busca de Membros

Arquivos previstos:

- `src/features/manage/members/pages/ManageMembersPage.tsx`
- `src/features/manage/members/api/searchMembers.ts`
- `src/features/manage/members/api/searchMembers.test.ts`
- `src/features/manage/members/hooks/useSearchMembers.ts`
- `src/features/manage/members/queryKeys.ts`
- `src/features/manage/members/types.ts`
- `src/features/manage/members/memberSearchConfig.ts`
- `src/features/manage/members/components/MemberSearchPicker.tsx`
- testes de página ou de configuração, se necessários

Tarefas:

1. Remover da página o estado, o efeito de persistência, a constante de
   `localStorage`, o callback e as props do toggle.
2. Usar a barra compartilhada com pesquisa rápida por nome, filtro de e-mail,
   telefone, nascimento e situação e ordenação já permitida.
3. Configurar Situação com Ativos, Inativos e Ativos e inativos; serializar a
   opção combinada como `IN [ACTIVE, INACTIVE]`.
4. Manter o default seguro de ativos na busca da lista quando não houver filtro
   explícito.
5. Preservar o parâmetro usado pelo `MemberSearchPicker` para incluir inativos
   em seletores internos autorizados; essa busca não deve receber ordenação da
   barra principal.
6. Atualizar tipos para aceitar valores de filtro escalares ou em lista sem
   expor DTOs duplicados.
7. Ajustar testes para provar default ativo, situação explícita, situação
   combinada e ausência do toggle na composição da página.

## 4. Adaptar Events e Ocorrências

Arquivos previstos:

- `src/features/manage/events/pages/ManageEventsPage.tsx`
- `src/features/manage/events/api/events.ts`
- `src/features/manage/events/api/events.test.ts`
- `src/features/manage/events/hooks/useEvents.ts`
- `src/features/manage/events/hooks/useEvents.test.tsx`
- `src/features/manage/events/queryKeys.ts`
- `src/features/manage/events/presentation.ts`
- `src/features/manage/oratorios/pages/ManageOratoriosPage.tsx`
- testes de página de Events e Oratórios, se necessários

Tarefas:

1. Substituir o formulário de título, selects e botão `Buscar` de Events pela
   barra compartilhada.
2. Mapear título como pesquisa rápida, situação e tipo como filtros e os campos
   aceitos pelo endpoint como ordenação.
3. Fazer `searchEvents` receber filtros e sorts normalizados, validar os campos
   e direções suportados e preservar `beginDate,desc` quando o usuário não
   escolheu ordenação.
4. Incluir filtros e sorts na query key e manter `keepPreviousData`, paginação,
   estados de autorização e diálogos existentes.
5. Adaptar Ocorrências à mesma barra, mantendo `type = ORATORIO` como filtro
   fixo e oferecendo situação, título e ordenações suportadas por Events.
6. Garantir que nenhuma ordenação escolhida pelo usuário remova o filtro fixo
   de Oratório ou altere a navegação especializada dos cards.
7. Cobrir a serialização de filtros, sorts, default cronológico e filtro fixo
   de Oratório em testes de API/hooks.

## 5. Adaptar Accounts

Arquivos previstos:

- `src/features/manage/accounts/pages/ManageAccountsPage.tsx`
- `src/features/manage/accounts/api/accounts.ts`
- `src/features/manage/accounts/api/accounts.test.ts`
- `src/features/manage/accounts/hooks/useAccountAdministration.ts`
- `src/features/manage/accounts/queryKeys.ts`
- testes da página, se necessários

Tarefas:

1. Remover o formulário específico, o select `Buscar por`, o `FormEvent` e o
   botão `Buscar`.
2. Usar nome de exibição como pesquisa rápida e e-mail como filtro adicional.
3. Aceitar ordenação por e-mail, nome de exibição e data de criação, validando
   os campos na API da feature.
4. Manter `displayName,asc` como default quando não houver ordenação escolhida.
5. Atualizar query keys e hook para incluir filtros e sorts sem perder os
   detalhes, papéis ou permissões dos cards/dialogs.
6. Preservar a normalização de papéis no limite da API.
7. Testar o payload de filtro, a serialização de sorts e a seleção de conta.

## 6. Adaptar Oratorianos

Arquivos previstos:

- `src/features/manage/oratorianos/pages/ManageOratorianosPage.tsx`
- `src/features/manage/oratorianos/api/oratorianos.ts`
- `src/features/manage/oratorianos/api/oratorianos.test.ts`
- `src/features/manage/oratorianos/hooks/useOratorianos.ts`
- `src/features/manage/oratorianos/hooks/useOratorianos.test.tsx`
- `src/features/manage/oratorianos/queryKeys.ts`
- testes da página, se necessários

Tarefas:

1. Substituir o formulário de nome e botão `Buscar` pela pesquisa rápida da
   barra compartilhada.
2. Manter o filtro de nome no endpoint e não inventar filtros adicionais que o
   contrato não suporte.
3. Exibir ordenação por frequência anual somente quando configurada e aceita
   pelo endpoint; preservar o default do backend sem sort explícito.
4. Atualizar query key, hook e API para refletir filtros e sorts.
5. Preservar notices, cadastro, navegação de perfil, paginação e estados de
   erro/proibição.
6. Testar busca por nome, ordenação opcional e ausência de filtros fictícios.

## 7. Atualizar documentação da arquitetura

Arquivos previstos:

- `docs/architecture/overview.md`
- `docs/superpowers/specs/2026-08-02-unified-search-pattern-design.md`
- `docs/superpowers/plans/2026-08-02-unified-search-pattern.md`

Tarefas:

1. Substituir a afirmação de que `SearchAndFilter` é exclusivo de Membros por
   sua nova responsabilidade cross-feature.
2. Atualizar a descrição atual das cinco listagens para mencionar o padrão
   compartilhado e o default de ativos de Membros.
3. Manter claramente separados os recursos implementados dos filtros que o
   contrato não oferece.
4. Não editar `src/api/generated/gam-api.ts` nem `src/routeTree.gen.ts`.

## 8. Verificação final

Executar:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Depois revisar:

1. `rg` por `Apenas ativos`, `Ativos e inativos`, os formulários antigos e o
   `SearchAndFilter` antigo para confirmar que só permaneceram ocorrências
   internas justificadas, como documentação histórica ou selector de pessoa.
2. O diff para garantir que não há DTOs duplicados, valores técnicos na UI,
   chamadas absolutas, alterações em artefatos gerados ou mudanças fora do
   escopo.
3. Os critérios de aceitação da especificação, incluindo mobile, teclado,
   loading, vazio, erro, forbidden, retry e paginação.

## 9. Commits sugeridos

Os commits serão executados pelo usuário. A separação proposta é:

1. `docs(search): specify the unified search pattern`
2. `refactor(search): extract shared search and filter toolbar`
3. `fix(members): move status selection into member filters`
4. `fix(events): standardize event and occurrence search`
5. `fix(accounts): standardize account search`
6. `fix(oratorianos): standardize oratoriano search`
7. `docs(search): document the shared search behavior`

Cada commit deve conter somente os arquivos da etapa correspondente. Os
comandos exatos de `git add` serão montados após o diff final, quando a lista
real de arquivos alterados estiver confirmada.
