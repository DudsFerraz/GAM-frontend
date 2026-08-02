# Detalhe do Oratório: programação operacional compacta

## Contexto

A tela de detalhe de uma ocorrência de Oratório concentra informações de data,
programação, planejamento, equipes e ciclo de vida em seções independentes.
Essa composição exige rolagem extensa para uma tarefa pontual, como atribuir um
membro responsável pelo lanche, e repete contexto que a Coordenação do GAM já
conhece.

Esta especificação registra a mudança frontend para a rota
`/manage/oratorios/$oratorioId`. Ela não altera o contrato da API, permissões,
regras do ciclo de vida ou o conteúdo submetido pelo planejamento.

## Estado atual

- O cabeçalho apresenta data, situação, controle de presença e uma descrição
  textual da tela.
- “Informações do dia” aparece como um cartão independente com título, data,
  horário e local.
- “Programação fixa” aparece em um cartão separado, com descrição explicativa
  e quatro itens sempre expandidos.
- “Planejamento” aparece como um formulário independente com quatro textareas e
  uma descrição auxiliar abaixo de cada campo.
- “Equipes” aparece como uma seção independente com quatro cartões, contagem ou
  ausência de membros, empty state textual e ações de atribuição.
- O ciclo de vida aparece depois de todas as equipes.

## Comportamento aceito

### Objetivo

Fazer da programação a única seção operacional principal do detalhe. Cada
horário deve revelar, sob demanda, o planejamento e os responsáveis da frente
correspondente, permitindo que uma tarefa específica seja executada sem
percorrer todas as informações da ocorrência.

### Hierarquia da página

A página seguirá esta ordem:

1. Navegação de retorno.
2. Cabeçalho compacto com contexto mínimo, data e ações principais.
3. Faixa compacta com data, horário e local, sem o título “Informações do
   dia”.
4. Seção “Programação”, que concentra a régua e os painéis expansíveis.
5. Ações de ciclo da ocorrência, quando autorizadas.
6. Aviso de indisponibilidade do controle de presença, quando aplicável.

O texto “Planejamento, responsáveis e operação desta data.” será removido do
cabeçalho. A identificação “Ocorrência de Oratório”, a data e a situação
continuam disponíveis para preservar o contexto essencial.

### Régua e dropdowns

Cada item da programação será um controle expansível acessível, com `aria-expanded`,
`aria-controls` e foco visível. Os quatro painéis começarão fechados a cada
entrada na página. O estado de abertura não será persistido nem usado como
estado de dados da ocorrência.

O cabeçalho fechado de cada item exibirá somente horário e atividade
apresentada. O chevron indicará a possibilidade de expansão. As mensagens
auxiliares “Atividades realizadas em paralelo.” e “Encerramento, sem intervalo
próprio na agenda.” deixarão de ser renderizadas.

O conteúdo de cada painel será:

| Horário | Conteúdo operacional |
| --- | --- |
| 14:00–15:30 | Somente a atividade “Recreação livre”; não haverá formulário nem equipe. |
| 15:30–16:30 | Campo de planejamento da Gincana e equipe da Gincana. |
| 16:30–17:00 | Campo de planejamento e equipe da Boa Tarde das Crianças, além de campo de planejamento e equipe da Boa Tarde dos Jovens. |
| 17:00 | Campo de planejamento do Lanche e equipe do Lanche. |

O texto controlado da programação continuará vindo da apresentação feature-local
existente. Atividades desconhecidas ou dados incompletos continuarão usando o
fallback neutro já definido, sem renderizar enums ou metadados crus.

### Planejamento dentro da programação

Os quatro campos continuarão usando o mesmo formulário React Hook Form, schema
Zod e operação de substituição integral existentes. Apenas a composição visual
será alterada:

- o campo será renderizado dentro do painel da sua frente;
- o placeholder de edição continuará sendo “Escreva o planejamento desta
  frente.”;
- o limite de 10.000 caracteres e as mensagens de validação serão preservados;
- as descrições auxiliares dos quatro campos serão removidas;
- o botão “Salvar planejamento”, o estado “Salvando...” e os feedbacks de
  sucesso/erro continuarão no formulário;
- quando a edição não estiver autorizada, o campo continuará desabilitado e o
  bloqueio será comunicado de forma compacta, sem repetir contexto de status ou
  permissão em cada frente.

O painel de planejamento poderá conter mais de uma frente. O envio continuará
salvando os quatro valores em uma única requisição, evitando alterações no
contrato ou no comportamento de persistência.

### Equipes dentro da programação

Os quatro tipos fixos continuarão sendo derivados de `ORATORIO_TEAM_LABELS` e
apresentados pela camada `presentation.ts`. Os cartões independentes da seção
“Equipes” serão removidos.

Cada frente operacional exibirá sua ação “Adicionar” quando a conta tiver as
capacidades necessárias. Membros atribuídos continuarão mostrando nome,
situação inativa e ação de remoção quando permitida. Quando não houver membros,
o painel não exibirá o texto repetitivo “A equipe está disponível para receber
atribuições”; a própria ação “Adicionar” será a affordance para iniciar a
atribuição.

O seletor de membro, busca por nome, paginação, estados de carregamento/erro,
proteção por capacidade e mutações de atribuição/remoção continuarão usando os
hooks e o diálogo existentes. A mudança deve extrair apenas a apresentação
reutilizável necessária para renderizar uma equipe dentro de um painel da
programação, sem criar uma nova camada de API.

