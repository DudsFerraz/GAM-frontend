# Plano de implementação — validação declarativa dos filtros de busca

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-08-08-declarative-search-filter-validation-design.md`.

O objetivo é impedir que regras de preenchimento previsíveis cheguem à API
como filtros inválidos. O componente compartilhado continuará sem chamadas
HTTP e sem conhecimento de Member, Account ou Event; cada configuração
continuará escolhendo as regras aplicáveis ao próprio recurso.

## 1. Confirmar o baseline

Executar antes de editar código:

```sh
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Registrar separadamente qualquer falha preexistente, em especial possíveis
incompatibilidades entre o contrato regenerado em
`src/api/generated/gam-api.ts` e os consumidores atuais. Não editar esse
arquivo gerado nem `src/routeTree.gen.ts`.

## 2. Definir o contrato de validação compartilhado

Arquivos:

- `src/components/SearchAndFilter/types.ts`
- `src/components/SearchAndFilter/index.ts`

Tarefas:

1. Adicionar o tipo `FilterValueValidator`, recebendo
   `SearchFilterValue` e `ComparisonMethod` e retornando `string | undefined`.
2. Adicionar `validateValue?: FilterValueValidator` a `FieldConfig`.
3. Exportar somente os tipos e utilitários necessários para as configurações
   das features; não expor estado interno do componente.
4. Manter o validador opcional para preservar integralmente as configurações
   existentes que não possuem regra adicional.

Verificação:

```sh
npm run lint -- src/components/SearchAndFilter/types.ts
```

## 3. Criar os validadores puros reutilizáveis

Arquivos:

- criar `src/components/SearchAndFilter/searchValidation.ts`
- criar `src/components/SearchAndFilter/searchValidation.test.ts`

Implementar primeiro os testes que falham e depois o código mínimo.

### E-mail

Criar `validateEmailSearchValue`:

1. rejeitar valor que não seja `string` com a mensagem segura de e-mail;
2. remover espaços somente das extremidades para validar;
3. para `LIKE`, verificar na ordem:
   - mínimo de três caracteres;
   - ponto sem `@`;
   - menos de dois caracteres antes do primeiro `@`;
4. para `EQUALS`, usar o validador de e-mail da dependência Zod já instalada;
5. retornar exatamente as mensagens aprovadas no spec;
6. não normalizar nem substituir o valor que será enviado ao callback.

### Limite máximo de texto

Criar um factory pequeno, por exemplo
`createTrimmedTextMaxLengthValidator(maxLength, message)`:

1. validar o comprimento depois de remover espaços das extremidades;
2. aceitar exatamente o limite;
3. rejeitar um caractere acima;
4. retornar a mensagem fornecida pela configuração da feature.

Testar todos os limites e regras do spec, incluindo valores escalares
inesperados, sem depender de componentes React.

Verificação:

```sh
npm test -- --run src/components/SearchAndFilter/searchValidation.test.ts
```

## 4. Validar o filtro avançado no componente

Arquivos:

- `src/components/SearchAndFilter/SearchAndFilter.tsx`
- `src/components/SearchAndFilter/SearchFilterPanel.tsx`
- `src/components/SearchAndFilter/SearchAndFilter.test.tsx`

Escrever primeiro um teste de comportamento com uma configuração de telefone
que possua validador:

1. selecionar Telefone e digitar `19`;
2. pressionar `Adicionar filtro`;
3. confirmar que nenhum chip foi criado e `onSearch` não recebeu o filtro;
4. confirmar a mensagem `Digite pelo menos 4 dígitos para pesquisar por telefone.`;
5. confirmar `aria-invalid="true"` e a associação por `aria-describedby`;
6. completar quatro dígitos e confirmar que a mensagem desaparece;
7. adicionar novamente e confirmar que o filtro original, operador e valor
   chegam a `onSearch` depois do debounce.

Implementação:

1. adicionar estado booleano que registre se houve tentativa de adicionar o
   filtro atual;
2. derivar a mensagem chamando `currentFieldConfig.validateValue` somente
   depois dessa tentativa;
3. no `handleAddFilter`, manter a checagem de vazio e interromper antes de
   atualizar `activeFilters` quando o validador retornar mensagem;
4. preservar `filterValue` na falha;
5. limpar a tentativa ao trocar campo ou operador e depois de uma inclusão
   válida;
6. durante a edição após uma falha, recalcular a mensagem para fazê-la sumir
   assim que o valor for aceito;
7. passar mensagem e identificador estável ao painel;
8. renderizar o texto junto da coluna Valor com `role="alert"`,
   `aria-invalid` e `aria-describedby`, preservando o alinhamento responsivo
   do botão de adicionar.

Verificação:

```sh
npm test -- --run src/components/SearchAndFilter/SearchAndFilter.test.tsx
```

## 5. Validar a pesquisa rápida automática

Arquivos:

- `src/components/SearchAndFilter/SearchAndFilter.tsx`
- `src/components/SearchAndFilter/SearchAndFilter.test.tsx`

Adicionar teste antes da implementação:

1. configurar um campo principal com limite máximo curto;
2. digitar um termo válido e confirmar o callback após 500 ms;
3. ultrapassar o limite e confirmar a mensagem associada ao campo;
4. confirmar que o callback seguinte recebe somente os filtros avançados e
   nunca inclui o termo inválido;
