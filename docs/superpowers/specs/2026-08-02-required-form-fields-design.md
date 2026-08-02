# Indicadores de campos obrigatórios nos formulários

## Status

Design aceito para implementação. Esta especificação registra o comportamento planejado para tornar campos obrigatórios identificáveis em todos os formulários atuais do frontend.

## Contexto

Os schemas e as mensagens de validação já distinguem campos obrigatórios e opcionais, mas os rótulos atuais não comunicam essa diferença antes da submissão. O padrão também não é uniforme: formulários com React Hook Form usam `FormLabel`, enquanto buscas, filtros e alguns controles compostos usam `Label`, `legend` ou rótulos próprios.

A mudança é exclusivamente de apresentação e semântica de formulário no frontend. Ela não altera schemas, contratos de API, permissões, payloads, mensagens de validação ou regras de negócio.

## Objetivos

- Exibir `*` junto ao rótulo de todo campo atualmente obrigatório.
- Expor a obrigatoriedade de modo acessível com `aria-required` e `required` nos controles compatíveis.
- Manter a validação atual do React Hook Form e do Zod como fonte das mensagens em português.
- Aplicar o comportamento aos formulários de autenticação, cadastro, edição, remoção, transições, planejamento, presença e ficha adicional.
- Preservar campos opcionais, buscas e filtros sem marcador.
- Centralizar a convenção nos componentes de formulário para reduzir repetição e inconsistência futura.

## Fora de escopo

- Tornar campos opcionais obrigatórios.
- Alterar regras ou mensagens dos schemas Zod.
- Exibir marcadores em filtros ou buscas cujo estado vazio já é válido.
- Adicionar uma biblioteca de internacionalização ou um sistema genérico de metadados de schemas.
- Alterar o contrato do backend, payloads, rotas ou permissões.
- Redesenhar o layout dos formulários além do espaço necessário para o marcador.

## Direção aceita

`FormItem` receberá uma prop `required?: boolean`. Quando `required` for verdadeira:

1. `FormLabel` exibirá o texto do rótulo, um `*` decorativo e uma descrição oculta para tecnologia assistiva.
2. `FormControl` propagará `required` e `aria-required="true"` para o controle filho quando a estrutura permitir.
3. O componente `Label` e um novo `FormLegend` reutilizarão o mesmo indicador para campos nativos fora do fluxo padrão de `FormLabel` e para grupos de rádio.
4. Formulários que usam validação própria continuarão com `noValidate`, evitando que a validação nativa do navegador substitua as mensagens explícitas em português do Zod/RHF.

O texto oculto será `obrigatório`, enquanto o `*` não será anunciado isoladamente. O marcador será parte do rótulo visual e manterá contraste suficiente nos temas claro e escuro.

### Campos condicionais

Um campo que só é obrigatório sob determinada condição receberá uma expressão booleana, não uma regra duplicada no componente visual. O motivo da alteração de público no Event, por exemplo, será marcado somente quando o público selecionado diferir do público atual. Motivos de exclusão, remoção, transição e decisão serão marcados sempre que o schema correspondente exigir conteúdo.

### Controles compostos

Seletores de conta ou pessoa, grupos de rádio e outros controles que não são um único `input` nativo receberão `aria-required` no grupo e `required` nos elementos nativos quando aplicável. O rótulo do grupo usará `FormLegend` ou o equivalente semântico; a busca interna do seletor continuará opcional quando a seleção final for o único valor obrigatório.

## Inventário de aplicação

Os campos serão marcados conforme a regra efetiva dos schemas e das condições atuais:

