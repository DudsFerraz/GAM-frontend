# Identificação visual dos tipos de Event

## Status

Design aceito para implementação. Esta especificação registra comportamento planejado e não descreve a apresentação atual da listagem.

## Contexto

A listagem comum de Events exibe Events genéricos e especializados na mesma grade. Atualmente, todos os cards usam a mesma superfície e o tipo aparece apenas como texto secundário, o que dificulta localizar rapidamente um Oratório entre vários Events genéricos sem recorrer à busca ou ao filtro.

Embora o pedido inicial tenha citado `/manage/members`, a superfície mostrada e o comportamento descrito correspondem à listagem implementada em `/manage/events`, composta por `ManageEventsPage`. Esta mudança se limita a essa listagem comum de Events e não altera a listagem de Members.

Oratório e Missa são os únicos tipos especializados presentes no contrato atual. Oratório faz parte da entrega atual. Missa ainda não possui fluxo especializado aceito, mas sua identidade cromática será definida agora para manter a apresentação comum preparada e consistente.

## Objetivos

- Tornar Events especializados reconhecíveis durante a leitura direta da grade.
- Preservar a superfície neutra e a hierarquia atual dos cards.
- Não depender somente de cor para comunicar o tipo.
- Definir uma única fonte tipada para rótulo e apresentação cromática de cada tipo.
- Garantir que tipos futuros exijam uma decisão explícita de apresentação.
- Manter boa distinção nos temas claro e escuro.

## Fora de escopo

- Alterar busca, filtros, paginação, ordenação ou carregamento de Events.
- Mudar rotas, permissões ou ações disponíveis em cada tipo.
- Criar ou antecipar o fluxo especializado de Missa.
- Colorir toda a superfície do card.
- Alterar cards das áreas dedicadas de Oratório, Member ou Presence.
- Criar configuração de cores editável pelo usuário ou fornecida pelo backend.

## Direção visual

A opção aceita usa dois sinais complementares nos cards especializados:

1. uma trilha colorida de 4 px na lateral esquerda;
2. um marcador circular seguido do rótulo textual do tipo, usando a mesma família cromática.

A cor de fundo do card, o botão primário, a situação do Event e o restante da composição permanecem inalterados. Events genéricos continuam com borda neutra, sem trilha colorida, e com o rótulo secundário neutro.

O rótulo textual permanece sempre visível. Assim, a cor acelera a leitura da grade, mas não é a única forma de identificar o tipo.

## Paleta aceita

### Oratório

Oratório usa esmeralda, escolhido por se separar dos azuis dominantes da interface e comunicar uma atividade acolhedora e comunitária.

- Tema claro:
  - trilha: `emerald-600` (`#059669`);
  - marcador e texto: `emerald-700` (`#047857`).
- Tema escuro:
  - trilha: `emerald-400` (`#34D399`);
  - marcador e texto: `emerald-300` (`#6EE7B7`).

### Missa

Missa usa âmbar, escolhido por criar uma identidade quente e celebrativa, distinta do esmeralda do Oratório e do vermelho reservado para situações destrutivas ou canceladas.

- Tema claro:
  - trilha: `amber-600` (`#D97706`);
  - marcador e texto: `amber-700` (`#B45309`).
- Tema escuro:
  - trilha: `amber-400` (`#FBBF24`);
  - marcador e texto: `amber-300` (`#FCD34D`).

### Genérico e valores desconhecidos

- `GENERIC` permanece neutro e não recebe trilha.
- Valores ausentes, desconhecidos ou futuros não usam uma cor arbitrária.
- O fallback continua sendo `Tipo não identificado`, com apresentação neutra e sem expor o valor bruto.

## Fonte única de verdade

`src/features/manage/events/presentation.ts` conterá um mapa tipado `EVENT_TYPE_PRESENTATIONS`. Cada entrada reunirá:

- o rótulo em português;
- as classes da trilha do card;
- as classes do marcador e do texto do tipo;
- a decisão explícita de não enfatizar o tipo genérico.

O mapa deve satisfazer `Record<EventType, EventTypePresentation>`. Quando o contrato adicionar um novo `EventType`, o TypeScript deverá exigir sua apresentação antes que a aplicação compile.

A listagem e o filtro de tipo consumirão esse mesmo mapa. O JSX do card não conterá condicionais cromáticas específicas para `ORATORIO` ou `MISSA`, valores hexadecimais duplicados ou classes de cor espalhadas.

`getEventTypeLabel` continuará disponível para as demais superfícies e passará a obter o rótulo pelo mapa central. Um resolvedor de apresentação fornecerá o fallback neutro para valores que não pertencem ao contrato conhecido.

## Comportamento dos cards

Para cada item da grade:

1. a página resolve a apresentação do tipo uma única vez;
2. aplica as classes de trilha ao `Card`;
3. renderiza o tipo com marcador circular e classes cromáticas correspondentes;
4. mantém situação, título, data, local, descrição, links e permissões como estão.

O realce não altera a área clicável, os destinos especializados, o comportamento do botão de mapa ou a disponibilidade de gerenciamento.

Em telas pequenas, a trilha e o marcador permanecem visíveis sem aumentar a largura ou altura mínima do card. A mudança não introduz animação nem deslocamento de layout.

## Acessibilidade e linguagem

- O tipo continua expresso por texto; a cor é redundante.
- O marcador circular é decorativo e não recebe anúncio separado.
- Os contrastes das cores de texto devem permanecer adequados nos temas claro e escuro.
- Nenhum enum de transporte, código ou valor desconhecido é renderizado diretamente.
- Rótulos e fallbacks permanecem em português brasileiro.

## Verificação

Testes focados devem comprovar:

- rótulos de `GENERIC`, `ORATORIO` e `MISSA`;
- apresentação neutra de `GENERIC`;
- classes esmeralda de Oratório nos temas claro e escuro;
- classes âmbar de Missa nos temas claro e escuro;
- fallback neutro e seguro para tipo ausente ou desconhecido;
- cobertura tipada de todos os `EventType`;
- consumo do mapa central pelo filtro e pelos cards sem alterar ações ou destinos.

Depois da implementação, executar:

- testes focados de apresentação e da listagem;
- `npm run lint`;
- `npm run build`.

## Critérios de aceite

1. Oratórios são localizáveis na grade por uma trilha esmeralda e um marcador textual esmeralda.
2. Missas usam a mesma estrutura com identidade âmbar.
3. Events genéricos permanecem neutros.
4. O fundo completo dos cards não é colorido.
5. A identificação do tipo não depende somente de cor.
6. Rótulos e cores dos tipos conhecidos são definidos em um único mapa tipado.
7. Um novo `EventType` conhecido não compila sem uma apresentação explícita.
8. Valores desconhecidos usam apresentação neutra e `Tipo não identificado`.
9. Busca, filtro, paginação, rotas, ações e permissões mantêm o comportamento atual.
10. Testes focados, lint e build passam sem regressões.