5. reduzir o texto ao limite e confirmar que a mensagem desaparece e a busca
   volta a incluir o termo.

Implementação:

1. localizar a configuração completa do `mainFilterField` e seu operador
   padrão;
2. derivar a mensagem do texto atual para apresentação imediata;
3. aplicar novamente o validador ao estado debounced antes de criar o filtro
   principal;
4. quando inválido, chamar `onSearch` somente com filtros avançados válidos,
   removendo qualquer termo principal anterior;
5. manter o debounce, a limpeza e o primeiro render silencioso atuais;
6. associar a mensagem ao campo de pesquisa com os mesmos atributos
   acessíveis usados pelo painel.

Verificação:

```sh
npm test -- --run src/components/SearchAndFilter/SearchAndFilter.test.tsx
```

## 6. Aplicar as regras de Member

Arquivos:

- `src/features/manage/members/memberSearchConfig.ts`
- criar `src/features/manage/members/memberSearchConfig.test.ts`

Tarefas:

1. Criar junto da configuração o validador específico de telefone, pois não
   existe segundo consumidor que justifique torná-lo compartilhado.
2. Para `LIKE`:
   - verificar os caracteres de formatação aprovados;
   - contar somente dígitos;
   - exigir quatro dígitos;
   - retornar as mensagens exatas do spec.
3. Para `EQUALS`, reutilizar a expressão já aceita pelo cadastro de Member,
   `^\+[1-9]\d{7,14}$`, sem importar o schema do formulário.
4. Associar esse validador a `phoneNumber`.
5. Associar `validateEmailSearchValue` a `email`.
6. Testar `19`, telefone formatado com quatro dígitos, caracteres inválidos,
   E.164 válido/inválido e a associação do validador de e-mail.
7. Não alterar os campos, operadores, valores, payloads ou defaults de status.

Verificação:

```sh
npm test -- --run src/features/manage/members/memberSearchConfig.test.ts
npm test -- --run src/features/manage/members/api/searchMembers.test.ts
```

## 7. Aplicar as regras de Account e Event

Arquivos:

- `src/features/manage/accounts/accountSearchConfig.ts`
- criar `src/features/manage/accounts/accountSearchConfig.test.ts`
- `src/features/manage/events/eventSearchConfig.ts`
- `src/features/manage/events/eventSearchConfig.test.ts`

### Account

1. Associar `validateEmailSearchValue` ao filtro `email`.
2. Associar ao campo principal `displayName` um validador de texto com limite
   de 50 caracteres e a mensagem aprovada.
3. Testar o limite exato, um caractere acima e as regras de e-mail por
   operador.
4. Preservar `toAccountSearch`, ordenação e payload atuais.

### Event

1. Associar ao campo principal `title` um validador de texto com limite de
   255 caracteres e a mensagem aprovada.
2. Acrescentar ao teste existente os casos do limite exato e um caractere
   acima.
3. Confirmar que `ORATORIO_SEARCH_CONFIG` continua derivado da configuração
   de Event sem transformar o parser de datas do Oratório em regra de título.
4. Preservar situação, tipo, filtros fixos e `toEventSearch` atuais.

Verificação:

```sh
npm test -- --run src/features/manage/accounts/accountSearchConfig.test.ts
npm test -- --run src/features/manage/events/eventSearchConfig.test.ts
```

## 8. Atualizar documentação atual

Arquivos:

- `docs/architecture/overview.md`
- `docs/guides/user-facing-language.md`

Tarefas:

1. Registrar na responsabilidade de `SearchAndFilter` que regras contratuais
   não evidentes podem ser declaradas pela configuração da feature.
2. Registrar que filtros inválidos permanecem locais, exibem mensagem em
   português e não substituem resultados por erro de carregamento.
3. Acrescentar à lista de verificação de linguagem a validação acessível dos
   filtros quando o contrato define limites ou formatos adicionais.
4. Separar comportamento implementado de qualquer regra futura do backend.

## 9. Revisão e validação final

Executar:

```sh
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Revisar o diff para confirmar:

1. nenhum filtro inválido é passado a `onSearch`;
2. a mensagem some apenas quando o valor é aceito ou o contexto do campo muda;
3. valores válidos preservam o payload original;
4. mensagens são portuguesas, acessíveis e não expõem respostas do backend;
5. filtros sem validador mantêm o comportamento anterior;
6. datas, selects, Oratoriano e parser de datas de Oratório não foram
   ampliados sem necessidade;
7. `src/api/generated/gam-api.ts` e `src/routeTree.gen.ts` não foram editados.

Solicitar revisão de código independente e corrigir todos os achados críticos
ou importantes antes da entrega. Reportar falhas preexistentes de build
separadamente de regressões da implementação.

## 10. Commits sugeridos

Os commits de implementação serão executados somente quando solicitados. A
separação sugerida é:

1. `test(search): cover declarative filter validation`
2. `fix(search): validate filters before API requests`
3. `docs(search): document declarative filter validation`

Os comandos de staging devem usar a lista real de arquivos do diff final e
nunca incluir alterações preexistentes ou artefatos gerados.
