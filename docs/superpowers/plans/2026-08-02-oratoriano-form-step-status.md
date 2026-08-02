# Plano de implementação — status das etapas da ficha adicional

## Referência

Implementar a spec aprovada em
`docs/superpowers/specs/2026-08-02-oratoriano-form-step-status-design.md` para
resolver a issue #2 no frontend.

## 1. Confirmar baseline e contrato local

- Revisar a configuração `STEPS`, o mapper e os schemas da feature.
- Executar testes focados do editor e do schema para registrar o baseline.
- Não alterar `src/api/generated/gam-api.ts` nem criar rotas/DTOs.

## 2. Criar o avaliador de estados

Arquivo: `src/features/manage/oratorianoForms/stepStatus.ts`.

1. Definir `OratorianoFormStepStatus` com `complete`, `invalid` e `incomplete`.
2. Receber os valores atuais e os paths de cada etapa.
3. Executar o schema de conclusão uma vez por avaliação.
4. Associar issues aos paths da etapa.
5. Considerar inválido o issue cujo valor atual esteja preenchido.
6. Considerar pendente o issue cujo valor esteja ausente ou a etapa esteja
   completamente vazia.
7. Aplicar prioridade `invalid > incomplete > complete`.
8. Calcular a etapa de revisão como agregação das quatro etapas anteriores.
9. Adicionar testes unitários para CPF inválido, ausência condicional, etapa
   vazia, valor válido, prioridade e agregação.

## 3. Integrar o stepper ao editor

Arquivo: `src/features/manage/oratorianoForms/components/OratorianoFormEditor.tsx`.

1. Reutilizar a configuração existente das cinco etapas no avaliador.
2. Observar o estado atual do React Hook Form sem duplicar valores em React
   state.
3. Remover a regra `index < activeStep` como fonte de check.
4. Renderizar `Check`, `X` e alerta amarelo conforme o estado calculado.
5. Manter a etapa ativa distinguível por borda/foco sem ocultar seu indicador.
6. Rastrear etapas visitadas; mostrar número neutro e sem alerta nas etapas
   ainda não iniciadas.
7. Traduzir os estados para labels acessíveis e adicionar legenda do stepper.
8. Validar campos obrigatórios ao avançar, bloquear somente a ausência desses
   campos, manter a volta livre e continuar validando formatos em tempo real
   com React Hook Form.
9. Normalizar falhas do `PUT` de rascunho e apresentar uma mensagem específica
   para valores preenchidos inválidos, deixando explícito que seções vazias
   podem ser salvas para preenchimento posterior.
10. Normalizar representações `null` ou vazias da resposta autoritativa antes
    do schema de transporte, preservando a rejeição de valores preenchidos
    incompatíveis.

## 4. Cobrir o comportamento no componente

Arquivo: `src/features/manage/oratorianoForms/components/OratorianoFormEditor.test.tsx`.

- Verificar os nomes acessíveis dos cinco botões no estado inicial.
- Confirmar que etapas futuras começam apagadas e anunciam “ainda não iniciada”.
- Preencher CPF inválido, avançar e confirmar estado vermelho da etapa 1.
- Ir para etapa 2 sem preencher e confirmar estado amarelo.
- Acessar a etapa 5 diretamente e confirmar que seu estado agregado só aparece
  depois da visita.
- Confirmar que o avanço e a troca direta continuam funcionando.
- Confirmar que o avanço bloqueia campos obrigatórios ausentes, enquanto o
  retorno não dispara validação de etapa.
- Confirmar que um valor corrigido deixa de apresentar estado inválido.
- Confirmar que a etapa 5 não fica verde enquanto houver etapas pendentes ou
  inválidas.
- Preservar os testes existentes de payload, dirty state, erro de salvamento e
  status read-only.
- Cobrir o salvamento com somente dados válidos da primeira etapa e a mensagem
  contextual para uma rejeição de validação do rascunho.
- Cobrir a leitura de uma resposta de rascunho incompleta com campos vazios
  representados pelo servidor.
- Cobrir a presença visual e semântica dos asteriscos nos campos obrigatórios e
  o salvamento parcial sem validação nativa do navegador.

## 5. Atualizar documentação atual

Após a implementação, atualizar somente as descrições que afirmam o
comportamento do editor em:

- `docs/README.md`;
- `docs/architecture/overview.md`;
- `docs/guides/user-facing-language.md`, se necessário para registrar a
  apresentação dos estados.

Manter explícita a diferença entre rascunho incompleto navegável e ficha válida
para conclusão. Não documentar conclusão, anexos ou revogação como implementados.

## 6. Verificação e entrega

Executar:

```sh
npm test -- --run src/features/manage/oratorianoForms
npm run lint
npm run build
git diff --check
```

Revisar a diff contra os critérios de aceite, corrigir problemas encontrados e
produzir um comentário curto em português para a issue, descrevendo a causa e a
solução sem alegar mudanças no backend.
