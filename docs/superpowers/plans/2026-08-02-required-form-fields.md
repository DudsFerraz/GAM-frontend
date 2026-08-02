# Plano de implementação — indicadores de campos obrigatórios

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-08-02-required-form-fields-design.md` para resolver a issue #1 somente no frontend.

## Estratégia de entrega

A mudança será feita em duas camadas: primeiro a fundação compartilhada de rótulos, legenda e controle; depois a aplicação explícita da prop `required` nos campos que os schemas e as condições de negócio tornam obrigatórios. Buscas e filtros serão auditados, mas permanecerão sem marcador quando o vazio for válido.

## 1. Confirmar o baseline

Executar:

```sh
npm test
npm run lint
npm run build
```

Registrar falhas anteriores separadamente e não fazer limpeza fora do escopo.

## 2. Implementar a fundação compartilhada

Arquivos previstos:

- `src/components/ui/Form.tsx`
- `src/components/ui/Label.tsx`
- `src/components/ui/Form.test.tsx`

Tarefas:

1. Adicionar `required` ao contexto de `FormItem`, sem enviar essa prop como atributo indevido ao `div`.
2. Fazer `FormLabel` renderizar `*` decorativo e texto oculto `obrigatório` quando o contexto estiver marcado.
3. Criar `FormLegend` para grupos `fieldset`/`legend` com o mesmo comportamento visual e acessível.
4. Fazer `FormControl` propagar `required` e `aria-required` quando o campo for obrigatório, preservando `aria-invalid` e `aria-describedby`.
5. Permitir que `Label` reutilize o indicador em controles nativos fora de `FormField`, sem vazar a prop customizada para o Radix label.
6. Cobrir campo obrigatório, campo opcional, controle nativo e legenda de grupo com testes de DOM acessível.

## 3. Aplicar aos formulários de autenticação e gestão de pessoas

Arquivos previstos:

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/manage/members/components/RegisterMemberDialog.tsx`
- `src/features/manage/members/components/MemberDetailsDialog.tsx`
- `src/features/manage/oratorianos/components/RegisterOratorianoDialog.tsx`
- `src/features/manage/oratorianos/components/EditOratorianoDialog.tsx`
- `src/features/manage/oratorianos/components/DeleteOratorianoDialog.tsx`
- `src/features/manage/oratorios/components/QuickOratorianoRegistration.tsx`
- `src/features/manage/oratorianoForms/components/CreateOratorianoFormDialog.tsx`
- `src/features/manage/oratorianoForms/components/DeleteOratorianoFormDialog.tsx`
- testes existentes dessas superfícies quando a asserção observável for específica

Tarefas:

1. Marcar todos os campos de login e registro de Account.
2. Marcar conta, nome, sobrenome, nascimento, telefone e motivo no cadastro de Member.
3. Marcar motivos das transições de situação de Member.
4. Marcar nomes de registro/edição de Oratoriano e motivo de exclusão.
5. Marcar o motivo de correção somente quando o nome realmente mudar.
6. Marcar nomes do cadastro rápido e a origem obrigatória da ficha adicional usando `FormLegend` e radios nativos.
7. Marcar o motivo de exclusão de ficha adicional.
8. Adicionar `noValidate` aos formulários com validação explícita que passarem a usar `required`, preservando as mensagens Zod/RHF.
9. Garantir que a busca interna de conta e as buscas auxiliares dos seletores não sejam confundidas com a seleção obrigatória final.

## 4. Aplicar aos formulários de Events, Presences e Locations

Arquivos previstos:

- `src/features/manage/events/components/CreateEventDialog.tsx`
- `src/features/manage/events/components/EditEventDialog.tsx`
- `src/features/manage/events/components/EventManagementActions.tsx`
- `src/features/manage/events/components/RegisterPresenceDialog.tsx`
- `src/features/manage/events/components/EditPresenceDialog.tsx`
- `src/features/manage/events/components/RemovePresenceDialog.tsx`
- `src/features/manage/locations/components/LocationFormFields.tsx`
- `src/features/manage/locations/components/CreateLocationDialog.tsx`
- `src/features/manage/locations/components/EditLocationDialog.tsx`
- `src/features/manage/locations/components/RemoveLocationDialog.tsx`
- `src/features/manage/events/components/*.test.tsx` e testes focados novos, se necessários

