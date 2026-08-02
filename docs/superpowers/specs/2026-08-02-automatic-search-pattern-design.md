# Padrão de busca automática e consistente

## Status

Especificação aprovada para implementação no frontend em 2026-08-02.

## Contexto

As listagens principais já aplicam a pesquisa rápida automaticamente após uma
breve pausa na digitação. Algumas buscas internas ainda exigem o botão
`Buscar`, especialmente o controle de presença do Oratório e a seleção de
membros para equipes. Essa diferença aumenta o esforço do usuário e quebra o
padrão aprendido em outras telas.

## Objetivos

1. Aplicar automaticamente buscas assíncronas por texto após 500 ms sem nova
   alteração.
2. Remover botões `Buscar` de filtros e seletores que apenas consultam
   resultados.
3. Reiniciar a página para a primeira página quando o termo mudar.
4. Manter resultados anteriores durante a atualização sempre que a consulta já
   oferecer esse comportamento.
5. Preservar ações que exigem confirmação explícita antes de uma operação,
   como `Conferir nome` no cadastro rápido de Oratoriano.
6. Registrar na documentação os princípios de interface enxuta e de padrões
   consistentes entre telas e módulos.
7. Oferecer uma ação clara para remover o termo atual sem apagar filtros ou
   seleções que não sejam o texto da busca.

## Fora de escopo

- Alterar rotas, permissões, contratos de backend ou artefatos gerados.
- Transformar ações de confirmação, criação ou envio em consultas automáticas.
- Criar filtros ou ordenações não suportados pelo contrato.
- Fazer uma refatoração visual ampla da área de gestão.

## Decisão de arquitetura

Será criado o hook compartilhado `useDebouncedValue` em `src/hooks/`, com o
intervalo padrão de 500 ms. Ele será a única referência temporal para buscas
de texto que alimentam consultas assíncronas.

O hook será usado por:

- `SearchAndFilter`, que já possui pesquisa automática nas listas principais;
- `MemberSearchPicker`;
- busca de contas no cadastro direto de membro;
- busca de tipos de acesso no fluxo legado de atribuição;
- busca de membros para equipes do Oratório;
- rosters de membros e Oratorianos no controle de presença.

Cada componente continuará responsável por normalizar o termo, decidir quando
a consulta está habilitada e preservar sua própria regra de seleção. O hook
não fará chamadas HTTP nem conhecerá features.

O controle de presença deixará de separar um termo “digitado” de um termo
“enviado” por ação do usuário. O termo debounced alimentará diretamente a
query, e qualquer mudança de termo voltará a página para zero. A paginação
continuará sendo parte da chave da query.

Campos de busca com texto terão um botão compartilhado `Limpar busca`,
renderizado somente quando o campo estiver preenchido. A ação limpará apenas
o termo daquele campo, preservará filtros e seleções independentes e manterá o
foco acessível no controle. Nos rosters e seletores paginados, a limpeza
reiniciará a página e aguardará o mesmo debounce antes de consultar o conjunto
sem termo.

`QuickOratorianoRegistration` manterá `Conferir nome`: ali a busca é uma
etapa de segurança que precisa ser concluída antes de liberar o cadastro e a
marcação de uma nova pessoa.

## Documentação de produto

As diretrizes de linguagem e arquitetura registrarão dois princípios:

- **Clareza com economia:** cada elemento visível ou acessível precisa ter
  utilidade real para a decisão, compreensão ou ação do usuário. Se não
  acrescenta valor, deve ser removido; a interface deve dizer o máximo com o
  mínimo necessário.
- **Consistência como padrão:** a mesma intenção deve ter a mesma interação,
  nomenclatura e comportamento em diferentes seções e módulos. Exceções só
  devem existir quando uma regra de negócio exigir uma confirmação distinta.

## Testes e critérios de aceitação

- O hook compartilha o atraso de 500 ms e cancela timers anteriores.
- O `SearchAndFilter` mantém seu comportamento atual usando o hook.
- O controle de presença consulta membros e Oratorianos sem botão `Buscar`.
- Campos preenchidos exibem `Limpar busca`; campos vazios não exibem esse
  controle.
- Limpar o termo remove a busca e reinicia a página sem apagar filtros
  independentes.
- Digitar, aguardar o debounce e limpar o termo altera a query e reinicia a
  página.
- A busca de membros para equipes não depende de submissão de formulário.
- Seletores de membros, contas e demais buscas assíncronas de texto não fazem
  uma chamada a cada tecla.
- `Conferir nome` permanece explícito no cadastro rápido.
- A suíte, o lint e o build não introduzem regressões; falhas preexistentes
  continuam identificadas separadamente.