- Login e registro de Account: todos os campos apresentados.
- Registro e transições de Member: conta, nome, sobrenome, data, telefone e motivos exigidos pela ação.
- Solicitação de ingresso e decisão da solicitação: todos os campos do envio e o motivo da decisão.
- Oratoriano: nome e sobrenome no registro; nome e sobrenome na correção; motivo condicional da correção; motivo da exclusão.
- Events: título, local, início e término; descrição e público permanecem sem marcador quando o contrato aceita valor vazio. Motivos de alteração e ciclo de vida seguem suas condições de negócio.
- Presenças: seleção de Member quando o fluxo a exige e motivos de edição/remoção conforme o schema; observações permanecem opcionais.
- Locations: nome, cidade e estado; endereço, código postal e coordenadas permanecem opcionais conforme o schema.
- Oratórios: data de criação e motivos de ciclo de vida/remoção; textos de planejamento e buscas permanecem opcionais.
- Fichas adicionais: origem da ficha e motivo de exclusão; o editor de rascunho mantém sem marcador os campos que podem ser salvos incompletos. Regras condicionais de conclusão só serão marcadas se o campo ficar efetivamente obrigatório no fluxo de edição atual.
- Buscas e filtros de Members, Accounts, Events, Oratórios, Oratorianos e solicitações: sem marcador, pois o valor vazio é aceito para consultar o conjunto padrão.

## Limites de implementação

- `FormItem` continuará sendo o contexto de um único campo e não fará inferência automática a partir de nomes ou schemas.
- A prop `required` será declarada junto ao `FormItem`, mantendo a decisão de apresentação próxima do campo renderizado.
- `FormControl` não substituirá a validação de schema; sua responsabilidade será apenas propagar a semântica de obrigatoriedade ao controle.
- Valores de transporte, nomes técnicos, erros do navegador e mensagens padrão de bibliotecas não serão renderizados como copy de interface.
- Campos ocultos internos, como `countryCode`, não receberão rótulo visual nem marcador.

## Componentes e fluxo de dados

O fluxo ficará assim:

```text
FormItem(required)
  -> contexto do campo
  -> FormLabel / FormLegend: marcador visual e texto acessível
  -> FormControl: required + aria-required no controle
  -> input/select/textarea/radio: semântica nativa quando suportada
```

Os componentes de feature apenas informarão se o campo é obrigatório; não haverá API, hook, estado global ou persistência novos. O valor enviado continuará sendo o mesmo valor produzido pelos controles atuais.

## Acessibilidade e linguagem

- Os rótulos continuarão associados aos controles por `htmlFor`/`id` nos campos simples.
- Grupos de rádio usarão `fieldset`/`legend` e controles com o mesmo `name`.
- O `*` será redundante e decorativo para leitores de tela; a palavra `obrigatório` será fornecida em texto oculto.
- `aria-required="true"` será usado no controle ou grupo quando a obrigatoriedade for aplicável.
- O atributo `required` será usado nos controles nativos compatíveis, com `noValidate` nos formulários que já possuem validação explícita.
- O texto de interface e o texto acessível permanecerão em português brasileiro.

## Verificação

Testes focados devem comprovar:

- `FormItem required` faz `FormLabel` renderizar o marcador e o texto acessível.
- Campos opcionais não exibem marcador nem recebem `required`/`aria-required`.
- `FormControl` propaga a semântica ao controle nativo.
- `FormLegend` cobre o grupo de rádio da origem da ficha adicional.
- A obrigatoriedade condicional do motivo de alteração de Event acompanha a seleção atual.
- Formulários e filtros existentes preservam seus estados e mensagens atuais.

Após a implementação, executar a suíte de testes, `npm run lint` e `npm run build`.

## Critérios de aceite

1. Todo campo obrigatório dos formulários atuais exibe `*` no rótulo.
2. O significado de obrigatoriedade é anunciado de forma acessível.
3. Controles nativos obrigatórios recebem `required` e `aria-required` sem mudar as mensagens Zod/RHF.
4. Campos opcionais, buscas e filtros continuam sem `*`.
5. Regras condicionais atualizam o marcador conforme a condição real do formulário.
6. Grupos compostos e de rádio permanecem semanticamente associados ao rótulo.
7. Nenhum payload, rota, schema, contrato ou regra de autorização é alterado.
8. Testes, lint e build passam sem regressões.
