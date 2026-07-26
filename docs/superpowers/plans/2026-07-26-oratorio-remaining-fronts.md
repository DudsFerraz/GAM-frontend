# Plano de implementação — frentes remanescentes do Oratório

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-07-26-oratorio-remaining-fronts-design.md`.

O escopo contém:

1. gestão da designação de Coordenadores do Oratório;
2. exclusão de Oratorianos; e
3. fichas adicionais, snapshots, PDFs e anexos assinados.

Restauração de Oratorianos permanece completamente fora do plano.

## Estratégia

As entregas serão fatias verticais pequenas. Cada bloco começa por contrato,
regras ou schema, acrescenta hooks e interface e termina com testes focados.

Gestão da designação e exclusão podem ser entregues com o contrato atual. As
fichas avançam somente até o limite suportado pelo contrato regenerado; não
serão criadas rotas ou DTOs frontend para contornar lacunas backend-owned.

## Direção visual

A implementação preservará a identidade atual, sem novos tokens ou fontes:

| Papel | Claro | Escuro |
| --- | --- | --- |
| Canvas | `#ffffff` | `#040b29` |
| Texto | `#0f172a` | `#f8fafc` |
| Ação | `#2563eb` | `#3b82f6` |
| Oratório | `#06b6d4` | `#22d3ee` |
| Destrutivo | `#dc2626` | `#ef4444` |
| Divisa | `#e2e8f0` | `#1e293b` |

`font-heading` e `font-sans` continuarão semanticamente separados e usando a
família de sistema já aceita. Títulos usam peso forte; texto operacional usa
peso regular; labels e estados usam peso médio.

A assinatura visual da frente de fichas será uma linha de prontidão baseada no
ciclo real `Rascunho → PDF → Anexo → Conclusão`. Ela será informativa, não
decorativa, e não substituirá títulos, estados ou mensagens acessíveis.

## 1. Confirmar o baseline

Executar em paralelo quando possível:

```sh
npm test
npm run lint
npm run build
```

Registrar falhas anteriores separadamente. Não fazer limpeza fora do escopo.

## 2. Implementar o transporte da Coordenação do Oratório

Novos arquivos:

- `src/features/manage/members/api/updateMemberOratorioCoordinator.ts`
- `src/features/manage/members/api/updateMemberOratorioCoordinator.test.ts`
- `src/features/manage/members/hooks/useUpdateMemberOratorioCoordinator.ts`

Arquivo afetado:

- `src/features/manage/members/index.ts`

Tarefas:

1. Usar `CoordinatorTransitionDTO` do contrato gerado.
2. Implementar:
   - `PATCH /members/{memberId}/oratorio-coordinator/grant`;
   - `PATCH /members/{memberId}/oratorio-coordinator/revoke`.
3. Tipar as respostas `204` como `Promise<void>`.
4. Invalidar o limite canônico de Member após sucesso.
5. Testar método, rota, corpo e as duas ações.
6. Exportar somente o mutation hook necessário à feature de Accounts.

## 3. Entregar a gestão no diálogo de Account

Novos arquivos previstos:

- `src/features/manage/accounts/components/AccountOratorioCoordinatorTransitionSection.tsx`
- `src/features/manage/accounts/components/AccountOratorioCoordinatorTransitionSection.test.tsx`

Arquivos afetados:

- `src/features/manage/accounts/components/AccountDetailsDialog.tsx`
- `src/features/manage/accounts/pages/ManageAccountsPage.tsx`

Tarefas:

1. Calcular `canManageOratorioCoordinators` somente por
   `ORATORIO_COORD_MANAGE`.
2. Usar os papéis já carregados para determinar:
   - presença de `ORATORIO_COORD`;
   - projeção de Member ativo com `MEMBER` e sem `VISITOR`.
3. Resolver o Member internamente pelo e-mail da Account.
4. Renderizar estados distintos para:
   - vínculo sendo verificado;
   - Account sem e-mail;
   - Member não localizado;
   - Member inativo;
   - projeção inconsistente;
   - erro com retry.
5. Oferecer concessão ou remoção conforme o papel autoritativo.
6. Exigir motivo de 1 a 2.000 caracteres com mensagens em português.
7. Invalidar papéis e busca de Accounts após sucesso.
8. Não usar `ACCOUNT_ROLE_MANAGE`, `MEMBER_ACTIVATION` ou edição genérica de
   papéis como autoridade.
9. Cobrir permissões, decisão da ação, payload, sucesso e falha em testes.

## 4. Adicionar transporte, schema e hook de exclusão

Arquivos afetados:

- `src/features/manage/oratorianos/api/oratorianos.ts`
- `src/features/manage/oratorianos/api/oratorianos.test.ts`
- `src/features/manage/oratorianos/hooks/useOratorianos.ts`
- `src/features/manage/oratorianos/queryKeys.ts`
- `src/features/manage/oratorianos/schemas/oratorianoSchemas.ts`
- `src/features/manage/oratorianos/schemas/oratorianoSchemas.test.ts`

Tarefas:

