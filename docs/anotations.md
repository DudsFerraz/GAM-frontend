Esse arquivo não sera posto no github nem gitignore, ele não é necessário para o funcionamento do projeto, mas serve como referência para anotações e informações importantes que podem ser úteis durante o desenvolvimento.

A API sobe localmente em:

http://localhost:8080

A porta é a padrão do Spring Boot (8080), pois o projeto não configura server.port. Não há prefixo global como /api; as rotas começam direto em /auth, /accounts etc.

Para iniciar no Windows PowerShell:

$bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET_KEY = [Convert]::ToBase64String($bytes)
.\mvnw.cmd -Pdev

Você precisa de:

- JDK 21
- Docker Desktop ligado — o perfil dev inicia PostgreSQL automaticamente
- A variável JWT_SECRET_KEY
- Banco local em localhost:5433 (PostgreSQL; não é a porta da API)

Autenticação:

1. Cadastre ou use uma conta em POST /auth/register.
2. Faça login em POST /auth/login:

{
"email": "giulia@gmail.com",
"password": "123456"
}

No perfil de desenvolvimento existem contas de fixture; todas usam senha 123456. O login retorna:

{ "token": "..." }

3. Para rotas protegidas, envie:

Authorization: Bearer SEU_TOKEN

A API também define um cookie refreshToken no login para POST /auth/refresh. Para clientes de navegador, login/refresh/logout usam proteção CSRF: envie o cookie XSRF-TOKEN e o header X-XSRF-TOKEN correspondente. O CORS local está
liberado para http://localhost:3000.

Rotas base atuais:

Base Endpoints
━━━━━━━━━━━━━━━━━━━━━━━━━━━ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/auth POST /register, /login, /refresh, /logout
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/accounts GET /{id}, POST /search
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/accounts/{accountId} GET /roles, POST /roles, PATCH /roles/{roleId}/drop, GET /role-assignments/{assignmentId}
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/members POST /, GET /{id}, POST /search, PATCH /{id}/activate, PATCH /{id}/deactivate, GET /{id}/presences
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/membership-solicitations POST /, GET /{id}, POST /search, PATCH /{id}/approve, PATCH /{id}/reject
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/events POST /, GET /{id}, POST /search, GET /{id}/presences
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/locations POST /, GET /{id}, GET /
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/roles GET /{roleId}, GET /{roleId}/permissions
─────────────────────────── ────────────────────────────────────────────────────────────────────────────────────────────────────
/permissions GET /{permissionId}

Exemplo:

curl http://localhost:8080/events/SEU_UUID

GET /events/{id} é público; quase todas as demais rotas exigem token e, além disso, permissões específicas. Não há Swagger/OpenAPI configurado atualmente, então não existe uma interface em /swagger-ui.