Tarefas:

1. Marcar título, local, início e término no cadastro e edição de Event.
2. Manter descrição e público sem marcador quando o contrato aceitar vazio, preservando o valor padrão de público geral.
3. Marcar motivos de cancelamento, bloqueio, finalização, reabertura, remoção e alteração de público conforme cada schema.
4. Marcar a seleção de Member no registro de Presence quando o seletor composto for obrigatório e manter observações opcionais.
5. Marcar o motivo da remoção de Presence.
6. Marcar nome, cidade e estado nos formulários de Location; manter endereço, código postal e coordenadas opcionais.
7. Atualizar a obrigatoriedade do motivo de alteração de público de Event conforme a opção selecionada e o público original.
8. Manter labels de busca, filtros, status e tipo sem marcador.

## 5. Aplicar aos formulários de Solicitações e Oratórios

Arquivos previstos:

- `src/features/manage/solicitations/components/SubmitSolicitationDialog.tsx`
- `src/features/manage/solicitations/components/SolicitationDetailsDialog.tsx`
- `src/features/manage/oratorios/components/CreateOratorioDialog.tsx`
- `src/features/manage/oratorios/components/OratorioPlanningForm.tsx`
- `src/features/manage/oratorios/components/OratorioLifecycleActions.tsx`
- `src/features/manage/oratorios/components/AttendanceRemovalDialog.tsx`
- `src/features/manage/oratorios/components/OratorioTeamsSection.tsx`
- `src/features/manage/oratorios/components/AttendanceRoster.tsx`
- testes focados existentes ou novos

Tarefas:

1. Marcar todos os campos do envio de Solicitação e o motivo da decisão.
2. Marcar data de criação do Oratório.
3. Marcar os motivos de ciclo de vida e remoção, mantendo planejamento e buscas opcionais.
4. Manter as buscas de Member, presença e Oratoriano sem marcador.
5. Adicionar `noValidate` somente aos formulários de submissão com validação Zod/RHF.

## 6. Auditar a ficha adicional editável e superfícies não marcadas

Arquivos previstos para leitura e ajustes apenas se a regra efetiva exigir:

- `src/features/manage/oratorianoForms/components/OratorianoFormEditor.tsx`
- `src/features/manage/oratorianoForms/components/OratorianoFormStepFields.tsx`
- `src/features/manage/members/pages/ManageMembersPage.tsx`
- `src/features/manage/accounts/pages/ManageAccountsPage.tsx`
- `src/features/manage/events/pages/ManageEventsPage.tsx`
- `src/features/manage/oratorianos/pages/ManageOratorianosPage.tsx`
- `src/features/manage/oratorios/pages/ManageOratoriosPage.tsx`
- `src/features/manage/solicitations/pages/ManageSolicitationsPage.tsx`

Tarefas:

1. Confirmar que o editor de ficha continua permitindo salvar rascunho incompleto e, por isso, não recebe marcadores indevidos.
2. Confirmar que campos condicionais de conclusão não fazem parte da validação do salvamento atual; se não fizerem, não alterar sua apresentação.
3. Confirmar que todos os formulários de busca e filtro aceitam vazio e não exigem `required`.
4. Usar `rg` para garantir que nenhum `<FormItem>` obrigatório ficou sem a prop e que nenhum campo opcional foi marcado por engano.

## 7. Verificar e documentar

Arquivos previstos:

- `docs/architecture/overview.md`
- `docs/guides/development.md`
- `docs/guides/user-facing-language.md`
- `docs/README.md`, somente se o mapa de documentação precisar apontar a convenção

Tarefas:

1. Atualizar a documentação afetada para registrar o comportamento atual, sem apresentar a spec ou itens planejados como implementação.
2. Executar os testes focados e a suíte completa.
3. Executar `npm run lint`, `npm run build` e `git diff --check`.
4. Fazer revisão final contra os critérios de aceite da spec.
5. Corrigir achados críticos/importantes antes do handoff.

## 8. Commit e entrega

1. Criar o commit de implementação com uma mensagem que mencione a issue #1, por exemplo:

   `fix(forms): indicate required fields (closes #1)`

2. Entregar também um texto curto para o GitHub explicando que os formulários agora mostram `*` nos campos obrigatórios e expõem a semântica acessível sem alterar a validação ou os filtros opcionais.
