# Spec — status das etapas da ficha adicional (issue #2)

## Status do documento

Design aprovado para implementação no frontend. O comportamento descrito nesta
spec passa a ser considerado atual somente depois da implementação e das
verificações finais.

## Contexto

O editor de fichas adicionais em
`/manage/oratorios/oratorianos/$oratorianoId/fichas/$formId` permite navegar
entre as cinco etapas de um rascunho. Hoje o stepper transforma qualquer etapa
anterior à etapa ativa em check verde. Isso comunica conclusão mesmo quando a
etapa contém um valor inválido, como um CPF inválido, ou quando nunca recebeu
preenchimento.

O rascunho deve continuar salvável de forma incremental, mas a navegação para
frente deve exigir o preenchimento dos campos obrigatórios da etapa atual. A
volta e a troca para uma etapa anterior continuam livres; o stepper deve
comunicar o estado da ficha sem transformar o salvamento em conclusão.

## Objetivos

- Diferenciar visual e semanticamente etapa concluída, etapa inválida e etapa
  pendente.
- Reutilizar `oratorianoFormCompletionSchema` como fonte da matriz de
  conclusão, sem duplicar regras condicionais no componente visual.
- Mostrar o estado com clareza depois que o usuário visitar uma etapa.
- Exigir os campos obrigatórios somente para avançar e manter o salvamento
  incremental do rascunho.
- Preservar o padrão visual, responsivo e acessível já usado pelo editor.

## Não objetivos

- Alterar o payload, as rotas, o contrato gerado ou a política de salvamento.
- Transformar o salvamento de rascunho em conclusão da ficha.
- Implementar conclusão, anexos, revogação ou geração de PDF.
- Criar uma segunda lista manual de regras obrigatórias.

## Comportamento aprovado

As etapas 1 a 4 serão avaliadas com os valores atuais do único React Hook Form.
O avaliador executará `oratorianoFormCompletionSchema.safeParse(values)` e
associará os issues aos paths da etapa correspondente.

Cada etapa terá exatamente um dos estados:

| Estado | Regra | Indicador |
| --- | --- | --- |
| Concluída | Não há issue da etapa e ela contém conteúdo relevante | Check verde |
| Inválida | Há ao menos um valor preenchido que falha na validação de conclusão | X vermelho |
| Pendente | Há falha causada por ausência de valor obrigatório ou a etapa está completamente vazia | Alerta amarelo |

Quando uma etapa tiver simultaneamente valor inválido e campo obrigatório
ausente, o estado vermelho terá prioridade para destacar a correção mais
urgente. A classificação não dependerá de etapa anterior, `touched`, `dirty` ou
de o campo estar montado no DOM.

O conteúdo relevante considera texto não vazio, seleção não vazia e booleanos
explicitamente definidos, incluindo `false` quando este for uma resposta válida.
Uma etapa vazia será amarela para não ser confundida com uma etapa concluída,
mesmo quando uma regra condicional do schema ainda não tiver sido ativada.

No stepper, etapas ainda não visitadas terão uma apresentação adicional neutra:
ficam apagadas, exibem apenas o número e não mostram alerta. A etapa 1 começa
como visitada. O avanço ou o clique direto para uma etapa posterior valida os
campos obrigatórios da etapa atual; se houver ausência, a troca é bloqueada e o
foco vai para o primeiro campo pendente. `Voltar` e o clique direto para uma
etapa anterior não exigem validação. Depois da primeira visita, a etapa passa a
exibir seu estado verde, vermelho ou amarelo. Esse estado neutro é apenas de
navegação e não altera a classificação do avaliador nem a regra de salvamento.

A etapa 5 não possui campos próprios. Seu estado será agregado:

1. vermelho se qualquer etapa 1–4 for inválida;
2. amarelo se nenhuma for inválida e alguma estiver pendente;
3. verde somente quando todas as etapas 1–4 estiverem concluídas.

## Navegação e salvamento

