# Núcleo operacional de Oratório e Oratorianos

## Contexto

Esta especificação registra o desenho aprovado para o primeiro ciclo frontend do
módulo de Oratório. O objetivo é permitir a preparação de uma ocorrência, a
operação rápida das presenças no dia e a manutenção do perfil comum de
Oratorianos.

O backend já expõe as rotas especializadas e o contrato frontend foi regenerado
em `src/api/generated/gam-api.ts`. Esse arquivo permanece como referência de
rotas e tipos de transporte e não será editado manualmente.

### Comportamento atual

- A navegação autenticada possui áreas para solicitações, membros, eventos,
  locais e contas, mas não possui uma área própria para Oratório.
- A busca comum de Events já aceita o filtro de tipo `ORATORIO`.
- A tela comum de Events apresenta Oratórios como Events somente para consulta;
  as mutações genéricas são corretamente limitadas ao tipo `GENERIC`.
- O frontend ainda não consome as rotas especializadas de ocorrência,
  planejamento, equipes, tracker ou Oratorianos.
- As permissões e apresentações portuguesas do novo catálogo já estão
  registradas no feature de Account.

### Fontes autoritativas

O desenho segue:

- o contrato gerado em `src/api/generated/gam-api.ts`;
- [Oratorio Occurrences and Planning](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorio/oratorio-occurrences-and-planning.md);
- [Oratorio Attendance Tracker](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorio/oratorio-attendance-tracker.md);
- [Oratoriano Records](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorianos/oratoriano-records.md);
- [Oratoriano Additional Forms](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorianos/oratoriano-additional-forms.md);
- a arquitetura, a integração de API, a autenticação e a fronteira de linguagem
  documentadas neste repositório.

Os requisitos do backend continuam sendo a fonte de verdade compartilhada. Este
documento registra somente as escolhas e responsabilidades do frontend.

## Resultado aceito

O primeiro ciclo entregará:

1. uma entrada própria `Oratório` na navegação;
2. uma lista de ocorrências baseada na busca comum de Events com tipo fixo
   `ORATORIO`;
3. criação de ocorrência a partir de uma data;
4. detalhe especializado com programação fixa, planejamento, equipes e ciclo de
   vida;
5. controle de presença responsivo para Membros e Oratorianos;
6. resumo persistente de todos os presentes;
7. cadastro rápido e atômico de Oratoriano com presença;
8. lista, busca e cadastro simples de Oratorianos;
9. perfil comum, edição, resumo e histórico de frequência do Oratoriano; e
10. integração dos cards `ORATORIO` da lista comum de Events com o detalhe
    especializado.

O uso principal do tracker será em celular, com notebook como superfície de
apoio. Ambas serão tratadas como superfícies de primeira classe.

## Fora de escopo

- fichas adicionais, versões, snapshots, PDF e anexos assinados;
- gestão da designação de Coordenadores do Oratório;
- exclusão e restauração de Oratorianos;
- ranking, pontuação, taxa, sequência, média ou classificação de frequência;
- recorrência ou temporadas de Oratório;
- agenda editável, equipes personalizadas ou inventários estruturados;
- importação de planilhas;
- observações de presença de Oratorianos;
- alterações no backend ou no contrato gerado;
- novas bibliotecas de UI, estado, formulário ou transporte.

A exclusão de uma ocorrência do Oratório permanece no escopo. A exclusão de
Oratorianos é omitida porque registros removidos não aparecem na busca nem no
detalhe comum e o contrato ainda não oferece descoberta de registros removidos
para uma restauração geral segura.

## Arquitetura

### Features

O código será dividido em dois features verticais sob o agrupamento de gestão:

```text
src/features/manage/oratorios/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── index.ts
├── presentation.ts
├── queryKeys.ts
└── types.ts

src/features/manage/oratorianos/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── index.ts
├── presentation.ts
├── queryKeys.ts
└── types.ts
```

Somente diretórios com arquivos reais serão criados. Os tipos de transporte
serão aliases de `components["schemas"]` do contrato gerado. Tipos locais
descreverão somente estado de interface, comandos de apresentação ou valores de
formulário.

