# Refactor de formulários e presenças

## Contexto

Esta especificação registra o refactor aprovado para os componentes compartilhados
de formulário e para o fluxo Eventos → Presenças → Membros. A implementação deve
preservar a identidade visual, a paleta, a tipografia, as rotas e o foco operacional
da aplicação.

### Comportamento atual

- O primitive `Input` fixa cores claras (`bg-white`, texto e borda neutros), por isso
  campos baseados nele permanecem brancos no tema escuro.
- O seletor usado no registro de presença solicita `sort=firstName,asc` e
  `sort=surname,asc` em `POST /members/search`.
- O contrato público anuncia esses campos de ordenação, mas a implementação backend
  atualmente repassa os nomes diretamente ao JPA, cujo Member possui `name` embutido.
  A incompatibilidade tende a produzir o erro interno apresentado no seletor.
- Alterar a busca depois de selecionar um membro mantém o identificador anterior no
  formulário, e resultados de uma consulta anterior podem permanecer visíveis por
  causa de `keepPreviousData`.
- Fechar e reabrir o diálogo de registro pode preservar seleção e dados anteriores.
- `EventDetailPage` acumula a composição geral do evento e todo o estado, consulta e
  apresentação de presenças.
- Dados de presenças que já estejam no cache podem continuar disponíveis para
  renderização depois que a query é desabilitada por perda de permissão.
- A indisponibilidade do registro usa a mesma mensagem antes da abertura da janela e
  em situações administrativas que não aceitam novos registros.

## Resultado aceito

O refactor será vertical e limitado aos seguintes resultados:

1. Campos compartilhados respeitam os tokens existentes em ambos os temas.
2. A busca do diálogo de presença deixa de provocar a ordenação incompatível.
3. Somente uma seleção coerente com o termo atual pode ser enviada.
4. Carregamento, atualização, vazio, erro e retry da busca são explícitos e
   acessíveis.
5. O diálogo começa limpo sempre que é aberto novamente.
6. A página do evento delega o fluxo de presenças a um componente feature-local.
7. A lista de presenças nunca é renderizada sem a capacidade de consulta atual.
8. A mensagem de indisponibilidade diferencia janela futura de situação fechada.

## Fora de escopo

- Alterar valores da paleta, tipografia, espaçamento, dimensões ou composição visual.
- Modificar rotas, operações de API, contratos gerados ou o backend.
- Refatorar filtros e cards gerais de membros.
- Refatorar os demais diálogos de gerenciamento de eventos.
- Criar abstrações genéricas, bibliotecas adicionais ou novos fluxos de produto.
- Corrigir no frontend o contrato público de ordenação de Members como um todo. A
  busca do seletor apenas deixará de solicitar a ordenação problemática.

## Desenho técnico

### 1. Primitive de entrada e tema nativo

`src/components/ui/Input.tsx` continuará responsável por toda entrada de linha única.
Somente as classes de cor serão alinhadas aos tokens já existentes:

- `border-input`
- `bg-background`
- `text-foreground`
- `placeholder:text-muted-foreground`
- `focus-visible:ring-ring`

Raio, padding, sombra, transição, comportamento de arquivo, estado desabilitado e
extensão por `className` serão preservados.

`src/index.css` declarará `color-scheme: light` na raiz e `color-scheme: dark` quando
a classe `.dark` estiver ativa. Isso permite que partes nativas de campos de data,
hora e seleção acompanhem o tema sem introduzir novas cores de produto.

### 2. Seletor seguro de Member

`MemberSearchPicker` permanecerá um componente do feature de Members consumido pelo
feature de Events por sua API pública.

O seletor:

- enviará apenas `page: 0` e `size: 8`, sem ordenação explícita;
- continuará pesquisando `name LIKE` ou `email LIKE` conforme o termo;
- notificará o consumidor para limpar a seleção quando o termo mudar;
- não apresentará dados de `placeholderData` como resultados da consulta atual;
- apresentará atualização com região de status acessível;
- oferecerá `Tentar novamente` usando o `refetch` da mesma query;
- usará identificador de campo estável por instância, label associada, nome de
  controle, `autocomplete` apropriado e ícone decorativo oculto para tecnologia
  assistiva;
- continuará sem renderizar ou solicitar UUIDs.

`RegisterPresenceDialog` será o dono do Member efetivamente selecionado e do
`memberId` enviado. Ao receber a limpeza do seletor, removerá ambos. Ao fechar o
diálogo, resetará seleção, formulário e estado de mutação. O botão de envio só será
desabilitado durante a mutação ou quando a busca não estiver autorizada; validação
de seleção continuará a produzir a mensagem portuguesa do schema.

### 3. Componente feature-local de presenças

Será criado um componente em
`src/features/manage/events/components/EventPresencesSection.tsx`.

Ele será responsável por:

- paginação e consulta do roster;
- reavaliação periódica da janela de registro;
- feedback após registro, edição ou remoção;
- abertura e fechamento dos três diálogos de presença;
- estados loading, empty, error/retry e forbidden;
- cards de presença e suas ações autorizadas;
- proteção de renderização da lista e paginação por `canViewPresences`.

`EventDetailPage` continuará responsável por:

- buscar e apresentar o Event;
- obter o Account e suas permissões efetivas;
- compor informações do Event e ações do ciclo de vida genérico;
- passar Event, identificador e capacidades explícitas à seção de presenças.

Essa divisão mantém o fluxo no feature de Events, reduz a responsabilidade da página
e não cria uma camada ou framework adicional.

### 4. Disponibilidade do registro

`presenceManagement.ts` continuará sendo a fronteira de regra de apresentação para
o momento em que o registro pode ser oferecido. A regra passará a retornar um estado
tipado, além do booleano de compatibilidade:

- `available`: registro permitido;
- `before-window`: Event agendado, mas janela ainda não aberta;
- `closed-status`: situação atual não aceita novos registros;
- `unavailable`: dados insuficientes ou inválidos para avaliar a janela.

As mensagens serão frontend-owned, em português, sem exibir enum de transporte:

- antes da janela: informar que o registro ficará disponível quando ela abrir;
- situação fechada: informar que o evento não aceita novos registros na situação
  atual;
- indisponível: informar que não foi possível determinar a janela e orientar nova
  tentativa após atualização.

As regras atuais serão preservadas: Events agendados e concluídos podem aceitar
registro depois do limite aplicável; Oratório abre 30 minutos antes; os demais tipos
abrem no início; situações bloqueada, finalizada e cancelada não aceitam novo
registro.

## Fluxo de dados

```text
EventDetailPage
  -> EventPresencesSection
     -> useEventPresences
     -> RegisterPresenceDialog
        -> MemberSearchPicker
           -> useSearchMembers
              -> POST /members/search (sem sort)
        -> useRegisterEventPresence
           -> POST /events/{eventId}/presences
           -> invalida roster do Event e histórico do Member
```

O backend permanece a autoridade de autorização e validação. As capacidades
frontend controlam apenas visibilidade e affordances.

## Erros e estados assíncronos

- Falhas da busca continuarão passando por `getErrorMessage`; `message`, `details`,
  stack trace e demais diagnósticos backend não serão renderizados.
- Retry repetirá somente a consulta do seletor.
- Resultados anteriores não ficarão disponíveis durante a atualização de outro
  termo.
- Um erro posterior a uma seleção não permitirá que o identificador antigo seja
  enviado, pois a alteração do termo limpa a seleção antes da nova consulta.
- A lista em cache só poderá ser renderizada enquanto `canViewPresences` for
  verdadeira.

## Acessibilidade e linguagem

- Labels permanecerão associadas aos controles.
- Estados de busca assíncrona usarão região de status apropriada.
- Ícones puramente decorativos receberão `aria-hidden`.
- Botões manterão nomes de ação específicos em português.
- Textos de carregamento usarão reticências tipográficas.
- A implementação seguirá `docs/guides/user-facing-language.md` e não introduzirá
  valores técnicos na interface.

## Testes e validação

Testes focados deverão cobrir:

- o seletor não envia ordenação;
- uma nova busca limpa a seleção anterior;
- `placeholderData` não permanece selecionável;
- o retry chama `refetch`;
- fechar o diálogo limpa seleção, valores e erro;
- cada estado de disponibilidade produz a regra e a mensagem esperadas;
- dados de presença não são apresentados sem permissão.

Após os testes focados:

```sh
npm test
npm run lint
npm run build
```

Como não há teste visual ou E2E configurado, o handoff também registrará um roteiro
curto de verificação manual nos temas claro e escuro para campos comuns, data e
data/hora.

## Documentação afetada

- Atualizar `docs/architecture/overview.md` para registrar a nova responsabilidade
  de `EventPresencesSection`.
- Atualizar `docs/guides/user-facing-language.md` somente se a descrição inventariada
  do fluxo precisar refletir retry ou mensagens de indisponibilidade.
- Não alterar documentação backend nem duplicar a divergência de implementação como
  contrato aceito.

## Limites de commit para o handoff

1. `fix(ui): alinhar campos de formulário ao tema escuro`
2. `fix(presences): tornar segura a busca e seleção de membros`
3. `refactor(events): isolar e proteger a seção de presenças`

Cada bloco será acompanhado pelo `git add` exato dos arquivos efetivamente alterados.

## Critérios de conclusão

- Os dois bugs relatados deixam de ocorrer pela causa identificada no frontend.
- Nenhum token de cor ou estilo estrutural é modificado.
- Não há seleção ou roster obsoleto disponível para ação indevida.
- A página e o componente extraído preservam a direção routes → features → shared.
- O contrato gerado permanece intocado.
- Testes, lint e build passam sem regressões.