`Avançar` e os botões do stepper que apontarem para uma etapa posterior
validarão os campos obrigatórios da etapa atual. A ausência de um campo
obrigatório interromperá a troca, exibirá a mensagem no campo e focará o
primeiro pendente. `Voltar` e os botões que apontarem para etapas anteriores
continuarão livres de validação. Um valor preenchido, mas inválido, será
validado imediatamente pelo React Hook Form e ficará explícito no campo e no
stepper; ele não impede a navegação, preservando a regra de rascunho da issue.
`Salvar rascunho` continuará usando o schema de rascunho atual: valores
inválidos não serão enviados, enquanto valores válidos e incompletos
continuarão podendo ser salvos.

Falhas de validação retornadas ao salvar devem explicar essa distinção: etapas
vazias podem permanecer para depois, mas os valores já preenchidos precisam
estar em formato válido. A operação de substituição normaliza o erro HTTP na
fronteira da feature, sem exibir payload, mensagem técnica ou detalhes do
servidor; conflitos continuam seguindo o fluxo de atualização autoritativa. A
resposta autoritativa também pode representar campos não preenchidos como
`null` ou texto vazio; esses valores são normalizados como ausentes antes da
validação da resposta, sem relaxar a validação dos valores não vazios.

## Apresentação e acessibilidade

- O check será renderizado por `Check`, o erro por `X` e a pendência por um
  ícone de alerta amarelo do conjunto Lucide já usado no projeto.
- A etapa ativa continuará destacada, mas sem substituir o ícone de estado por
  um número azul que esconda a situação real.
- Cada botão anunciará o título da etapa e seu estado em português.
- Etapas ainda não iniciadas anunciarão “ainda não iniciada” e não anunciarão
  uma pendência antes de o usuário acessá-las.
- Campos obrigatórios exibirão `*`, `aria-required` e uma descrição acessível;
  a validação nativa do navegador ficará desativada para não bloquear o
  salvamento parcial, que será controlado pelo React Hook Form.
- Uma legenda curta do stepper explicará os três estados visuais.
- Os estilos usarão os tokens/classes existentes para borda, fundo, foco,
  contraste, modo escuro e responsividade.
- Nenhum enum, código de permissão, mensagem técnica ou valor de diagnóstico
  será renderizado diretamente.

## Arquitetura e arquivos

- `src/features/manage/oratorianoForms/stepStatus.ts` concentrará o tipo de
  estado e o avaliador testável, recebendo valores e a configuração das etapas.
- `OratorianoFormEditor.tsx` observará os valores do formulário, usará o
  avaliador para o stepper e manterá a composição da página e a navegação.
- `OratorianoFormEditor.test.tsx` cobrirá os estados e a navegação observável.
- Um teste unitário do avaliador cobrirá a classificação sem depender do DOM.
- `docs/architecture/overview.md` e `docs/README.md` serão atualizados apenas
  para registrar o comportamento atual implementado; a matriz de conclusão
  continuará pertencendo ao schema da feature.

## Critérios de aceite

1. CPF preenchido com valor inválido deixa a etapa 1 vermelha, sem impedir o
   avanço, e o campo mostra a mensagem de validação enquanto é editado.
2. A ausência de campo obrigatório impede o avanço, mas não impede voltar ou
   salvar o rascunho.
3. Uma etapa completamente vazia fica amarela e nunca recebe check verde apenas
   por ter sido visitada.
4. Uma etapa com valores válidos e sem pendências fica verde.
5. A etapa 5 agrega os estados das etapas 1–4 conforme a prioridade definida.
6. Corrigir um valor inválido atualiza o indicador sem recarregar a página.
7. A troca direta para trás pelo stepper não valida a etapa atual; a troca para
   frente respeita os campos obrigatórios.
8. O salvamento continua enviando somente dados aceitos pelo schema de rascunho
   e continua aceitando rascunhos válidos incompletos.
9. Os indicadores têm nomes acessíveis em português e foco visível; os campos
   obrigatórios têm asterisco e semântica acessível.
10. Os testes focados, `npm run lint`, `npm run build` e `git diff --check`
   passam, ou falhas preexistentes são reportadas separadamente.