1. Adicionar alias de `ReasonDTO`.
2. Implementar `DELETE /oratorianos/{oratorianoId}` com corpo `{ reason }`.
3. Criar schema de motivo obrigatório com limite de 2.000 caracteres.
4. Criar `useDeleteOratoriano`.
5. Após sucesso:
   - invalidar listas de Oratorianos;
   - invalidar o limite raiz de Oratórios para reconciliar trackers;
   - remover o detalhe e subqueries do Oratoriano excluído depois da
     navegação.
6. Evitar refetch do detalhe excluído enquanto a rota ainda estiver montada.
7. Testar transporte, schema e invalidações.

## 5. Entregar a exclusão no perfil

Novos arquivos previstos:

- `src/features/manage/oratorianos/components/DeleteOratorianoDialog.tsx`
- `src/features/manage/oratorianos/components/DeleteOratorianoDialog.test.tsx`

Arquivos afetados:

- `src/features/manage/oratorianos/pages/OratorianoDetailPage.tsx`
- `src/features/manage/oratorianos/pages/ManageOratorianosPage.tsx`
- `src/routes/_authenticated/manage/oratorios.oratorianos.tsx`
- `src/lib/http/errors.ts`
- `src/lib/http/errors.test.ts`

Tarefas:

1. Mostrar `Excluir cadastro` somente com `ORATORIANO_MANAGE`.
2. Explicar no diálogo:
   - preservação das presenças;
   - remoção atômica dos rascunhos e artefatos;
   - bloqueio por versões imutáveis.
3. Exigir confirmação e motivo.
4. Manter o diálogo aberto e acionável em falha.
5. Após sucesso, navegar para a lista e mostrar uma confirmação descartável.
6. Remover o sinal de sucesso da URL após ser consumido ou dispensado.
7. Mapear `ORATORIANO_HAS_IMMUTABLE_FORMS`.
8. Retirar orientação de restauração das mensagens
   `ORATORIANO_DELETED` e `ORATORIANO_NAME_RESERVED`.
9. Não introduzir lista, comando, texto ou abstração de restauração.
10. Cobrir permissão, foco, validação, erro, sucesso e navegação em testes.
11. Deixar `src/routeTree.gen.ts` ser regenerado pelo plugin.

## 6. Validar as duas primeiras fatias

Executar:

```sh
npm test -- \
  src/features/manage/members \
  src/features/manage/accounts \
  src/features/manage/oratorianos \
  src/lib/http
npm run lint
npm run build
git diff --check
```

Revisar manualmente:

- diálogo de Account em claro/escuro e celular/notebook;
- concessão e remoção;
- Member inativo ou ausente;
- diálogo destrutivo por teclado;
- confirmação de exclusão na lista;
- ausência de restauração.

## 7. Aplicar o gate de contrato das fichas

Reinspecionar `src/api/generated/gam-api.ts` antes de criar adapters de fichas.

O bloco só avança integralmente quando o contrato gerado oferecer:

1. leitura dos metadados dos anexos existentes, com seus identificadores;
2. leitura dos snapshots existentes, com seus identificadores e revisão;
3. `FormRDTO.data` tipado como o dado estruturado da ficha;
4. referências de atores com nome apresentável.

Se algum item ainda estiver ausente:

- registrar a lacuna em `docs/integration/api.md`;
- não inventar rota, DTO ou identificador;
- manter indisponível a jornada dependente;
- continuar somente em trabalho que compile contra o contrato publicado.

Depois da evolução backend-owned, regenerar o artefato pelo workflow aceito e
verificar o diff gerado sem editá-lo manualmente.

## 8. Criar a fundação da feature de fichas

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/api/oratorianoForms.ts`
- `src/features/manage/oratorianoForms/api/oratorianoForms.test.ts`
- `src/features/manage/oratorianoForms/queryKeys.ts`
- `src/features/manage/oratorianoForms/presentation.ts`
- `src/features/manage/oratorianoForms/presentation.test.ts`
- `src/features/manage/oratorianoForms/types.ts`
- `src/features/manage/oratorianoForms/hooks/useOratorianoForms.ts`
- `src/features/manage/oratorianoForms/index.ts`

Tarefas:

1. Criar aliases dos schemas gerados para:
   - histórico e página;
   - detalhe e rascunho;
   - criação;
   - snapshot;
   - anexo;
   - conclusão;
   - motivo.
2. Implementar todas as operações de ficha com resource-relative paths.
3. Usar `responseType: "blob"` para PDF e anexos.
4. Construir `FormData` com `files` na ordem escolhida.
5. Criar query keys separadas para histórico, detalhe sensível, snapshots e
   anexos.
6. Desabilitar prefetch e background refetch do detalhe sensível.
7. Remover o detalhe sensível do cache ao sair da página.
8. Mapear situação, origem, relacionamento e respostas de saúde com fallback
   neutro.
9. Testar todos os limites de transporte e apresentação.

## 9. Entregar histórico e detalhe read-only

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/components/OratorianoFormsSection.tsx`
- `src/features/manage/oratorianoForms/components/OratorianoFormHistoryCard.tsx`
- `src/features/manage/oratorianoForms/pages/OratorianoFormPage.tsx`
- rota sob `src/routes/_authenticated/manage/oratorios.oratorianos_*`
- testes correspondentes

