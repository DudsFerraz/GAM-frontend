# Frentes remanescentes do Oratório

## Contexto

Esta especificação registra o desenho frontend aprovado para concluir as
capacidades remanescentes do módulo de Oratório:

1. gestão da designação de Coordenadores do Oratório;
2. exclusão de Oratorianos; e
3. fichas adicionais, snapshots de impressão, PDFs e anexos assinados.

A restauração de Oratorianos foi retirada explicitamente deste ciclo porque a
jornada está sendo revista e pode deixar de existir. O frontend não criará
lista de removidos, ação de restauração, comando de desfazer nem abstrações
preparatórias para uma possível retomada.

O núcleo operacional já implementado permanece como ponto de partida. A
aplicação possui ocorrências, planejamento, equipes, ciclo de vida, tracker de
Membros e Oratorianos, cadastro rápido, perfil comum de Oratoriano, frequência e
histórico de presença. As novas capacidades devem ampliar esse código
incrementalmente, sem reescrever a área.

### Estado atual antes da implementação

- `src/features/manage/accounts/` já consulta os papéis de uma Account e oferece
  a designação de Coordenação geral por uma operação Member-targeted.
- `src/features/manage/members/` já resolve o Member associado a uma Account
  por e-mail e contém o adapter da transição de Coordenação geral.
- `src/features/manage/oratorianos/` já contém busca, cadastro mínimo, perfil
  comum, correção, frequência e histórico.
- O perfil do Oratoriano ainda não oferece exclusão nem fichas adicionais.
- `src/api/generated/gam-api.ts` já contém as operações atuais de designação,
  exclusão e ciclo de fichas, mas não permite redescobrir anexos e snapshots
  existentes após o recarregamento da aplicação.
- Os papéis e códigos de permissão do Oratório já possuem apresentação
  frontend-owned em português.

### Fontes autoritativas

O desenho segue:

- o contrato gerado em `src/api/generated/gam-api.ts`;
- [Oratorio Coordinator Designation](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorio/oratorio-coordinator-designation.md);
- [Oratoriano Records](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorianos/oratoriano-records.md);
- [Oratoriano Additional Forms](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/requirements/oratorianos/oratoriano-additional-forms.md);
- [ADR-0014: Make Member lifecycle own Oratorio Coordinator designation](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/decisions/0014-make-member-lifecycle-own-oratorio-coordinator-designation.md);
- [ADR-0016: Store signed Oratoriano form attachments in PostgreSQL](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/decisions/0016-store-signed-oratoriano-form-attachments-in-postgresql.md);
- [ADR-0017: Serialize Oratorio and Oratoriano mutations](https://github.com/DudsFerraz/GAM-backend-API/blob/main/docs/decisions/0017-serialize-oratorio-and-oratoriano-mutations.md);
- a arquitetura, a integração de API, a autenticação e a fronteira de linguagem
  documentadas neste repositório.

Os documentos do backend continuam sendo a fonte de verdade para regras de
domínio, autorização e contrato. Esta especificação registra escolhas de
interface e responsabilidades do frontend.

## Resultado aceito

O ciclo entregará:

1. concessão e remoção da designação de Coordenador do Oratório a partir da
   consulta de Accounts;
2. exclusão de um Oratoriano a partir de seu perfil, com motivo obrigatório;
3. histórico paginado e metadata-only de fichas no perfil do Oratoriano;
4. criação de ficha para transcrição de papel ou entrada direta no sistema;
5. edição e salvamento repetido de rascunho;
6. geração e download de PDF identificado em branco ou pré-preenchido;
7. substituição atômica da coleção completa de anexos assinados;
8. download posterior de anexos já existentes;
9. conclusão de rascunho, incluindo a escolha explícita de sobrescrita do
   perfil quando exigida;
10. consulta read-only das versões imutáveis;
11. revogação da ficha concluída atual com motivo; e
12. exclusão de rascunho com motivo.

## Fora de escopo

- restauração de Oratorianos ou descoberta de registros removidos;
- hard delete de Oratorianos ou fichas;
- reassociação de rascunho a outro Oratoriano;
- aprovação por uma segunda pessoa;
- OCR, reconhecimento de escrita ou análise automática de legibilidade;
- armazenamento público, URL permanente ou filesystem para anexos;
- editor de templates de PDF;
- reversão automática do perfil comum após revogação;
- gestão genérica de papéis de sistema;
- novas bibliotecas de formulário, estado, transporte ou upload;
- mudanças manuais em `src/api/generated/gam-api.ts`;
- introdução de testes end-to-end antes de um fluxo de navegador ser aceito no
  repositório.

## Dependências de contrato

### Estado atual

As rotas atuais permitem criar um snapshot e receber seu identificador, e
substituir anexos e receber seus identificadores. Entretanto, o histórico e o
detalhe da ficha não devolvem referências suficientes para localizar esses
recursos novamente em outra sessão.

O detalhe também representa `FormRDTO.data` como um mapa de valores
desconhecidos, embora o contrato já possua `FormDraftDTO`. As referências de
ator contêm somente UUID, que não pode ser apresentado na interface.

### Estado necessário antes da frente de arquivos

O backend deverá aceitar e publicar uma evolução de contrato que ofereça:

- descoberta dos metadados e identificadores dos anexos ativos de uma ficha,
  sob `ORATORIANO_FORM_ATTACHMENT_GET`;
- descoberta dos snapshots de impressão ativos de uma ficha, sob
  `ORATORIANO_FORM_PDF_GENERATE`;
- dados estruturados do detalhe tipados como `FormDraftDTO`, sem mapa aberto;
- referências de ator com nome de exibição suficiente para apresentação
  business-facing, sem exigir que o frontend mostre ou peça UUID.

A forma concreta dessas operações permanece backend-owned. A opção mínima
preferida é fornecer leituras metadata-only específicas para anexos e snapshots,
preservando suas permissões independentes, em vez de inserir filenames
sensíveis no histórico comum.

Após a publicação, o contrato frontend será regenerado pelo workflow aceito. A
implementação de fichas não criará DTOs ou rotas concorrentes para contornar uma
versão ainda incompleta do contrato.

## Estratégia de entrega

A entrega será incremental por fatias verticais:

1. iniciar e validar as evoluções de contrato necessárias às fichas;
2. entregar gestão de Coordenadores do Oratório;
3. entregar exclusão de Oratorianos;
4. entregar histórico e detalhe read-only das fichas;
5. entregar criação, editor, salvamento e exclusão de rascunho;
6. entregar snapshots e PDFs;
7. entregar anexos assinados;
8. entregar conclusão, sobrescrita explícita, revogação e integração final.

Gestão de Coordenadores do Oratório e exclusão de Oratorianos não dependerão da
evolução do contrato de arquivos. A ação de criar uma ficha só será exposta
quando o editor estiver disponível; cada fatia terminará utilizável, testada e
documentada antes da seguinte.

## Arquitetura

### Gestão da designação

`src/features/manage/accounts/` continuará responsável pela superfície de
consulta da Account e pela composição do diálogo de detalhes. Ele receberá uma
seção específica para a Coordenação do Oratório.

`src/features/manage/members/` continuará responsável pelas operações
Member-targeted. A feature adicionará o adapter e o mutation hook das rotas
dedicadas de concessão e remoção.

Não será criada uma tela genérica de edição de papéis nem uma segunda
representação de `ORATORIO_COORD`.

### Exclusão do Oratoriano

API, hook, schema e diálogo de exclusão permanecerão em
`src/features/manage/oratorianos/`. O perfil comum comporá a ação, e o route
file continuará limitado a parâmetros e composição.

### Fichas adicionais

As fichas serão isoladas em uma feature própria devido ao tamanho do fluxo, às
permissões independentes e à sensibilidade dos dados:

```text
src/features/manage/oratorianoForms/
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

Somente diretórios com arquivos reais serão criados. Tipos de transporte serão
aliases do contrato gerado; tipos locais representarão apenas estado de
interface e view models validados na fronteira.

O perfil do Oratoriano continuará em `oratorianos` e consumirá a API pública da
feature de fichas para compor o histórico. O editor será uma página da feature
de fichas em uma rota equivalente a:

```text
/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId
```

O arquivo de rota importará a página pública, obterá os parâmetros e não conterá
transport logic, schemas ou a implementação visual do formulário.

## Gestão de Coordenadores do Oratório

### Superfície e decisão da ação

O `AccountDetailsDialog` usará os papéis já carregados para decidir a transição:

- sem `ORATORIO_COORD`: oferecer concessão;
- com `ORATORIO_COORD`: oferecer remoção.

A seção aparecerá somente quando a Account atual possuir
`ORATORIO_COORD_MANAGE`. Ela não dependerá de `MEMBER_ACTIVATION`,
`ACCOUNT_ROLE_MANAGE` ou de o ator possuir o papel `ORATORIO_COORD`.

O alvo será resolvido internamente para o Member vinculado. A interface não
pedirá o identificador. Account sem Member, Member inativo ou projeção
inconsistente receberá um estado explicativo e não oferecerá um caminho de
reparo genérico.

Concessão e remoção exigirão motivo normalizado com 1 a 2.000 caracteres. A
interface não aplicará proteção ao último detentor, pois zero Coordenadores do
Oratório é um estado aceito.

### Mutação e reconciliação

Após sucesso serão invalidados:

- detalhe e buscas de Member afetadas;
- papéis da Account;
- busca de Accounts.

O backend continuará sendo autoritativo para concorrência e consistência da
projeção. Um conflito fará refetch dos dados antes de oferecer nova tentativa.

### Limitação de seleção

Os bundles baseline que possuem `ORATORIO_COORD_MANAGE` também permitem a
consulta necessária para localizar Account e Member. Uma combinação customizada
de escrita sem leitura não receberá campo de UUID como fallback. A interface
explicará que não pode selecionar o alvo com segurança.

## Exclusão de Oratorianos

### Ação e confirmação

O perfil exibirá `Excluir cadastro` somente com `ORATORIANO_MANAGE`. O diálogo
destrutivo exigirá um motivo normalizado de 1 a 2.000 caracteres e explicará:

- presenças ativas ou removidas não serão apagadas;
- fichas em rascunho e seus snapshots e anexos serão removidos do acesso
  ordinário de forma atômica;
- fichas concluídas, substituídas ou revogadas impedem a exclusão.

A confirmação não falará sobre restauração, desfazer ou reutilização futura do
cadastro.

### Sucesso e invalidação

Após `204 No Content`, o frontend:

1. removerá o detalhe excluído do cache;
2. invalidará listas e resumos de Oratorianos;
3. invalidará os limites de query do tracker do Oratório, pois o registro deixa
   de ser selecionável e pode continuar visível em presenças históricas como
   removido;
4. voltará à lista de Oratorianos; e
5. mostrará confirmação em português.

Não haverá tentativa de consultar o detalhe comum depois da exclusão.

### Conflitos

`ORATORIANO_HAS_IMMUTABLE_FORMS` receberá texto específico informando que fichas
concluídas ou históricas impedem a exclusão. Mensagens atuais de
`ORATORIANO_DELETED` e `ORATORIANO_NAME_RESERVED` serão revistas para não
prometer nem orientar uma restauração.

## Histórico e ciclo de vida das fichas

### Histórico metadata-only

O perfil do Oratoriano ganhará uma seção `Fichas adicionais`, carregada somente
com `ORATORIANO_FORM_GET`. O histórico paginado mostrará:

- versão;
- situação apresentada em português;
- origem apresentada em português;
- data de assinatura quando existente;
- datas e nomes de criação, conclusão e revogação;
- existência e quantidade de páginas do anexo.

O histórico não mostrará CPF, RG, endereço, contatos, família, saúde,
declarações, filenames, hashes ou identificadores.

### Criação e origens

`Nova ficha` exigirá `ORATORIANO_FORM_MANAGE` e oferecerá exatamente:

- `Transcrição de papel`, enviando `PAPER_TRANSCRIPTION`;
- `Preenchimento no sistema`, enviando `DIRECT_SYSTEM_ENTRY`.

A interface explicará a consequência antes da criação. Após `201 Created`, o
frontend semeará o detalhe recebido no cache, invalidará o histórico e navegará
ao editor.

### Ações por situação

| Situação | Ações |
| --- | --- |
| `DRAFT` | editar, salvar, gerar snapshot/PDF, substituir anexos, concluir ou excluir com motivo |
| `COMPLETED` | consultar, baixar anexos e revogar com motivo |
| `SUPERSEDED` | consultar e baixar anexos |
| `REVOKED` | consultar e baixar anexos |

Somente `DRAFT` será editável ou excluível. Somente a versão `COMPLETED` atual
será revogável. Situações imutáveis nunca receberão campos habilitados por
inferência do frontend.

## Editor do rascunho

### Estrutura responsiva

O editor usará um único React Hook Form dividido em cinco etapas:

1. identificação e endereço;
2. escola, responsável e familiares;
3. informações de saúde;
4. declarações e assinatura;
5. arquivos e conclusão.

Desktop e telas grandes poderão apresentar navegação lateral ou horizontal
entre etapas. Em telas pequenas, a navegação permanecerá linear, com títulos e
botões acessíveis. A mudança de etapa não esconderá erros já conhecidos.

### Salvamento

Não haverá autosave. `Salvar rascunho` ficará disponível em todas as etapas.
Como `PUT` substitui a ficha inteira, cada salvamento enviará o estado completo
conhecido pelo formulário.

Alterações não salvas ativarão uma confirmação ao abandonar a rota. O frontend
nunca enviará apenas uma seção, pois isso apagaria os demais campos do
rascunho.

O `data` recebido será validado e estreitado na fronteira antes de inicializar o
formulário. Dados incompatíveis produzirão um estado seguro de erro; não serão
convertidos silenciosamente em formulário vazio.

### Dois níveis de validação

O frontend manterá:

- schema de rascunho, que permite ausência mas valida todo valor presente;
- schema de conclusão, que aplica a matriz completa e as regras condicionais.

Ambos fornecerão mensagens explícitas em português. O schema de conclusão
cobrirá:

- nome, nascimento, CPF, endereço, número, bairro, CEP, cidade, telefone e
  `signedOn`;
- `signedOn` não futuro em `America/Sao_Paulo`;
- classificação de menor ou adulto na data assinada;
- escola e série obrigatórias para menor;
- responsável diferente de `SELF` para menor;
- telefone pessoal obrigatório para adulto `SELF`;
- confirmação de que o responsável possui ao menos 18 anos;
- complemento obrigatório para `RELATIVE` e `REFERENCE_ADULT`, proibido nos
  demais relacionamentos;
- nome e CPF completos para cada pai ou mãe opcional;
- as oito respostas de saúde;
- explicação obrigatória para `YES` e proibida para `NO` ou `NOT_INFORMED`;
- instruções importantes apenas no uso de medicamento;
- limites de 2.000 caracteres para explicações e instruções e 5.000 para outros
  cuidados;
- todas as declarações afirmativas, inclusive autorização de imagem e voz.

CPF, RG, telefone, e-mail, CEP e nomes seguirão as regras canônicas do backend.
Máscaras serão somente de apresentação e não criarão outro formato de domínio.

### Campos derivados

Quando o relacionamento for `SELF`, nome, CPF e telefone do responsável serão
derivados dos dados do próprio Oratoriano e não serão solicitados novamente.

Quando o relacionamento for `MOTHER` ou `FATHER`, o respectivo snapshot familiar
será apresentado como derivado dos dados do responsável. A interface impedirá
que a pessoa preencha uma cópia contraditória.

Ao tentar concluir uma ficha inválida, um resumo acessível listará as etapas com
problemas e moverá o foco para o primeiro campo inválido.

## Snapshots e PDFs

### Geração

`Gerar PDF` exigirá `ORATORIANO_FORM_PDF_GENERATE` e executará:

1. criação explícita de um snapshot imutável;
2. atualização da lista metadata-only de snapshots;
3. renderização explícita do PDF daquele snapshot; e
4. download autenticado dos bytes.

O modo continuará derivado da origem:

- `PAPER_TRANSCRIPTION` produz `IDENTIFIED_BLANK`;
- `DIRECT_SYSTEM_ENTRY` produz `PREFILLED`.

A UI não enviará um modo concorrente.

### Correspondência com o rascunho

Os metadados mostrarão se o snapshot está ausente, atual ou desatualizado.

Para entrada direta, `draftRevision` diferente invalida o snapshot para
conclusão e exige nova geração e assinatura. Para transcrição de papel, a
transcrição posterior não invalida o snapshot identificado em branco, conforme
o contrato.

O backend continuará validando fingerprint, revisão, página e correspondência.

### Download privado

O adapter solicitará `responseType: "blob"` pelo client autenticado. O frontend
criará uma URL temporária, iniciará o download e a revogará imediatamente.

O nome oferecido será business-facing e não conterá UUID, por exemplo
`ficha-adicional-nome-versao-2.pdf`. Os bytes não entrarão no Query cache nem em
armazenamento persistente.

## Anexos assinados

### Seleção e validação preliminar

O seletor aceitará uma coleção completa em um dos formatos:

- um PDF de até 20 MiB; ou
- uma a dez imagens JPEG/PNG, cada uma com até 8 MiB e a coleção com até
  40 MiB.

PDF e imagens não poderão ser misturados. Imagens terão controles
keyboard-accessible para ordenar as páginas. O frontend validará tipo declarado,
quantidade e tamanho para feedback imediato; o backend validará os bytes e
continuará sendo a autoridade.

### Substituição atômica

O upload usará `FormData` com a chave `files` repetida na ordem escolhida. O
frontend explicará que a operação substitui toda a coleção existente e pedirá
confirmação quando já houver anexos.

Após sucesso:

- os objetos `File` serão descartados;
- somente `AttachmentRDTO` permanecerá em cache;
- detalhe e histórico serão reconciliados.

### Download posterior

Metadados e ações de download só aparecerão com
`ORATORIANO_FORM_ATTACHMENT_GET`. Cada download será explícito, usará blob
autenticado e preservará um filename original sanitizado para o navegador.

Nenhum anexo terá URL pública, prefetch ou visualização automática.

## Conclusão, substituição e revogação

### Pré-condições da interface

`Concluir ficha` ficará bloqueado enquanto houver:

- alterações não salvas;
- falha no schema completo;
- snapshot ausente ou incompatível;
- anexos ausentes; ou
- quantidade de páginas incompatível conhecida pelo frontend.

Essas verificações melhoram o feedback, mas não substituem a validação
transacional do backend.

### Comando de conclusão

A primeira tentativa enviará o snapshot selecionado com
`overwriteNewerProfileValues` ausente ou falso.

Se o backend responder
`ORATORIANO_FORM_PROFILE_OVERWRITE_CHOICE_REQUIRED`, a interface explicará que
dados do perfil registrados após a assinatura serão substituídos e pedirá uma
confirmação explícita. Somente então repetirá o comando com o valor verdadeiro.

`ORATORIANO_FORM_PROFILE_SOURCE_IS_NEWER` será bloqueante e orientará a usar uma
fonte de ficha mais recente, sem oferecer sobrescrita.

Após sucesso:

- histórico e detalhe da ficha serão invalidados;
- o detalhe sensível editável será removido do cache;
- perfil e lista de Oratorianos serão invalidados, pois nome, nascimento ou
  telefone podem ter sido sincronizados;
- limites do tracker que apresentam o Oratoriano serão invalidados; e
- a ficha passará a read-only.

### Revogação

Revogar exigirá `ORATORIANO_FORM_MANAGE`, motivo de 1 a 2.000 caracteres e
confirmação de que os valores já sincronizados no perfil não serão revertidos.
Após sucesso, histórico e detalhe serão reconciliados.

### Exclusão de rascunho

Excluir rascunho exigirá motivo de 1 a 2.000 caracteres. A confirmação explicará
que snapshots e anexos do rascunho também sairão do acesso ordinário. Após
sucesso, o cache sensível e dos artefatos será removido e a navegação voltará ao
histórico.

## Permissões e combinações incomuns

| Permissão | Uso |
| --- | --- |
| `ORATORIO_COORD_MANAGE` | conceder ou remover a designação |
| `ORATORIANO_MANAGE` | corrigir e excluir o perfil comum |
| `ORATORIANO_FORM_GET` | histórico e detalhe sensível |
| `ORATORIANO_FORM_MANAGE` | criar, editar, anexar, concluir, revogar e excluir rascunho |
| `ORATORIANO_FORM_PDF_GENERATE` | criar snapshots e renderizar PDFs |
| `ORATORIANO_FORM_ATTACHMENT_GET` | listar metadados privados e baixar anexos |

Cada affordance dependerá de sua permissão efetiva. Uma escrita que não possua
a leitura necessária para selecionar com segurança seu alvo ficará
indisponível, com explicação business-facing. O frontend não solicitará UUID e
não tratará papel como autoridade de autorização.

## Cache e dados sensíveis

O histórico metadata-only poderá usar o cache normal de TanStack Query.

O detalhe sensível:

- só será consultado ao abrir explicitamente a ficha;
- não terá prefetch;
- não fará refetch em background;
- será removido do cache ao abandonar a página;
- será removido em logout junto às demais queries; e
- será reconciliado explicitamente após mutações.

PDFs, bytes de anexos e objetos `File` não serão armazenados no Query cache. O
frontend não registrará dados pessoais em logs de console ou mensagens de erro.

## Apresentação e erros

`presentation.ts` da feature mapeará situações, origens, relacionamentos e
respostas de saúde para português, sempre com fallback neutro que não devolve o
valor bruto.

Serão adicionadas mensagens seguras para:

- `ORATORIANO_HAS_IMMUTABLE_FORMS`;
- `ORATORIANO_FORM_IMMUTABLE`;
- `ORATORIANO_FORM_NOT_CURRENT`;
- `ORATORIANO_FORM_PROFILE_OVERWRITE_CHOICE_REQUIRED`;
- `ORATORIANO_FORM_PROFILE_SOURCE_IS_NEWER`;
- `ORATORIANO_NAME_RESERVED`; e
- falhas de validação ou correspondência de arquivo.

`ORATORIANO_DELETED` e `ORATORIANO_NAME_RESERVED` não orientarão restauração.
Backend `message`, `details`, identifiers, stack traces e mensagens JavaScript
não serão renderizados.

Histórico, editor e artefatos deliberarão sobre loading, empty, error,
forbidden, retry, success e updating. Uma falha de uma seção não ocultará dados
válidos das outras.

## Acessibilidade e responsividade

- Etapas usarão títulos semânticos e controles alcançáveis por teclado.
- Todo campo terá label associado, descrição e mensagem de erro em português.
- Erros de conclusão serão anunciados e resumidos com links/foco para os
  campos.
- Ordenação de páginas não dependerá exclusivamente de drag and drop.
- Estados pendentes desabilitarão somente a ação incompatível.
- Focus management será preservado ao abrir confirmações e ao mudar de etapa.
- Tabelas ou grids de histórico terão alternativa legível em telas pequenas.
- Limites, tipos aceitos e consequência de substituição dos anexos serão
  informados antes do envio.

## Testes

### Testes de fronteira

- adapters de concessão, remoção e exclusão;
- payloads com motivo;
- histórico e detalhe das fichas;
- criação e substituição integral do rascunho;
- `FormData` com ordem de páginas;
- blobs de PDF e anexo;
- parsing seguro dos dados estruturados.

### Testes de schemas e regras puras

- motivo obrigatório e limites;
- schema parcial de rascunho;
- schema completo de conclusão;
- idade calculada em `signedOn`;
- menor, adulto e relacionamento `SELF`;
- CPF, RG, CEP, telefone e e-mail;
- parentes opcionais;
- oito perguntas de saúde e explicações;
- declarações obrigatórias;
- limites e ordem de arquivos;
- apresentação de valores desconhecidos.

### Testes de hooks e componentes

- decisão entre conceder e remover designação;
- visibilidade por permissão;
- Member ausente, inativo ou inconsistente;
- confirmação de exclusão;
- bloqueio por ficha imutável;
- ações por situação da ficha;
- invalidações após cada mutação;
- snapshot atual e desatualizado;
- substituição explícita de anexos;
- conflito de sobrescrita do perfil;
- remoção do cache sensível;
- navegação por teclado e resumo acessível de erros;
- ausência completa de controles e textos de restauração.

### Verificação

Cada fatia executará testes focados. Antes do handoff final serão executados:

```sh
npm test
npm run lint
npm run build
```

Upload e download também receberão verificação manual com o backend real, pois o
repositório não possui atualmente uma suíte de navegador ou integração ao vivo.
Essa verificação não será descrita como teste automatizado.

## Documentação

Após a implementação, serão atualizados:

- `docs/README.md`;
- `docs/architecture/overview.md`;
- `docs/integration/api.md`;
- `docs/guides/user-facing-language.md`; e
- `docs/backlog/steps.md`.

Os documentos registrarão como atual somente o que estiver entregue. A evolução
de contrato permanecerá marcada como dependência enquanto não estiver publicada
e regenerada no frontend.

## Critérios de aceite frontend

### Gestão da designação

- Uma Account autorizada consegue conceder ou remover a Coordenação do Oratório
  pelo fluxo Member-targeted.
- O motivo é obrigatório e nenhum UUID é mostrado ou solicitado.
- A UI reflete o papel autoritativo após a mutação.

### Exclusão

- Um perfil autorizado pode ser excluído com motivo.
- Presenças históricas permanecem reconciliadas.
- Rascunhos e artefatos recebem a consequência comunicada.
- Fichas imutáveis produzem feedback específico.
- Não existe jornada ou texto de restauração.

### Fichas

- As duas origens percorrem sua jornada completa.
- Um rascunho pode ser salvo parcialmente sem perder outras etapas.
- A conclusão aplica a matriz completa de validação.
- Snapshot, PDF e anexos continuam localizáveis depois de recarregar a
  aplicação.
- A entrada direta detecta snapshot desatualizado.
- Downloads são privados, explícitos e permission-aware.
- Conclusão, substituição, revogação e exclusão de rascunho reconciliam todos os
  caches afetados.
- Dados sensíveis e valores técnicos não escapam para armazenamento persistente
  ou interface.