`oratorios` poderá consumir a API pública do feature de Events para a busca
comum, pois um Oratório é uma especialização de Event e o hook atual já possui a
query key canônica. As operações especializadas permanecerão no API module de
`oratorios`.

`oratorianos` permanecerá independente de uma ocorrência específica. A
integração entre cadastro rápido e presença será de responsabilidade de
`oratorios`, porque a operação atômica pertence ao tracker.

### Rotas

As rotas de interface serão:

| Rota | Responsabilidade |
| --- | --- |
| `/manage/oratorios` | Listar e criar ocorrências |
| `/manage/oratorios/oratorianos` | Buscar e cadastrar Oratorianos |
| `/manage/oratorios/$oratorioId` | Exibir e gerenciar uma ocorrência |
| `/manage/oratorios/$oratorioId/attendance` | Operar o tracker |
| `/manage/oratorios/oratorianos/$oratorianoId` | Exibir e editar o perfil comum e a frequência |

Um layout feature-local fornecerá a navegação entre `Ocorrências` e
`Oratorianos`. A segunda seção só será exibida quando a conta possuir a
capacidade de consultar Oratorianos.

Os arquivos de rota continuarão finos: parâmetros, composição do layout e
importação das páginas públicas. `src/routeTree.gen.ts` não será editado
manualmente.

### Navegação e Events

A entrada `Oratório` aparecerá quando a conta puder consultar ocorrências ou
Oratorianos. O destino inicial será `Ocorrências` quando essa seção estiver
disponível e `Oratorianos` quando ela for a única seção consultável. Na lista
comum de Events:

- um card `ORATORIO` abrirá o detalhe especializado quando a conta puder
  consultá-lo;
- outros tipos manterão o comportamento existente;
- o diálogo genérico não se tornará uma segunda implementação do detalhe de
  Oratório.

## Permissões

As permissões efetivas de `/accounts/me` controlarão somente visibilidade e
affordances. O backend continuará sendo a autoridade.

| Capacidade | Uso no frontend |
| --- | --- |
| `ORATORIO_GET` | Entrada da área e detalhe especializado |
| `ORATORIO_CREATE` | Botão e diálogo de nova ocorrência |
| `ORATORIO_MANAGE` | Planejamento, equipes, ciclo e exclusão da ocorrência |
| `ORATORIO_ATTENDANCE_GET` | Botão e leitura do tracker |
| `ORATORIO_ATTENDANCE_MANAGE` | Check e uncheck individuais |
| `ORATORIANO_GET` | Seção, busca, detalhe e frequência de Oratorianos |
| `ORATORIANO_REGISTER` | Cadastro comum e cadastro rápido |
| `ORATORIANO_MANAGE` | Edição do perfil comum |

O cadastro rápido exigirá simultaneamente gestão de presença e cadastro de
Oratoriano, conforme a rota backend.

Dados em cache não serão renderizados depois da perda da capacidade de leitura.
Um `403` será apresentado normalmente e continuará acionando a
ressincronização de Account já implementada.

## Lista e criação de ocorrências

A lista usará `POST /events/search` com:

- filtro fixo `type EQUALS ORATORIO`;
- filtro opcional de situação;
- página controlada pela interface;
- ordenação por `beginDate,desc`; e
- paginação existente.

Como o título é derivado e sempre igual, a área especializada não oferecerá uma
busca redundante por título. Cada card destacará a data em
`America/Sao_Paulo`, a situação, o horário fixo e o local. A conversão da data
do Event será feature-local e não dependerá do fuso configurado no dispositivo.

A criação usará um diálogo com um único campo de data e
`POST /oratorios`. Após sucesso:

1. a lista comum de Events e a lista de Oratórios serão invalidadas;
2. o detalhe retornado poderá preencher o cache especializado; e
3. a navegação seguirá para o detalhe criado.

O erro `ORATORIO_DATE_ALREADY_EXISTS` orientará a pessoa a consultar a ocorrência
existente. `ORATORIO_LOCATION_UNAVAILABLE` informará que o local configurado do
Oratório não está disponível, sem apresentar configuração ou diagnóstico
técnico.

## Detalhe do Oratório

