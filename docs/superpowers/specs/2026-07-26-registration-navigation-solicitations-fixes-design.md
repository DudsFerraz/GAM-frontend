# Ajustes de cadastro, navegação e solicitações

## Objetivo

Corrigir três comportamentos de interface sem alterar contratos do backend: validar
senhas curtas no cadastro, ocultar a navegação de Locais sem capacidade de consulta
e manter o pedido de participação disponível para uma conta visitante ainda não
vinculada a um membro.

## Comportamento

- O formulário de cadastro rejeita senhas com menos de oito caracteres e apresenta
  a mensagem em português junto ao campo de senha por meio do resolvedor Zod.
- A entrada `Locais` da navegação autenticada exige a permissão efetiva
  `GAM_LOCATION_GET`, tal como a própria tela exige para consulta.
- A ação de enviar nova solicitação continua indisponível para quem administra
  membros ou já possui uma solicitação aprovada com `memberId`. Para uma conta
  visitante sem esse vínculo, a ação permanece disponível; a API segue como a
  autoridade final caso a situação mude no servidor.
- A interface troca a palavra técnica/confusa “membresia” por “participação como
  membro” nos textos sob responsabilidade do frontend.

## Limites e verificação

As mudanças ficam em schemas, navegação e no recurso de solicitações. Não mudam
rotas, permissões do backend, DTOs ou o arquivo gerado. Testes focados protegerão
a regra de oito caracteres, a filtragem do item de navegação e a disponibilidade
da ação para visitante novo; a entrega executará testes, lint e build.
