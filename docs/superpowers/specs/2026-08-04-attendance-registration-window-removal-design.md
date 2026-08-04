# Remoção das janelas de registro de presenças

## Contexto

O issue [#8](https://github.com/DudsFerraz/GAM-frontend/issues/8) solicita a
remoção da restrição de horário que ainda existe no frontend para registrar
presenças. O backend corrigiu essa divergência no commit
[6d8064b](https://github.com/DudsFerraz/GAM-backend-API/commit/6d8064bf8e4403e9755b86e6386fc60cf9bd2ac6),
que tornou a elegibilidade dependente da situação do ciclo de vida, sem
comparar o instante atual com as datas do evento.

As regras autoritativas são `REQ-PRESENCE-017` e
`REQ-ORATORIO-ATT-012`: presenças confirmadas podem ser registradas em
eventos `SCHEDULED` e `COMPLETED` independentemente de quando o evento começa
ou terminou. `CANCELLED`, `LOCKED` e `FINALIZED` continuam impondo as mesmas
restrições administrativas.

## Comportamento atual

- O registro comum de presença bloqueia eventos `SCHEDULED` até `beginDate`.
- Para eventos do tipo `ORATORIO`, o registro comum abre trinta minutos antes
  de `beginDate`.
- `EventPresencesSection` mantém um relógio e reavalia a janela a cada trinta
  segundos para habilitar o registro.
- O tracker do Oratório bloqueia a marcação até a janela de trinta minutos
  antes do início e apresenta a mensagem sobre abertura às 13h30.
- A regra de situação efetiva do Oratório também usa `endDate` para reconhecer
  a transição de `SCHEDULED` para `COMPLETED`; essa parte continua necessária
  para a política de motivo na remoção de presenças concluídas.

## Resultado aceito

1. O registro comum de presença fica disponível imediatamente para eventos
   `SCHEDULED` e `COMPLETED`, sem depender de `beginDate`, `endDate` ou do tipo
   do evento.
2. O tracker do Oratório permite marcar Members e Oratorianos assim que uma
   ocorrência `SCHEDULED` existe, mesmo que o início esteja no futuro.
3. O registro continua permitido para eventos `COMPLETED` mesmo depois do
   término, enquanto a situação efetiva permanecer aberta para adições.
4. `CANCELLED` continua permitindo somente a remoção de uma marcação existente;
   `LOCKED` e `FINALIZED` continuam bloqueando todas as alterações.
5. Remover uma presença de ocorrência `COMPLETED` continua exigindo motivo;
   as regras de motivo de `SCHEDULED` e `CANCELLED` permanecem inalteradas.
6. O frontend preserva as permissões atuais, os endpoints, as mutações, os
   estados de erro e a autoridade de autorização do backend.

## Fora de escopo

- Alterar o backend, o contrato OpenAPI gerado, os endpoints ou os DTOs.
- Alterar permissões, regras de fechamento administrativo ou políticas de
  motivo de remoção.
- Criar estados de RSVP, ausência, presença planejada ou reserva.
- Alterar a exibição das datas dos eventos ou a navegação do produto.
- Remover a avaliação de `endDate` usada para reconhecer uma ocorrência
  efetivamente `COMPLETED` no tracker do Oratório.

## Desenho técnico

### 1. Registro comum de presença

`src/features/manage/events/presenceManagement.ts` continuará sendo a fronteira
da regra de disponibilidade, mas passará a depender somente da situação do
evento:

- `SCHEDULED` e `COMPLETED` retornam `available`;
- `CANCELLED`, `LOCKED` e `FINALIZED` retornam `closed-status` com mensagens
  portuguesas já compatíveis com o ciclo de vida;
- situação ausente ou desconhecida retorna `unavailable` com a mensagem neutra
  existente.

O estado `before-window`, o argumento de instante de avaliação, a validação de
`beginDate` para abrir o registro e a exceção de trinta minutos do Oratório
serão removidos. `canRegisterPresence` continuará oferecendo uma função booleana
compatível com o consumidor, sem aceitar um relógio que já não participa da
decisão.

`EventPresencesSection` deixará de manter `presenceEvaluationInstant` e o
`setInterval`. O botão de registro seguirá condicionado à permissão
`PRESENCE_REGISTER`, será habilitado para situações abertas e continuará
apresentando as mensagens de situações fechadas ou dados indisponíveis.
`RegisterPresenceDialog` não terá mudança de contrato.

### 2. Tracker do Oratório

`src/features/manage/oratorios/attendanceRules.ts` continuará usando
`getEffectiveOratorioStatus` para converter uma ocorrência agendada em
`COMPLETED` depois de `endDate`. Essa avaliação mantém a atualização de uma tela
aberta e a exigência de motivo para correções posteriores.

Depois dessa classificação, uma ocorrência `SCHEDULED` retornará imediatamente:

```text
canMark: true
canUncheck: true
removalReasonRequired: false
message: null
```

O cálculo de `openingInstant`, a comparação com `beginDate` e a mensagem sobre
13h30 serão removidos. O tracker, o cadastro rápido e cada checkbox continuarão
consumindo `availability.canMark`/`availability.canUncheck`, portanto a mudança
propaga-se aos dois tipos de participante sem duplicar regra.

As situações `COMPLETED`, `CANCELLED`, `LOCKED` e `FINALIZED` conservarão suas
políticas existentes, inclusive motivo obrigatório somente para remoções de
ocorrências concluídas.

## Fluxo de dados

```text
EventDetailPage
  -> EventPresencesSection
     -> regra de situação (SCHEDULED/COMPLETED ou fechada)
     -> RegisterPresenceDialog
        -> POST /events/{eventId}/presences

OratorioAttendancePage
  -> getEffectiveOratorioStatus(event, now)
  -> getOratorioAttendanceAvailability(event, now)
  -> AttendanceRoster / QuickOratorianoRegistration
     -> PUT ou POST de presença conforme a operação
```

O frontend continua controlando apenas visibilidade e affordances. O backend
permanece responsável pela autorização, pela situação efetiva mais recente e
pela resposta de conflito quando o estado muda entre a leitura e a mutação.

## Mensagens, erros e acessibilidade

- A mensagem de janela futura e a mensagem sobre 13h30 deixam de ser
  apresentadas porque a regra correspondente deixa de existir.
- As mensagens portuguesas de evento cancelado, bloqueado, finalizado e dados
  indisponíveis permanecem na fronteira de apresentação do frontend.
- Nenhuma enumeração, data técnica, UUID, `message` ou `details` do backend será
  renderizado como texto de interface.
- Os controles existentes, seus nomes acessíveis, foco e comportamento
  responsivo permanecem inalterados.

## Testes e validação

Os testes focados deverão verificar:

- registro comum de um evento `SCHEDULED` muito antes de `beginDate`;
- registro comum de um evento `COMPLETED` muito depois de `endDate`;
- registro de Oratório `SCHEDULED` antes da antiga janela de trinta minutos;
- marcação de Member e Oratoriano pelo tracker sob a mesma disponibilidade;
- cadastro rápido habilitado para uma ocorrência `SCHEDULED` futura;
- situações `CANCELLED`, `LOCKED` e `FINALIZED` mantendo suas restrições;
- motivo obrigatório na remoção de uma ocorrência `COMPLETED`;
- ausência dos estados e mensagens de janela obsoletos no fluxo comum.

Depois dos testes focados, executar:

```sh
npm test
npm run lint
npm run build
```

## Documentação afetada

- Atualizar `docs/architecture/overview.md` para descrever o registro de
  presença como dependente da situação do ciclo de vida, sem janela por tipo.
- Atualizar `docs/integration/api.md` para registrar a elegibilidade sem
  fronteira de relógio nos adaptadores de Event e Oratório.
- Atualizar `docs/backlog/steps.md` se a descrição do comportamento atual ainda
  mencionar uma janela de registro por tipo.
- Não alterar documentação backend nem transformar o comportamento planejado em
  um novo contrato local.

## Critérios de conclusão

- O frontend não bloqueia presença confirmada por data de início, fim ou pela
  antiga janela de trinta minutos.
- O tracker comum e o tracker do Oratório seguem as mesmas regras aceitas pelo
  backend para `SCHEDULED` e `COMPLETED`.
- Fechamentos administrativos, permissões e motivos de remoção não regridem.
- O contrato gerado permanece intocado.
- Testes, lint e build passam sem regressões.
