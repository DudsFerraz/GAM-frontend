# Plano de implementação — núcleo operacional de Oratório

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-07-26-oratorio-operational-core-design.md`, sem
incluir fichas adicionais, gestão de Coordenadores do Oratório ou
exclusão/restauração de Oratorianos.

## Estratégia de entrega

Cada bloco começa pelas fronteiras observáveis — tipos gerados, transporte,
regras puras ou schema — e termina com testes focados. As páginas entram somente
depois de suas operações e regras estarem protegidas.

## 1. Confirmar o baseline

Executar:

```sh
npm test
npm run lint
npm run build
```

Registrar qualquer falha anterior às mudanças separadamente. Não alterar código
para limpar problemas fora do escopo.

## 2. Preparar fronteiras compartilhadas mínimas

Arquivos afetados:

- `src/features/manage/events/index.ts`
- `src/features/manage/events/pages/ManageEventsPage.tsx`
- `src/lib/http/errors.ts`
- testes correspondentes

Tarefas:

1. Expor somente os tipos e hooks de Events necessários à lista especializada,
   preservando a query key existente.
2. Adicionar mensagens seguras para os códigos de erro de Oratório e
   Oratorianos.
3. Permitir que cards `ORATORIO` abram o detalhe especializado quando a conta
   possuir a capacidade correspondente, sem mudar o fluxo de Events genéricos.
4. Cobrir o roteamento do card e os novos erros com testes focados.

## 3. Criar a fundação do feature de Oratórios

Novos arquivos previstos:

- `src/features/manage/oratorios/api/oratorios.ts`
- `src/features/manage/oratorios/api/oratorios.test.ts`
- `src/features/manage/oratorios/queryKeys.ts`
- `src/features/manage/oratorios/presentation.ts`
- `src/features/manage/oratorios/presentation.test.ts`
- `src/features/manage/oratorios/oratorioManagement.ts`
- `src/features/manage/oratorios/oratorioManagement.test.ts`
- `src/features/manage/oratorios/attendanceRules.ts`
- `src/features/manage/oratorios/attendanceRules.test.ts`
- `src/features/manage/oratorios/schemas/oratorioSchemas.ts`
- `src/features/manage/oratorios/schemas/oratorioSchemas.test.ts`
- `src/features/manage/oratorios/hooks/useOratorios.ts`
- `src/features/manage/oratorios/index.ts`

Tarefas:

1. Criar aliases dos schemas gerados para ocorrência, planejamento, equipe,
   roster, resumo e presença.
2. Implementar as operações especializadas:
   - criar e ler;
   - substituir planejamento;
   - atribuir/remover membro de equipe;
   - bloquear, finalizar, cancelar, reabrir e excluir;
   - ler os dois rosters e o resumo;
   - marcar/desmarcar Membro e Oratoriano;
   - cadastrar e marcar Oratoriano.
3. Tipar respostas `204` como `void` e corpo opcional de remoção sem inventar
   respostas.
4. Criar query keys estáveis e hooks com invalidação de Event e Oratório.
5. Mapear equipe, programação e estados inesperados para português seguro.
6. Implementar regras puras para:
   - ações por situação;
   - planejamento editável;
   - janela das 13h30 em `America/Sao_Paulo`;
   - marcar/desmarcar por situação;
   - necessidade de motivo;
   - equivalência humana de nomes.
7. Criar schemas de data, planejamento e motivo com todas as mensagens em
   português.

## 4. Entregar a área, lista e criação de Oratórios

Novos arquivos previstos:

- `src/features/manage/oratorios/components/OratorioAreaLayout.tsx`
- `src/features/manage/oratorios/components/CreateOratorioDialog.tsx`
- `src/features/manage/oratorios/pages/ManageOratoriosPage.tsx`
- testes de componentes relevantes
- rotas sob `src/routes/_authenticated/manage/oratorios*`

Arquivos afetados:

- `src/app/shell/SideNavigation.tsx`

Tarefas:

1. Adicionar a entrada `Oratório`, visível quando ao menos uma seção da área for
   consultável e com destino compatível com as capacidades atuais.
2. Criar navegação interna entre `Ocorrências` e `Oratorianos`.
3. Reutilizar `useEvents` com título vazio, tipo fixo `ORATORIO`, situação e
   paginação.
4. Renderizar cards orientados à data local de São Paulo.
5. Implementar o diálogo de data única e navegar para o detalhe retornado.
6. Cobrir loading, vazio, erro, forbidden, retry, paginação e permissões.
7. Deixar a geração de `src/routeTree.gen.ts` a cargo do plugin do router.

## 5. Entregar o detalhe, planejamento e ciclo

Novos arquivos previstos:

- `src/features/manage/oratorios/components/OratorioSchedule.tsx`
- `src/features/manage/oratorios/components/OratorioPlanningForm.tsx`
- `src/features/manage/oratorios/components/OratorioLifecycleActions.tsx`
- `src/features/manage/oratorios/pages/OratorioDetailPage.tsx`
- diálogos feature-locais de motivo/confirmação
- testes correspondentes

Tarefas:

1. Compor cabeçalho, data, horário, local e situação.
2. Renderizar a programação fixa por mapeamento seguro, nunca pelo texto cru do
   backend.
3. Implementar a substituição integral dos quatro textos.
4. Expor somente as ações aceitas pela situação.
5. Coletar motivo para cancelar, reabrir e excluir.
6. Refazer detalhe e listas após respostas `204`.
7. Manter o botão do tracker visível somente sob leitura de presença.

## 6. Entregar equipes

Novos arquivos previstos:

- `src/features/manage/oratorios/components/OratorioTeamsSection.tsx`
- `src/features/manage/oratorios/components/OratorioTeamCard.tsx`
- `src/features/manage/oratorios/components/OratorioMemberPicker.tsx`
- testes correspondentes

Tarefas:

1. Exibir exatamente quatro equipes, inclusive vazias.
2. Indicar membros atualmente inativos sem remover atribuições históricas.
3. Pesquisar membros ativos pelo roster especializado.
4. Excluir resultados já atribuídos à equipe atual.
5. Persistir atribuição e remoção idempotentes.
6. Desabilitar o seletor quando a combinação de leitura necessária não estiver
   disponível; nunca pedir UUID.

## 7. Entregar o tracker

Novos arquivos previstos:

- `src/features/manage/oratorios/components/AttendanceTabs.tsx`
- `src/features/manage/oratorios/components/AttendanceRoster.tsx`
- `src/features/manage/oratorios/components/AttendanceRow.tsx`
- `src/features/manage/oratorios/components/PresentSummary.tsx`
- `src/features/manage/oratorios/components/AttendanceRemovalDialog.tsx`
- `src/features/manage/oratorios/components/QuickOratorianoRegistration.tsx`
- `src/features/manage/oratorios/pages/OratorioAttendancePage.tsx`
- testes correspondentes

Tarefas:

1. Carregar os dois rosters e `/present` em paralelo.
2. Manter busca e página independentes por aba.
3. Exibir o resumo `sticky` no notebook e em diálogo acionado por barra
   persistente no celular.
4. Persistir cada checkbox imediatamente e manter pending por pessoa.
5. Atualizar cache conhecido e sempre reconciliar roster e resumo.
6. Abrir motivo somente para remoção em `COMPLETED`.
7. Respeitar janela, situações fechadas e remoção limitada em `CANCELLED`.
8. Implementar cadastro rápido com:
   - orientação de nome completo;
   - busca obrigatória;
   - semelhantes visíveis;
   - bloqueio por correspondência humana exata;
   - escolha explícita de cadastro existente;
   - confirmação da criação atômica.
9. Cobrir concorrência/falha refazendo as consultas autoritativas.

## 8. Criar a fundação do feature de Oratorianos

Novos arquivos previstos:

- `src/features/manage/oratorianos/api/oratorianos.ts`
- `src/features/manage/oratorianos/api/oratorianos.test.ts`
- `src/features/manage/oratorianos/queryKeys.ts`
- `src/features/manage/oratorianos/presentation.ts`
- `src/features/manage/oratorianos/presentation.test.ts`
- `src/features/manage/oratorianos/schemas/oratorianoSchemas.ts`
- `src/features/manage/oratorianos/schemas/oratorianoSchemas.test.ts`
- `src/features/manage/oratorianos/hooks/useOratorianos.ts`
- `src/features/manage/oratorianos/index.ts`

Tarefas:

1. Implementar cadastro, busca por `name LIKE`, detalhe, substituição integral,
   histórico e resumo.
2. Criar schemas alinhados a `GamName`:
   - 2 letras por componente;
   - 32/64 caracteres;
   - letras Unicode e separadores internos simples;
   - rejeição de whitespace externo/repetido.
3. Aceitar nascimento opcional e impedir data futura em São Paulo.
4. Aceitar telefone opcional brasileiro local ou internacional explícito sem
   impor a máscara exclusiva de Solicitações.
5. Exigir motivo somente quando o `GamName` mudar.
6. Manter contagens como dados informativos e mapear situação do histórico com
   fallback seguro.

## 9. Entregar lista, cadastro e perfil de Oratorianos

Novos arquivos previstos:

- `src/features/manage/oratorianos/components/OratorianoNameFields.tsx`
- `src/features/manage/oratorianos/components/RegisterOratorianoDialog.tsx`
- `src/features/manage/oratorianos/components/EditOratorianoDialog.tsx`
- `src/features/manage/oratorianos/components/OratorianoAttendanceSummary.tsx`
- `src/features/manage/oratorianos/components/OratorianoAttendanceHistory.tsx`
- `src/features/manage/oratorianos/pages/ManageOratorianosPage.tsx`
- `src/features/manage/oratorianos/pages/OratorianoDetailPage.tsx`
- rotas correspondentes
- testes de comportamento relevantes

Tarefas:

1. Buscar por nome com submissão explícita e paginação.
2. Cadastrar somente nome e sobrenome e abrir o perfil criado.
3. Carregar perfil, resumo e histórico em paralelo.
4. Permitir seleção de ano e mês sem linguagem de ranking.
5. Mostrar motivo de edição somente após mudança do nome.
6. Manter exclusão, restauração e fichas completamente ausentes.
7. Lidar deliberadamente com todos os estados assíncronos e permissões.

## 10. Integrar, documentar e validar

Arquivos afetados:

- `docs/README.md`
- `docs/architecture/overview.md`
- `docs/integration/api.md`
- `docs/guides/user-facing-language.md`
- `docs/backlog/steps.md`

Tarefas:

1. Registrar somente o comportamento realmente implementado.
2. Separar o núcleo atual de fichas, coordenadores e restauração ainda
   planejados.
3. Executar testes focados durante cada bloco.
4. Ao final, executar:

```sh
npm test
npm run lint
npm run build
```

5. Verificar `git diff --check`.
6. Conferir manualmente celular/notebook, claro/escuro, teclado, foco e ações
   rápidas.
7. Fazer revisão final de código contra a especificação e corrigir achados antes
   do handoff.
