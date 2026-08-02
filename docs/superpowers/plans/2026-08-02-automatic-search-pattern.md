# Plano de implementação — padrão de busca automática

## Referência

Implementar a especificação aprovada em
`docs/superpowers/specs/2026-08-02-automatic-search-pattern-design.md`.

## 1. Criar a primitiva compartilhada

Arquivos:

- `src/hooks/useDebouncedValue.ts`
- `src/hooks/useDebouncedValue.test.ts`
- `src/components/SearchClearButton.tsx`
- `src/components/SearchClearButton.test.tsx`

Tarefas:

1. Expor o atraso padrão de 500 ms.
2. Atualizar o valor somente depois do intervalo sem nova alteração.
3. Cancelar o timer na limpeza do efeito e quando o valor mudar.
4. Criar botão acessível, visível apenas para campos preenchidos, com a ação
   `Limpar busca`.
5. Testar valor inicial, atraso, cancelamento e limpeza do campo.

## 2. Padronizar componentes de busca

Arquivos:

- `src/components/SearchAndFilter/SearchAndFilter.tsx`
- `src/features/manage/members/components/MemberSearchPicker.tsx`
- `src/features/manage/members/components/RegisterMemberDialog.tsx`
- `src/features/manage/accounts/components/UnusedAccountRoleAssignmentSection.tsx`

Tarefas:

1. Substituir o timer local de `SearchAndFilter` pelo hook compartilhado.
2. Substituir o `useDeferredValue` do seletor de membro pelo debounce
   explícito, mantendo o mínimo de dois caracteres e os estados assíncronos.
3. Aplicar o debounce ao texto de busca de conta no cadastro direto de membro.
4. Substituir o timer de 300 ms do fluxo legado de tipos de acesso pelo hook
   compartilhado.
5. Adicionar `Limpar busca` aos campos de seleção e preservar seleção,
   limpeza, permissões, paginação e estados de erro.

## 3. Automatizar equipes e presença

Arquivos:

- `src/features/manage/oratorios/components/AttendanceRoster.tsx`
- `src/features/manage/oratorios/pages/OratorioAttendancePage.tsx`
- `src/features/manage/oratorios/components/OratorioTeamsSection.tsx`

Tarefas:

1. Remover o formulário e o botão `Buscar` de `AttendanceRoster`.
2. Fazer a página usar o valor debounced para `memberName` e
   `oratorianoName`, reiniciando as páginas quando o termo digitado mudar.
3. Remover estados e callbacks de submissão que só existiam para a busca
   explícita.
4. Remover o formulário e o botão `Buscar` do seletor de equipe.
5. Debouncear o termo do seletor e reiniciar a página ao mudar a busca.
6. Adicionar `Limpar busca` aos rosters e ao seletor de equipe.
7. Preservar cadastro rápido, marcação, paginação, permissões e estados
   loading/empty/error/forbidden.

## 4. Atualizar documentação

Arquivos:

- `docs/guides/user-facing-language.md`
- `docs/architecture/overview.md`

Tarefas:

1. Adicionar as diretrizes de clareza e consistência em seção própria.
2. Registrar o debounce de buscas de texto como comportamento atual.
3. Explicar a exceção das confirmações deliberadas antes de mutações.
4. Atualizar a descrição do componente compartilhado para abranger as
   buscas internas aplicáveis.

## 5. Verificação

Executar:

```sh
npm test
npm run lint
npm run build
git diff --check
```

O build baseline já apresenta um erro preexistente em
`src/features/manage/events/presentation.test.ts`: o fixture usa a propriedade
`code`, que não pertence ao tipo atual de localização. Esse erro deve ser
reportado separadamente se permanecer após a mudança.
