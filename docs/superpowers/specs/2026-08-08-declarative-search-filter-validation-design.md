# Validação declarativa dos filtros de busca

## Problema

O componente compartilhado `SearchAndFilter` aceita qualquer texto não vazio. Algumas buscas do contrato, porém, aplicam regras adicionais que não são evidentes na interface. Hoje esses valores são enviados ao backend, a requisição é rejeitada e a página substitui os resultados por um erro genérico de carregamento.

O caso observado ocorre na busca de Members: `phoneNumber` com `LIKE` remove a formatação comum do telefone, mas exige pelo menos quatro dígitos. Ao adicionar `19`, a interface aceita o filtro embora o contrato o rejeite.

## Comportamento atual e comportamento aceito

### Atual

- O botão de adicionar verifica somente se o valor está vazio.
- A pesquisa rápida envia qualquer texto não vazio depois do debounce.
- Regras específicas do campo ou do operador são descobertas somente após uma resposta de erro da API.
- O erro de validação parece uma falha de carregamento da página.

### Aceito

- Cada `FieldConfig` pode declarar uma função opcional de validação do valor e do operador selecionado.
- A configuração da feature continua sendo responsável pelas regras e pelas mensagens em português.
- O componente compartilhado executa o validador, apresenta seu resultado de modo acessível e nunca envia um filtro que falhou nessa validação.
- A mensagem permanece enquanto o valor for inválido e desaparece automaticamente assim que a regra for satisfeita.
- Filtros sem validador preservam o comportamento atual.

## Escopo dos campos

### Telefone de Member

Para `LIKE` (`Contém`):

- ignorar espaços, parênteses, hífen, ponto e sinal de adição ao contar os dígitos;
- exigir pelo menos quatro dígitos;
- aceitar somente dígitos e esses sinais comuns de formatação.

Mensagens:

- `Digite pelo menos 4 dígitos para pesquisar por telefone.`
- `Use somente números e sinais comuns de telefone, como +, espaços, parênteses ou hífen.`

Para `EQUALS` (`Igual a`), exigir o telefone canônico E.164 com a mesma regra já usada no cadastro de Member: `+`, primeiro dígito entre 1 e 9 e de 8 a 15 dígitos no total.

Mensagem:

- `Informe o telefone completo no formato internacional, como +5519999999999.`

### E-mail de Member e Account

Os dois recursos publicam a mesma regra de busca e devem reutilizar o mesmo validador.

Para `LIKE` (`Contém`):

- exigir pelo menos três caracteres após remover espaços das extremidades;
- quando houver `@`, exigir pelo menos dois caracteres antes dele;
- não aceitar ponto sem `@`.

Mensagens:

- `Digite pelo menos 3 caracteres para pesquisar por e-mail.`
- `Digite pelo menos 2 caracteres antes de @.`
- `Inclua @ ao pesquisar um trecho de e-mail que contenha ponto.`

Para `EQUALS` (`Igual a`), exigir um endereço completo aceito pelo validador de e-mail já disponível no projeto.

Mensagem:

- `Digite um e-mail completo e válido.`

### Limites de texto da pesquisa rápida

- `Account.displayName`: no máximo 50 caracteres após remover espaços das extremidades.
  - Mensagem: `Digite no máximo 50 caracteres para pesquisar por nome de exibição.`
- `Event.title`: no máximo 255 caracteres após remover espaços das extremidades.
  - Mensagem: `Digite no máximo 255 caracteres para pesquisar por título.`

### Fora do escopo

- Datas, porque o controle nativo já produz o formato de calendário esperado nos filtros editáveis.
- Situações e tipos, porque opções fechadas impedem valores livres.
- Nome de Member e Oratoriano, porque o contrato não publica outro limite além de texto não vazio.
- Alterações no contrato gerado, na API, nos endpoints ou nas regras do backend.

## Arquitetura

### Contrato declarativo

`src/components/SearchAndFilter/types.ts` adicionará ao `FieldConfig` um validador opcional com a forma conceitual:

```ts
type FilterValueValidator = (
  value: SearchFilterValue,
  comparisonMethod: ComparisonMethod,
) => string | undefined
```

`undefined` representa um valor aceito. Uma `string` é uma mensagem de apresentação em português e bloqueia o filtro. O componente não interpreta a mensagem nem conhece regras de telefone, e-mail, Member, Account ou Event.

Validadores puros reutilizados por mais de uma feature ficarão em um módulo compartilhado de validação do `SearchAndFilter`. As configurações das features escolherão explicitamente quais validadores aplicar. Regras usadas por apenas uma feature continuarão declaradas junto da configuração dessa feature até existir reutilização real.

### Filtro avançado

Ao pressionar o botão de adicionar:

1. o componente mantém a verificação existente de valor vazio;
2. executa o validador do campo com o valor e o operador atuais;
3. se houver mensagem, mantém o texto digitado, não cria o filtro e não altera a busca;
4. se o valor for aceito, adiciona o filtro e limpa o estado de edição como hoje.

Depois de uma tentativa inválida, a mensagem será derivada novamente a cada mudança. Ela desaparecerá somente quando o valor passar na regra ou quando a pessoa trocar de campo ou operador.

### Pesquisa rápida

A pesquisa rápida usa o mesmo validador declarado pelo campo principal e seu operador padrão. Um termo inválido não entra no array enviado a `onSearch`. Depois do debounce, o callback recebe somente os filtros avançados válidos, removendo uma pesquisa rápida válida anterior sem enviar o novo termo inválido.

O limite continua visualmente associado ao campo e desaparece assim que o termo se torna válido. A pesquisa automática de 500 ms e o botão `Limpar busca` permanecem inalterados.

## Apresentação e acessibilidade

- A mensagem aparece imediatamente abaixo do controle correspondente.
- O campo inválido recebe `aria-invalid="true"`.
- A mensagem recebe um identificador estável e é ligada ao campo por `aria-describedby`.
- A mensagem usa `role="alert"` quando surge após a tentativa de adicionar um filtro.
- O layout continua responsivo e reserva a mensagem dentro da coluna do valor, sem criar uma página de erro.
- Nenhuma mensagem do backend, código de validação ou valor técnico é renderizado.

## Testes

### Validadores puros

Cobrir:

- telefone `LIKE` com menos de quatro dígitos, quatro dígitos e formatação comum;
- caracteres de telefone não aceitos;
- telefone `EQUALS` válido e inválido;
- e-mail `LIKE` curto, com `@` precoce, com ponto sem `@` e aceito;
- e-mail `EQUALS` completo e inválido;
- limites de 50 e 255 caracteres, incluindo os valores exatos e um caractere acima.

### Componente compartilhado

Cobrir comportamento observável:

- `19` não é adicionado como filtro de telefone e exibe a mensagem acessível;
- ao chegar a quatro dígitos, a mensagem desaparece;
- o filtro válido é adicionado e enviado sem alterar campo, operador ou valor;
- uma pesquisa rápida acima do limite não envia o termo inválido;
- configurações sem validador continuam funcionando.

### Configurações das features

Verificar que os validadores corretos estão associados a:

- telefone e e-mail de Member;
- e-mail de Account;
- nome de exibição de Account;
- título de Event.

## Documentação e validação final

Atualizar a arquitetura e o guia de linguagem de interface para registrar que filtros com regras contratuais não evidentes usam validação declarativa, mensagens em português e bloqueio local antes da API.

Executar o teste focado do componente e dos validadores, a suíte completa, `npm run lint` e `npm run build`. Falhas preexistentes ou externas ao escopo devem ser separadas de regressões desta implementação.