`GET /oratorios/{oratorioId}` fornecerá Event, programação, planejamento e
equipes.

### Cabeçalho

O cabeçalho apresentará:

- data local;
- horário de 14h a 17h;
- local;
- situação traduzida;
- ação principal para abrir o controle de presença quando autorizada; e
- ações de ciclo permitidas pela situação atual.

UUIDs, permissões, labels backend e dados diagnósticos permanecerão ocultos.

### Programação fixa

A programação será uma régua visual, não um editor:

| Horário | Apresentação |
| --- | --- |
| 14:00–15:30 | Recreação livre |
| 15:30–16:30 | Gincana |
| 16:30–17:00 | Boa Tarde das Crianças e dos Jovens |
| 17:00 | Lanche e encerramento |

O texto `activity` recebido é metadado controlado pelo sistema e não será
renderizado cru. Uma apresentação feature-local reconhecerá a estrutura fixa e
usará um fallback português neutro para dados futuros ou inesperados.

### Planejamento

O formulário terá quatro textareas opcionais:

- descrição do lanche;
- descrição da gincana;
- plano do Boa Tarde das Crianças; e
- plano do Boa Tarde dos Jovens.

Cada campo aceitará até 10.000 caracteres. O envio será uma substituição integral
por `PUT /oratorios/{oratorioId}/planning`. Campos em branco serão enviados de
forma compatível com a normalização backend e nunca criarão estruturas
inventadas.

### Equipes

Serão exibidas exatamente as quatro equipes do contrato, com apresentação em
português e fallback seguro:

- Lanche;
- Gincana;
- Boa Tarde das Crianças;
- Boa Tarde dos Jovens.

Cada card listará os membros atribuídos e indicará em português quando um membro
se tornou inativo. A remoção continuará disponível durante situações em que o
planejamento aceita correções.

O seletor de novas atribuições usará o roster especializado de Membros do
Oratório, que contém somente membros ativos e oferece busca pelo nome. Isso
permite a operação pela Coordenação do Oratório sem depender da permissão
genérica `MEMBER_SEARCH`. O frontend ignorará o campo de presença desse roster
nesse contexto.

Atribuir e remover serão tratados como operações idempotentes. Após cada `PUT` ou
`DELETE`, o detalhe será invalidado para refletir o estado autoritativo.

### Ciclo de vida

| Situação efetiva | Planejamento e equipes | Ações oferecidas |
| --- | --- | --- |
| `SCHEDULED` | Editáveis | Cancelar ou excluir |
| `COMPLETED` | Editáveis | Bloquear, finalizar ou excluir |
| `LOCKED` | Correções autorizadas | Finalizar ou reabrir para concluído |
| `FINALIZED` | Fechados | Reabrir para bloqueado ou concluído |
| `CANCELLED` | Fechados | Excluir |

Cancelar, reabrir e excluir sempre abrirão um diálogo de motivo, validado de 1 a
2.000 caracteres. Bloquear e finalizar usarão confirmação explícita sem inventar
um motivo.

As rotas de ciclo retornam `204`; portanto, o frontend não presumirá um Event no
corpo. Ele invalidará o detalhe especializado e as listas comum e especializada.

A exclusão só será apresentada nas situações aceitas. O conflito
`ORATORIO_HAS_ACTIVE_ATTENDANCE` orientará a remover as presenças ativas antes da
exclusão. Registros de presença já removidos não serão considerados pelo
frontend como bloqueio.

## Controle de presença

### Consultas paralelas

Ao abrir o tracker, serão iniciadas:

```text
GET /oratorios/{id}/attendance/members?page=0&name=
GET /oratorios/{id}/attendance/oratorianos?page=0&name=
GET /oratorios/{id}/attendance/present
```

Os rosters terão estados independentes de:

- aba selecionada;
- nome pesquisado;
- página atual;
- carregamento;
- erro e retry; e
- atualização em segundo plano.

O tamanho de 50 é fixado pelo endpoint. O resumo não é paginado e permanecerá
independente dos filtros dos rosters.

### Layout responsivo

No notebook, roster e resumo formarão duas colunas. O resumo ficará
`sticky` durante a rolagem.

