# Busca de Ocorrências de Oratório por data

## Status

Aprovada pelo usuário em 2026-08-02.

## Contexto atual

A tela de Ocorrências reutiliza o componente compartilhado
`SearchAndFilter`, mas configura sua pesquisa rápida com o campo `title`.
Os cards de Oratório não apresentam um título: identificam a ocorrência pela
data de `beginDate`, formatada no fuso `America/Sao_Paulo` como, por exemplo,
`02 de agosto de 2026`. Por isso, buscar pelo dia exibido no card não produz
uma consulta compatível com o conteúdo apresentado.

O contrato gerado de Eventos permite filtrar `beginDate` por
`GREATER_THAN_OR_EQUAL` e `LESS_THAN_OR_EQUAL`, usando timestamps UTC RFC 3339.
Não é necessário criar rota, filtro backend ou DTO frontend paralelo.

## Objetivo e escopo

Na lista de Ocorrências, a pesquisa rápida deve:

- continuar usando o `SearchAndFilter` compartilhado e seu debounce atual;
- aceitar `DD/MM/AAAA`;
- aceitar a data longa mostrada no card, `DD de <mês> de AAAA`, em português;
- aceitar termos parciais da data apresentada, como `01`, `setembro`,
  `2026`, `01 de setembro` e `01/09`;
- converter a data informada em um intervalo que cubra o dia civil no fuso
  `America/Sao_Paulo`;
- preservar o filtro fixo `type = ORATORIO`, filtros de situação, ordenação,
  paginação e estados assíncronos existentes.

Eventos comuns continuarão usando a pesquisa rápida por título. Nenhuma outra
tela que consome `SearchAndFilter` ou `searchEvents` deve mudar de semântica.

## Arquitetura e fluxo de dados

1. `ManageOratoriosPage` continuará renderizando `SearchAndFilter`, mas
   informará `beginDate` como o campo principal da busca rápida.
2. A configuração específica de Ocorrências apresentará um rótulo de data
   para esse campo; a configuração de Eventos permanecerá com título.
3. O adaptador de busca de Eventos reconhecerá o filtro rápido de
   `beginDate`. Datas completas serão mapeadas para dois valores internos:
   `beginDateFrom` e `beginDateTo`.
4. Termos parciais serão mantidos como um texto interno exclusivo da busca de
   Ocorrências. Um hook pertencente ao Oratório buscará todas as páginas do
   `POST /events/search` com os filtros de situação, tipo e ordenação já
   escolhidos, filtrará os resultados pela data longa e curta apresentada no
   card e paginará a coleção filtrada no navegador.
5. `searchEvents` continuará serializando datas completas como filtros de
   intervalo no corpo de `POST /events/search`, junto do filtro fixo `ORATORIO`
   quando aplicável. O texto parcial não será enviado como `LIKE` de
   `beginDate`, pois esse operador não é aceito pelo contrato.
6. A consulta continuará usando a chave existente do TanStack Query, com a
   página reiniciada pela página ao receber a nova busca.

A conversão de limites usará o mesmo fuso da apresentação do card. O início
será o primeiro instante do dia e o fim será o último milissegundo do dia,
ambos convertidos para UTC antes do envio.

## Compatibilidade

- `SearchAndFilter` não receberá uma segunda implementação nem mudará sua
  interação, debounce, limpeza, filtros ou ordenação.
- A busca de Eventos continuará gerando um filtro `title LIKE`.
- A busca de Ocorrências deixará de gerar `title LIKE` para o termo principal,
  mas continuará aceitando o filtro de situação e as ordenações atuais.
- Uma busca parcial pode carregar mais de uma página antes de exibir o
  resultado, mas a paginação apresentada ao usuário continuará sendo de 12
  cards e refletirá somente os itens correspondentes.
- O arquivo gerado `src/api/generated/gam-api.ts` não será editado.
- Nenhuma rota, permissão, contrato backend, card ou detalhe de Oratório será
  alterado.

## Validação e casos inválidos

O parser aceitará meses em português, sem depender do parser textual nativo
de `Date`, e validará dia, mês e ano antes de construir os limites quando a
data for completa. Espaços, capitalização e acentos poderão variar sem mudar
o resultado. Termos incompletos não serão tratados como erro: serão
comparados, de forma normalizada, com a data longa e a data curta renderizadas
no card. A implementação não apresentará mensagens técnicas nem enviará um
termo parcial como filtro `LIKE` de `beginDate`.

## Testes

Serão adicionados testes focados para:

- conversão de `02/08/2026` em limites do dia;
- conversão de `02 de agosto de 2026` em limites equivalentes;
- correspondência de `01`, `setembro`, `2026`, `01 de setembro` e `01/09`
  contra as datas apresentadas nos cards;
- carregamento e combinação de todas as páginas para uma busca parcial;
- paginação local dos resultados parciais;
- preservação do filtro fixo `ORATORIO` e da situação ao adaptar a busca;
- serialização dos filtros `beginDate` com os operadores aceitos;
- preservação da serialização de título para a busca de Eventos.

Os testes existentes de `SearchAndFilter` e das demais páginas continuarão
sendo executados para proteger o componente compartilhado e as outras
consultas.

## Fora de escopo

- Alterar o backend ou regenerar o contrato.
- Filtrar somente a página já carregada no navegador, sem consultar as demais
  páginas do backend.
- Criar uma nova barra de busca específica para Oratório.
- Alterar a busca por nome, título, e-mail ou outros campos das demais telas.
- Adicionar filtros que não sejam suportados pelo contrato atual.
