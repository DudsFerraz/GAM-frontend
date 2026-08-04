# Plano de implementação — remoção das janelas de registro de presenças

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-08-04-attendance-registration-window-removal-design.md`.
O comportamento deve seguir o issue [#8](https://github.com/DudsFerraz/GAM-frontend/issues/8),
o commit backend
[6d8064b](https://github.com/DudsFerraz/GAM-backend-API/commit/6d8064bf8e4403e9755b86e6386fc60cf9bd2ac6)
e as regras aceitas `REQ-PRESENCE-017` e `REQ-ORATORIO-ATT-012`.

## Estratégia de entrega

Alterar primeiro as regras puras e seus testes, depois remover o relógio obsoleto
da seção de presenças e, por fim, atualizar a documentação de comportamento
atual. Os endpoints, as permissões, os componentes de diálogo, o contrato
gerado e as mutações do Oratório não serão modificados.

## 1. Confirmar o baseline

Executar antes de editar código:

```sh
npm test
npm run lint
npm run build
```

Registrar cada falha anterior separadamente. Não corrigir problemas fora do
fluxo de presenças como parte deste issue.

## 2. Tornar a disponibilidade comum dependente da situação

Arquivos:

- `src/features/manage/events/presenceManagement.ts`
- `src/features/manage/events/presenceManagement.test.ts`

Tarefas:

1. Remover o estado `before-window` e a mensagem que orienta aguardar a abertura
   de uma janela.
2. Remover de `getPresenceRegistrationAvailability` e
   `canRegisterPresence` o instante de avaliação e qualquer comparação com
   `beginDate` ou `endDate`.
3. Manter somente a classificação de ciclo de vida:
   - `SCHEDULED` e `COMPLETED` retornam disponibilidade;
   - `CANCELLED`, `LOCKED` e `FINALIZED` retornam `closed-status` com as
     mensagens portuguesas existentes;
   - situação ausente ou desconhecida retorna `unavailable`.
4. Não exigir `event.type` ou `event.beginDate` para uma situação aberta, pois
   nenhum desses campos participa mais da elegibilidade temporal.
5. Atualizar os testes para cobrir um evento agendado muito antes do início,
   um evento concluído muito depois do fim, situações fechadas e dados de
   situação insuficientes. Confirmar que `before-window` e suas mensagens não
   fazem mais parte do resultado.
6. Preservar `canChangePresence`: registros existentes continuam editáveis ou
   removíveis nas situações aceitas pelo contrato de correção.

## 3. Remover o relógio do registro comum

Arquivos:

- `src/features/manage/events/components/EventPresencesSection.tsx`
- `src/features/manage/events/components/EventPresencesSection.test.tsx`

Tarefas:

1. Remover o estado `presenceEvaluationInstant`, o `useEffect` e o intervalo de
   trinta segundos usados somente para esperar a janela de registro.
2. Chamar a regra de disponibilidade apenas com o `event`.
3. Manter o botão condicionado a `canRegisterPresences`, habilitado para
   `SCHEDULED`/`COMPLETED` e desabilitado com feedback para estados fechados ou
   dados indisponíveis.
4. Não alterar a abertura do `RegisterPresenceDialog`, a seleção de Member,
   as permissões ou o feedback de mutação.
5. Adicionar um teste de componente que renderize um evento `SCHEDULED` futuro
   com `canRegisterPresences` e verifique que `Registrar presença` está
   habilitado e que a mensagem de janela futura não aparece.

## 4. Remover somente a janela de abertura do tracker do Oratório

Arquivos:

- `src/features/manage/oratorios/attendanceRules.ts`
- `src/features/manage/oratorios/attendanceRules.test.ts`

Consumidores que devem ser verificados sem duplicar regra:

- `src/features/manage/oratorios/pages/OratorioAttendancePage.tsx`
- `src/features/manage/oratorios/components/AttendanceRoster.tsx`
- `src/features/manage/oratorios/components/QuickOratorianoRegistration.tsx`

Tarefas:

1. Preservar `getEffectiveOratorioStatus` e a atualização baseada em `endDate`,
   pois ela continua determinando quando uma ocorrência passa a exigir motivo
   para correção.
2. Remover a validação de `beginDate`, o `openingInstant` e a mensagem sobre
   abertura às 13h30.
3. Fazer uma ocorrência efetivamente `SCHEDULED` retornar `canMark: true`,
   `canUncheck: true`, `removalReasonRequired: false` e `message: null`.
4. Preservar a regra de `COMPLETED` com motivo obrigatório para remoção,
   `CANCELLED` com remoção sem motivo e sem novas marcações, e `LOCKED`/
   `FINALIZED` sem alterações.
5. Atualizar os testes de regra para uma ocorrência com início futuro antes da
   antiga janela, uma ocorrência concluída avaliada depois do término e todos
   os estados fechados. Manter os testes de transição para `COMPLETED` e de
   motivo obrigatório.
6. Confirmar nos componentes existentes que o mesmo `availability` continua
   habilitando os dois rosters, a marcação imediata e o cadastro rápido; não
   introduzir uma condição paralela em nenhum deles.

## 5. Atualizar a documentação de comportamento atual

Arquivos:

- `docs/architecture/overview.md`
- `docs/integration/api.md`
- `docs/backlog/steps.md`

Tarefas:

1. Substituir a descrição de “janela de presença por tipo de evento” por
   elegibilidade baseada em situação: `SCHEDULED`/`COMPLETED` aceitam registro
   sem fronteira de relógio.
2. Registrar que o tracker do Oratório mantém o fechamento efetivo e a política
   de motivo, mas não possui mais a abertura antecipada de trinta minutos.
3. Manter explícita a separação entre comportamento atual e requisitos futuros.
4. Não editar `src/api/generated/gam-api.ts` nem duplicar a documentação do
   backend.

## 6. Verificação focada

Executar primeiro os testes diretamente afetados:

```sh
npm test -- \
  src/features/manage/events/presenceManagement.test.ts \
  src/features/manage/events/components/EventPresencesSection.test.tsx \
  src/features/manage/oratorios/attendanceRules.test.ts
```

Confirmar especialmente:

- evento `SCHEDULED` muito no futuro pode receber presença comum;
- evento `COMPLETED` antigo pode receber presença comum;
- Oratório `SCHEDULED` futuro permite Member, Oratoriano e cadastro rápido;
- remoção em `COMPLETED` continua exigindo motivo;
- `CANCELLED`, `LOCKED` e `FINALIZED` não recebem novas marcações;
- não há mensagem ou estado de janela obsoleto renderizado.

## 7. Qualidade final e handoff

Executar:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Revisar o diff para garantir que:

- somente as regras, a seção de presença, os testes e a documentação afetada
  foram alterados;
- o contrato gerado, os endpoints, permissões e DTOs permaneceram intactos;
- nenhum UUID, enum ou erro técnico foi adicionado à interface;
- o frontend não mantém comparações com `beginDate` para decidir se o registro
  está aberto;
- a conclusão do tracker ainda atualiza a política de remoção por motivo.

O resultado será entregue com os arquivos alterados, os comandos executados e
qualquer falha preexistente claramente separada de uma regressão introduzida.