No celular, o roster ocupará a largura disponível. Uma barra persistente
apresentará o total de presentes e abrirá o resumo completo em um diálogo Radix
existente.

A barra/resumo de presença será o elemento visual característico da tela. Usará
o ciano da marca com contenção; o restante continuará usando os tokens, cartões,
raios e tipografia atuais. Horários e contadores usarão números tabulares.

### Persistência individual

Cada checkbox persistirá imediatamente:

- `PUT` para marcar;
- `DELETE` para desmarcar; e
- nenhum comando de lista inteira.

Somente a linha afetada ficará pendente. A interface permitirá mutações
independentes em outras pessoas enquanto uma chamada estiver em andamento.

Após marcar:

1. a resposta atualizará a linha e o resumo conhecidos;
2. o roster correspondente e `/present` serão invalidados; e
3. a interface reconciliará o resultado com o backend.

Após desmarcar:

1. a pessoa será removida da linha e do resumo conhecidos;
2. o roster e o resumo serão invalidados; e
3. uma falha restaurará o estado por refetch, em vez de manter uma suposição
   otimista.

Uma falha ou concorrência sempre oferecerá feedback seguro e refará as duas
fontes afetadas.

### Regras por situação

| Situação | Marcar | Desmarcar |
| --- | --- | --- |
| `SCHEDULED` antes de 13h30 | Bloqueado | Bloqueado |
| `SCHEDULED` a partir de 13h30 | Permitido | Permitido sem motivo |
| `COMPLETED` | Permitido | Permitido com motivo obrigatório |
| `LOCKED` | Bloqueado | Bloqueado |
| `FINALIZED` | Bloqueado | Bloqueado |
| `CANCELLED` | Bloqueado | Permitido sem motivo para marcação existente |

O limite será calculado em `America/Sao_Paulo`. O backend continuará validando o
instante definitivo. Em `COMPLETED`, desmarcar abrirá um diálogo de motivo; nas
demais situações permitidas, a remoção será imediata com confirmação visual.

### Cadastro rápido

Na aba Oratorianos, a interface destacará `Pergunte o nome completo`.

O fluxo será:

1. informar nome e sobrenome;
2. pesquisar pelo nome completo antes de habilitar `Cadastrar e marcar`;
3. exibir resultados semelhantes como alerta de conferência;
4. impedir a criação localmente quando houver correspondência humana exata;
5. nunca marcar automaticamente um resultado existente; e
6. confirmar explicitamente a criação antes de chamar
   `register-and-mark`.

A comparação local:

- juntará nome e sobrenome;
- removerá diferenças de caixa e acentos;
- normalizará sequências de espaços; e
- normalizará variantes tipográficas aceitas de hífen e apóstrofo; e
- preservará a presença de pontuação como diferença relevante.

O backend continuará sendo a autoridade para conflitos concorrentes e nomes
reservados. `ORATORIANO_NAME_RESERVED` orientará a procurar o cadastro correto;
como a busca de removidos não existe, a mensagem não prometerá uma restauração
que este ciclo não consegue iniciar.

Após sucesso, serão invalidados:

- roster e resumo da ocorrência;
- buscas de Oratorianos; e
- eventual cache do perfil criado.

## Oratorianos

### Lista e cadastro

`POST /oratorianos/search` usará somente o filtro público `name LIKE`, paginação
e ordenação padrão por nome. A interface não enviará campos de persistência nem
ordenará por frequência neste primeiro ciclo.

A página exibirá nome e somente os dados comuns adequados ao contexto. Não fará
uma consulta de resumo por item nem introduzirá N+1 para simular um contador
ausente no `OratorianoRDTO`.

O cadastro comum pedirá apenas nome e sobrenome, com a orientação para perguntar
o nome completo. Nome e sobrenome respeitarão os limites de 32 e 64 caracteres,
terão ao menos duas letras, aceitarão apenas letras, espaços, hífen e apóstrofo
nas combinações válidas do `GamName`, e usarão mensagens portuguesas explícitas.
O sucesso invalidará as buscas e navegará para o perfil criado.

### Perfil comum