No item de 16:30, as frentes de Crianças e Jovens serão exibidas como dois
blocos relacionados, com separação visual suficiente para identificar campo,
ação e membros de cada equipe. Em telas pequenas os blocos serão empilhados; em
telas maiores poderão usar duas colunas.

### Faixa compacta de contexto

O cartão de informações será mantido apenas como uma faixa compacta, sem
`CardHeader` e sem `CardTitle`. Data, horário e local ficarão em uma grade que
usa uma linha em telas largas e duas ou três linhas conforme a largura
disponível. O conteúdo e os ícones essenciais serão preservados:

- data formatada em português;
- horário fixo “14h às 17h”;
- local, com fallback “Local não informado”.

### Ciclo de vida e estados especiais

As ações de cancelar, excluir, bloquear, finalizar e reabrir não mudarão de
regra nem de permissão. Elas continuarão depois da programação, em uma seção
compacta própria, somente quando `ORATORIO_MANAGE` estiver disponível.

O alerta de ocorrência cancelada, os estados de carregamento, erro, proibido,
vazio e retry da página, os erros de salvamento e o aviso de ausência de acesso
ao controle de presença continuarão existindo quando forem relevantes. Textos
meramente explicativos ou repetitivos serão removidos, mas nenhum feedback de
ação será silenciado.

## Arquitetura proposta

`OratorioDetailPage` continuará coordenando a consulta, permissões, situação
efetiva e navegação. A rota não será alterada.

`OratorioSchedule` passará a ser a composição visual da seção operacional. Ele
controlará somente o estado local dos painéis abertos e receberá os dados de
planejamento, equipes, permissões e identificador necessários para compor os
conteúdos. O estado de abertura não será persistido nem enviado ao backend.

`OratorioPlanningForm` continuará sendo o dono do formulário e da mutação de
planejamento. Ele poderá ser renderizado em mais de um painel por meio de uma
configuração feature-local dos campos, mas todos os campos permanecerão sob o
mesmo `useForm` para manter o envio integral.

`OratorioTeamsSection` deixará de ser montado como seção independente. A lógica
de seleção de membro e as operações de equipe serão mantidas ou extraídas para
componentes internos do feature, evitando duplicação e preservando os testes
existentes de busca, permissão, atribuição e remoção.

Não haverá alteração em `src/api/generated/gam-api.ts`, nos endpoints, nas
chaves de query ou nos contratos de transporte.

## Responsividade e acessibilidade

- O painel fechado ocupará a largura disponível e terá uma área de clique
  confortável em telas pequenas.
- O conteúdo expandido não dependerá de hover e poderá ser operado por teclado.
- O foco permanecerá visível nos controles de expansão, adicionar, remover e
  salvar.
- Cada painel terá nome acessível e relação explícita entre o botão e seu
  conteúdo.
- Os dois blocos de 16:30 serão empilhados abaixo do breakpoint de layout e não
  criarão rolagem horizontal.
- A faixa de contexto e os textareas manterão contraste e hierarquia dos tokens
  atuais.
- A preferência `prefers-reduced-motion` não será contrariada por animações
  obrigatórias; a abertura pode ocorrer sem transição.

## Testes

Adicionar ou ajustar testes focados para cobrir:

1. os quatro painéis iniciando fechados;
2. a expansão e o fechamento por teclado/clique, com atributos ARIA corretos;
3. a associação entre cada painel e seus campos/equipes;
4. a presença de duas frentes no painel de 16:30;
5. a ausência das descrições e empty states redundantes;
6. a preservação do envio integral do planejamento;
7. a preservação das affordances de atribuição, remoção, permissão, erro e
   salvamento.

Os testes existentes de `OratorioTeamsSection`, planejamento, apresentação e
hooks devem continuar passando. O teste deve verificar comportamento
observável, não classes Tailwind específicas.

## Critérios de aceite

- Ao abrir o detalhe, a pessoa vê o contexto essencial e a régua compacta sem
  precisar percorrer planejamento e equipes separados.
- Nenhum dropdown começa aberto.
- Ao expandir Gincana, a pessoa encontra seu planejamento e seus responsáveis
  no mesmo bloco.
- Ao expandir 16:30, a pessoa encontra separadamente as frentes de Crianças e
  Jovens.
- Ao expandir 17:00, a pessoa encontra planejamento e responsáveis do Lanche.
- Os formulários continuam salvando os quatro campos por uma substituição
  integral e exibindo seus estados de feedback.
- A atribuição e remoção de membros continuam business-facing, protegidas por
  capacidades e sem exposição de UUIDs.
- A tela fica significativamente mais compacta sem perder status, ações,
  erros, permissões ou informações necessárias à operação.
- A rota permanece `/manage/oratorios/$oratorioId` e não exige mudança de API.
- `npm run lint`, `npm run build` e os testes focados passam, salvo falhas
  preexistentes explicitamente registradas.

## Fora de escopo

- Alterar o contrato ou endpoints do backend.
- Alterar a programação fixa, horários, nomes de frentes ou regras de equipe.
- Criar equipes personalizadas ou editar a sequência da programação.
- Mudar regras de permissão, ciclo de vida ou controle de presença.
- Redesenhar o shell autenticado, tema global ou outras telas.
- Introduzir nova biblioteca de accordion, estado, formulário ou transporte.