Arquivo afetado:

- `src/features/manage/oratorianos/pages/OratorianoDetailPage.tsx`

Tarefas:

1. Carregar histórico somente com `ORATORIANO_FORM_GET`.
2. Mostrar somente metadados aceitos e nomes business-facing dos atores.
3. Paginar sem carregar detalhe sensível.
4. Abrir o detalhe apenas por ação explícita.
5. Renderizar versões imutáveis como read-only.
6. Deliberar loading, empty, error, forbidden e retry por seção.
7. Não expor `Nova ficha` antes do editor estar funcional.

## 10. Entregar criação, editor e rascunho

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/components/CreateOratorianoFormDialog.tsx`
- `src/features/manage/oratorianoForms/components/OratorianoFormEditor.tsx`
- componentes feature-local por etapa
- `src/features/manage/oratorianoForms/schemas/oratorianoFormDraftSchema.ts`
- `src/features/manage/oratorianoForms/schemas/oratorianoFormCompletionSchema.ts`
- testes correspondentes

Tarefas:

1. Oferecer exatamente as duas origens aceitas.
2. Navegar ao editor após criar e semear o cache recebido.
3. Manter um único React Hook Form com estado completo.
4. Implementar as cinco etapas aprovadas.
5. Salvar explicitamente por substituição integral.
6. Avisar ao sair com alterações não salvas.
7. Validar e estreitar `data` antes de preencher o formulário.
8. Implementar schema parcial e schema completo.
9. Implementar todas as regras condicionais de idade, responsável, família,
   saúde, declarações e assinatura.
10. Implementar exclusão de rascunho com motivo e retorno ao histórico.
11. Cobrir navegação, foco e resumo acessível de erros.

## 11. Entregar a linha de prontidão, snapshots e PDFs

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/components/FormReadiness.tsx`
- `src/features/manage/oratorianoForms/components/FormPrintSection.tsx`
- helpers feature-local de download
- testes correspondentes

Tarefas:

1. Apresentar `Rascunho → PDF → Anexo → Conclusão` com estado real.
2. Criar snapshot por ação explícita.
3. Comparar `draftRevision` para a entrada direta.
4. Respeitar a validade do snapshot em branco da transcrição de papel.
5. Renderizar e baixar o PDF autenticado.
6. Criar filename business-facing sem UUID.
7. Revogar imediatamente a object URL.
8. Não armazenar bytes no Query cache.

## 12. Entregar anexos assinados

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/components/FormAttachmentsSection.tsx`
- `src/features/manage/oratorianoForms/attachmentRules.ts`
- `src/features/manage/oratorianoForms/attachmentRules.test.ts`
- testes de componente e adapter

Tarefas:

1. Aceitar um PDF ou uma coleção ordenada de imagens.
2. Validar os limites aprovados antes do upload.
3. Oferecer ordenação por controles de teclado.
4. Confirmar a substituição de uma coleção existente.
5. Enviar a coleção integral em ordem.
6. Descartar objetos `File` após sucesso.
7. Listar e baixar anexos históricos por ação explícita.
8. Sanitizar filename sem perder o conteúdo business-authored.
9. Reconciliar detalhe e histórico.

## 13. Entregar conclusão e revogação

Novos arquivos previstos:

- `src/features/manage/oratorianoForms/components/CompleteFormDialog.tsx`
- `src/features/manage/oratorianoForms/components/RevokeFormDialog.tsx`
- testes correspondentes

Arquivos afetados:

- `src/lib/http/errors.ts`
- `src/lib/http/errors.test.ts`

Tarefas:

1. Bloquear conclusão com alterações não salvas ou prontidão incompleta.
2. Executar o schema completo antes do comando.
3. Enviar primeiro sem sobrescrita.
4. Tratar `ORATORIANO_FORM_PROFILE_OVERWRITE_CHOICE_REQUIRED` com uma segunda
   confirmação.
5. Tratar `ORATORIANO_FORM_PROFILE_SOURCE_IS_NEWER` como bloqueio.
6. Tornar a ficha read-only depois da conclusão.
7. Invalidar histórico, detalhe, perfil, lista e trackers.
8. Revogar somente a versão concluída atual, com motivo.
9. Explicar que revogação não desfaz o perfil sincronizado.
10. Mapear todos os conflitos aprovados para português seguro.

## 14. Integrar documentação e concluir

Arquivos afetados:

- `docs/README.md`
- `docs/architecture/overview.md`
- `docs/integration/api.md`
- `docs/guides/user-facing-language.md`
- `docs/backlog/steps.md`

Tarefas:

1. Registrar somente o comportamento realmente implementado.
2. Manter dependências de contrato como pendentes até sua publicação.
3. Atualizar o inventário de linguagem para designação, exclusão e fichas.
4. Executar:

```sh
npm test
npm run lint
npm run build
git diff --check
```

5. Verificar upload e download manualmente com o backend real quando
   disponível.
6. Revisar responsividade, temas, teclado, foco e estados assíncronos.
7. Fazer revisão de código contra a especificação e corrigir todos os achados
   importantes antes do handoff.