O detalhe combinará em paralelo:

```text
GET /oratorianos/{id}
GET /oratorianos/{id}/attendances?page=0&size=...
GET /oratorianos/{id}/attendance-summary?year=...&month=...
```

Serão exibidos:

- nome completo;
- nascimento, quando informado;
- telefone, quando informado;
- contagens de presença de todos os tempos, do ano e do mês selecionados; e
- histórico paginado, do mais recente para o mais antigo.

As contagens serão apresentadas como informação objetiva. Não haverá linguagem
de desempenho, comparação ou ranking.

O status de cada ocorrência do histórico passará pela apresentação segura de
Events. O identificador da ocorrência poderá ser usado internamente para abrir
seu detalhe, mas não será renderizado.

### Edição

O formulário editará nome, sobrenome, nascimento opcional e telefone opcional.
`PUT /oratorianos/{id}` enviará a substituição completa.

Uma data de nascimento futura em `America/Sao_Paulo` será rejeitada pelo schema
antes do envio. O backend continuará sendo a autoridade para a validação final.

O motivo:

- ficará oculto enquanto o nome não tiver mudado;
- aparecerá e será obrigatório quando nome ou sobrenome mudarem;
- aceitará de 1 a 2.000 caracteres; e
- não será exigido para alteração isolada de nascimento ou telefone.

Após sucesso, o detalhe será atualizado e as buscas serão invalidadas.

O componente de telefone brasileiro existente poderá ser elevado a componente
compartilhado, pois este será seu segundo uso real. A conversão para o formato
aceito pela API continuará acontecendo somente na fronteira de envio.

## Estado, cache e query keys

Os features terão namespaces próprios:

```text
oratorioQueryKeys
  all
  detail(id)
  attendance(id)
  roster(id, kind, page, name)
  present(id)

oratorianoQueryKeys
  all
  lists
  list(name, page)
  details
  detail(id)
  attendances(id, page)
  summary(id, year, month)
```

A busca de Oratórios que reutilizar Events continuará usando as query keys
canônicas de Events. Mutações especializadas invalidarão os dois namespaces
quando alterarem dados comuns do Event.

Respostas `204` não serão tipadas ou tratadas como entidades. Dados opcionais do
contrato serão normalizados apenas para renderização segura, sem afirmações
não nulas ou `any`.

## Apresentação e erros

`presentation.ts` em cada feature mapeará:

- situação de Event por meio da apresentação pública já existente;
- tipos de equipe;
- estrutura da programação;
- estados de disponibilidade do tracker; e
- valores ausentes ou inesperados.

Nunca será usado `labels[value] ?? value`.

O mapa seguro de erros ganhará mensagens para, no mínimo:

- `ORATORIO_DATE_ALREADY_EXISTS`;
- `ORATORIO_LOCATION_UNAVAILABLE`;
- `ORATORIO_TEAM_MEMBER_INACTIVE`;
- `ORATORIO_HAS_ACTIVE_ATTENDANCE`;
- `ORATORIO_LIFECYCLE_CONFLICT`;
- `ORATORIANO_NAME_RESERVED`; e
- `ORATORIANO_DELETED`.

Mensagens, detalhes, identificadores e stack traces do backend não serão
renderizados.

Todas as páginas e seções deliberarão sobre loading, updating, empty, error,
forbidden, success e retry. Feedback de mutação não substituirá os dados
persistentes nem causará layout instável desnecessário.

## Acessibilidade

- Labels serão associados a todos os campos.
- A troca entre Membros e Oratorianos terá semântica de abas e funcionará por
  teclado.
- A linha e o checkbox terão nomes acessíveis sem criar controles aninhados.
- Alvos de toque terão dimensão adequada ao uso em celular.
- Estados pendentes e resultados de mutação usarão regiões vivas apropriadas.
- Ícones decorativos serão ocultados de tecnologia assistiva.
- Foco visível e comportamento Radix serão preservados.
- Animações serão discretas e respeitarão `prefers-reduced-motion`.
- Nenhum estado explicará acesso citando códigos de permissão.

## Limitações de integração aceitas

