# Gestão de cargos na área de membros

## Problema

A tela `/manage/accounts` é uma consulta de contas e tipos de acesso, mas o diálogo de detalhes também executa as transições de Coordenação geral e Coordenação do Oratório. Essas operações usam rotas de `Member`, dependem do ciclo de vida do membro e exigem justificativa, portanto pertencem ao fluxo de Gestão dos Membros.

## Comportamento atual e comportamento aceito

### Atual

- `/manage/accounts` pesquisa contas, apresenta seus tipos de acesso e oferece ações para conceder ou remover Coordenação geral e Coordenação do Oratório.
- Para executar essas ações, o fluxo de Account localiza internamente o Member pelo e-mail da conta.
- A feature de Accounts ainda conserva componentes, hooks e operações não utilizados para edição genérica de Roles.
- O diálogo de Member apresenta dados pessoais e a transição de situação, mas não gerencia cargos.

### Aceito

- `/manage/accounts` permanece estritamente consultivo: pesquisa contas e mostra, nos cards e no diálogo, os tipos de acesso associados.
- Nenhum botão, formulário, permissão de escrita ou chamada de mutação de cargos permanece na feature de consulta de Accounts.
- Os artefatos inativos de edição genérica de Roles são removidos, sem recriar uma gestão arbitrária de RBAC na área de Members.
- O diálogo de detalhes aberto na listagem `/manage/members` passa a apresentar e executar as transições de Coordenação geral e Coordenação do Oratório.
- Conceder e remover continuam exigindo justificativa em português e usam exclusivamente as rotas dedicadas de `Member` presentes no contrato gerado.
- Identificadores de Account, Member e Role continuam internos e nunca são exibidos ou solicitados.

## Arquitetura

### Consulta de Accounts

`ManageAccountsPage` deixa de derivar permissões de gestão de cargos e entrega ao `AccountDetailsDialog` somente a Account selecionada e o fechamento. O diálogo continua carregando a projeção autoritativa dos Roles para apresentar seus rótulos e descrições traduzidos, mas não importa componentes ou hooks de `members`.

Os componentes `UnusedAccount*` e as operações e hooks sem consumidores para pesquisar, atribuir, remover ou inspecionar uma atribuição genérica de Role são eliminados. Permanecem na feature somente a busca de Accounts e a leitura dos Roles associados necessária à consulta.

### Gestão de Members

O `MemberListItem` passa a preservar internamente como `accountId: string | null` o identificador da Account embutida em `MemberRDTO.account`. Esse valor vem do contrato gerado e permite consultar os Roles da Account vinculada sem busca por e-mail e sem um novo DTO de transporte.

Uma seção feature-local de Members compõe a gestão de cargos no `MemberDetailsDialog`. Ela consome a consulta de Roles já pertencente à feature de Accounts por sua API pública, deriva o estado atual pelos códigos estáveis `COORD`, `ORATORIO_COORD`, `MEMBER` e `VISITOR`, e executa as mutações dedicadas já existentes na feature de Members.

Essa dependência fica em uma única direção: Members consome a leitura pública de Accounts para apresentar a projeção associada; a consulta de Accounts deixa de consumir operações de Members.

### Permissões e regras preservadas

- A Coordenação geral é exibida somente com `MEMBER_ACTIVATION`, mantendo a regra atual da interface.
- A Coordenação do Oratório é exibida somente com `ORATORIO_COORD_MANAGE`.
- A responsabilidade do Oratório permanece indisponível para Member inativo ou quando a projeção de Roles não representa um Member ativo de modo consistente.
- A autorização final continua pertencendo ao backend.
- Quando nenhuma das permissões estiver presente, o diálogo não consulta Roles apenas para oferecer ações indisponíveis.

## Interface e interação

O diálogo de Member mantém os dados cadastrais no início e a gestão da situação em sua seção atual. A nova seção `Cargos e responsabilidades` aparece em seguida quando houver ao menos uma capacidade aplicável.

Cada cargo apresenta seu estado atual e uma ação explícita:

- `Conceder coordenação` ou `Remover coordenação`;
- `Designar como coordenação do Oratório` ou `Remover da coordenação do Oratório`.

Ao acionar uma transição, a própria subseção abre o formulário de justificativa. O campo é obrigatório, aceita no máximo 2.000 caracteres Unicode, usa `noValidate`, os marcadores semânticos compartilhados e mensagens explícitas em português. A remoção usa apresentação destrutiva; cancelar restaura o estado fechado sem afetar o restante do diálogo.

O diálogo permanece rolável dentro da altura da viewport para acomodar as novas seções em telas pequenas. Fechá-lo limpa formulários e estados de mutação locais.

## Dados, atualização de cache e erros

1. A busca de Members mapeia `MemberRDTO.account.id` para `MemberListItem.accountId`.
2. Ao abrir um Member e existir uma ação permitida, a seção consulta `/accounts/{accountId}/roles` pela query existente.
3. A ação chama a rota dedicada `/members/{memberId}/coordinator/{grant|revoke}` ou `/members/{memberId}/oratorio-coordinator/{grant|revoke}`.
4. Após sucesso, as queries de Members, dos Roles da Account e das buscas de Accounts são invalidadas. A seção passa a refletir a projeção autoritativa atualizada sem fechar obrigatoriamente o diálogo.

Carregamento, erro com nova tentativa, ausência de Account vinculada, Member inativo, projeção inconsistente e proibição recebem estados em português. Mensagens do backend e de JavaScript não são renderizadas; o feedback continua passando por `getErrorMessage` e pelas classificações compartilhadas de erro.

## Testes

Cobrir comportamento observável nos seguintes limites:

- `AccountDetailsDialog` continua apresentando Roles e não contém gestão de cargos.
- `ManageAccountsPage` não deriva nem envia permissões de transição ao diálogo.
- o mapeamento de busca de Members preserva o `accountId` interno sem renderizá-lo;
- o diálogo de Member entrega as permissões corretas à gestão de cargos;
- cada cargo escolhe concessão ou remoção a partir dos Roles autoritativos;
- justificativa vazia e acima do limite bloqueia o envio;
- sucesso invalida Members, Roles da Account e buscas de Accounts;
- Member inativo, Account ausente, projeção inconsistente e consulta proibida não expõem identificadores nem ações inseguras.

Executar os testes focados, a suíte completa, `npm run lint` e `npm run build`.

## Documentação e fora de escopo

Atualizar `docs/README.md`, arquitetura, integração de API, backlog e inventário de linguagem para separar explicitamente a consulta de Accounts da gestão de cargos em Members.

Ficam fora do escopo:

- edição genérica do catálogo RBAC ou de qualquer Role arbitrário;
- novos endpoints, alterações no contrato gerado ou regras de autorização do backend;
- mudança da transição de situação do Member;
- redesenho da página dedicada `/manage/members/$memberId`;
- alterações visuais amplas fora dos dois diálogos afetados.
