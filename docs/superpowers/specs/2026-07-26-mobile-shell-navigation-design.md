# Ajuste da navegação móvel da aplicação

## Objetivo

Restaurar a visualização das páginas autenticadas em telas menores que o breakpoint `md`, onde a navegação lateral de desktop está sendo mostrada junto ao cabeçalho móvel e impede o conteúdo de ficar disponível.

## Comportamento aceito

- Em telas menores que `md`, a aplicação mostra somente o cabeçalho superior, com controle de tema, saída e botão para abrir ou fechar o menu.
- A navegação lateral, incluindo perfil e controles de recolhimento, é exclusiva de telas `md` ou maiores.
- O conteúdo do `Outlet` começa abaixo do cabeçalho móvel e mantém rolagem vertical independente, sem ser encoberto pela navegação.
- Em telas `md` ou maiores, a composição atual de barra lateral e conteúdo permanece inalterada.

## Implementação

O componente de navegação aplicará a visibilidade responsiva à barra lateral desktop. O layout continuará reservando espaço superior para o cabeçalho em telas móveis e aplicará o espaçamento somente nesse breakpoint. Não haverá alteração de rotas, autenticação, dados ou permissões.

## Verificação

Uma verificação de componente confirmará que os elementos de navegação carregam com as classes responsivas esperadas. A qualidade final inclui lint, testes e build do projeto.