1. A lista especializada depende de `EVENT_SEARCH`, pois não existe
   `/oratorios/search`. Os bundles baseline que consultam a área possuem essa
   capacidade por sua projeção de Member; uma combinação customizada
   `ORATORIO_GET` sem busca de Events não consegue descobrir ocorrências.
2. O detalhe também respeita a audiência `EVENT_GET_MEMBER` no backend. Uma
   permissão especializada isolada não ignora a audiência do Event.
3. A seleção de equipe usa o roster especializado e depende da leitura do
   tracker. Bundles baseline de operação possuem ambas as capacidades; uma
   combinação customizada de escrita sem leitura não receberá campo de UUID como
   alternativa.
4. Registros removidos de Oratorianos não são pesquisáveis. Exclusão e
   restauração permanecem fora deste ciclo até existir descoberta segura ou uma
   jornada backend aceita.

Essas limitações serão documentadas como estado atual, não como comportamento
planejado já implementado.

## Testes

### Transporte

Testes dos API modules verificarão:

- caminhos relativos e métodos;
- filtro fixo `ORATORIO`;
- parâmetros de roster e histórico;
- substituição integral de planejamento e perfil;
- ausência de corpo de requisição nas marcações;
- corpo opcional de motivo nas remoções;
- uso dos tipos gerados sem alterar `gam-api.ts`.

### Regras e schemas

Testes unitários cobrirão:

- máximo de 10.000 caracteres do planejamento;
- motivo de 1 a 2.000 caracteres;
- motivo condicional à mudança de nome;
- limites e caracteres válidos de `GamName`;
- rejeição de data de nascimento futura em São Paulo;
- campos opcionais do perfil;
- matriz de ações de ciclo;
- disponibilidade às 13h30 em São Paulo;
- motivo condicional ao desmarcar;
- equivalência humana de nomes;
- preservação de hífen e apóstrofo; e
- apresentações com fallback não cru.

### Componentes e comportamento

Testes com Testing Library cobrirão:

- resumo preservado ao trocar aba, página ou busca;
- pending state limitado à pessoa afetada;
- refetch após falha de mutação;
- diálogo de motivo em ocorrência concluída;
- cancelado permitindo somente remoção existente;
- resultados semelhantes sem marcação automática;
- correspondência exata impedindo cadastro rápido;
- ações e seções escondidas por capacidade;
- cache não renderizado depois da perda de leitura; e
- estados loading, empty, error, forbidden e retry.

### Verificação final

```sh
npm test
npm run lint
npm run build
```

Também será realizada verificação manual:

- celular e notebook;
- temas claro e escuro;
- teclado e foco;
- troca rápida de busca e página;
- múltiplas marcações independentes; e
- atualização de permissão durante uma tela aberta.

## Documentação afetada

Após a implementação:

- `docs/README.md` registrará o módulo no comportamento atual;
- `docs/architecture/overview.md` registrará os novos features, rotas e
  dependências;
- `docs/integration/api.md` registrará as operações efetivamente consumidas;
- `docs/guides/user-facing-language.md` incluirá as novas views no inventário;
- `docs/backlog/steps.md` separará o núcleo entregue das fichas e demais
  capacidades ainda planejadas.

Os documentos apontarão para os requisitos backend e não copiarão suas
especificações de domínio.

## Critérios de conclusão

- A área própria funciona do menu até todas as rotas aceitas.
- Um Oratório pode ser criado, planejado, organizado e conduzido sem usar a tela
  genérica para mutações especializadas.
- O tracker mantém o resumo completo independentemente da página ou pesquisa.
- Cada presença persiste individualmente e reconcilia com o backend.
- O cadastro rápido nunca escolhe ou marca automaticamente uma identidade
  existente.
- Oratorianos podem ser cadastrados, buscados, consultados e corrigidos sem ficha
  adicional.
- Frequência permanece informação, não classificação.
- Toda apresentação é intencionalmente brasileira e não expõe valores técnicos.
- Permissões controlam affordances, mas o frontend trata normalmente uma recusa
  backend.
- O contrato gerado e `src/routeTree.gen.ts` permanecem sem edição manual.
- Testes, lint e build passam sem regressões.
